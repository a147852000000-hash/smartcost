package com.smartcostpro

import android.os.Bundle
import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.time.YearMonth

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { SmartCostTheme { SmartCostApp() } } }
}
private enum class MainTab(val title: String) { DASHBOARD("الرئيسية"), EXPENSES("المصروفات"), INCOME("الدخل"), CERTIFICATES("الشهادات"), REPORTS("التقارير") }

@Composable private fun SmartCostTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = darkColorScheme(primary = androidx.compose.ui.graphics.Color(0xFFF2B84B), secondary = androidx.compose.ui.graphics.Color(0xFF66CDAA), background = androidx.compose.ui.graphics.Color(0xFF0D1117), surface = androidx.compose.ui.graphics.Color(0xFF161B22)), content = content)
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun SmartCostApp() {
    val context = LocalContext.current
    val db = remember { FinanceDatabase(context.applicationContext) }
    var tab by remember { mutableStateOf(MainTab.DASHBOARD) }
    var month by remember { mutableStateOf(FinanceCalculations.currentMonth()) }
    var refresh by remember { mutableIntStateOf(0) }
    var showAddExpense by remember { mutableStateOf(false) }
    var editingExpense by remember { mutableStateOf<ExpenseRecord?>(null) }
    var message by remember { mutableStateOf("") }
    val expenses = remember(month, refresh) { db.expenses(month) }
    val incomes = remember(refresh) { db.incomes() }
    val certificates = remember(refresh) { db.certificates() }
    val income = incomes.firstOrNull { it.month == month }?.total ?: 0.0
    val certProfit = certificates.sumOf { FinanceCalculations.certificateMonthlyProfit(it, month) }
    val expenseTotal = expenses.sumOf { it.amount }
    val balance = income + certProfit - expenseTotal
    Scaffold(topBar = {
        TopAppBar(title = { Column { Text("SMART-COST", fontWeight = FontWeight.Black); Text("إدارة المصروفات والدخل", style = MaterialTheme.typography.labelSmall) } },
            actions = { TextButton(onClick = { month = runCatching { YearMonth.parse(month).minusMonths(1).toString() }.getOrDefault(month) }) { Text("◀") }; Text(month); TextButton(onClick = { month = runCatching { YearMonth.parse(month).plusMonths(1).toString() }.getOrDefault(month) }) { Text("▶") } })
    }, bottomBar = { NavigationBar { MainTab.entries.forEach { item ->
        NavigationBarItem(selected = tab == item, onClick = { tab = item }, icon = { Icon(when(item) {
            MainTab.DASHBOARD -> Icons.Default.Home; MainTab.EXPENSES -> Icons.Default.ReceiptLong
            MainTab.INCOME -> Icons.Default.Payments; MainTab.CERTIFICATES -> Icons.Default.AccountBalance
            MainTab.REPORTS -> Icons.Default.BarChart
        }, contentDescription = item.title) }, label = { Text(item.title) })
    } } }, floatingActionButton = { if (tab == MainTab.EXPENSES || tab == MainTab.DASHBOARD) FloatingActionButton(onClick = { editingExpense = null; showAddExpense = true }) { Icon(Icons.Default.Add, "إضافة مصروف") } }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp)) {
            if (message.isNotBlank()) Text(message, color = MaterialTheme.colorScheme.secondary, modifier = Modifier.padding(vertical = 6.dp))
            when(tab) {
                MainTab.DASHBOARD -> DashboardScreen(month,income,certProfit,expenseTotal,balance,expenses.take(5),{ tab = MainTab.EXPENSES },{ editingExpense = it; showAddExpense = true })
                MainTab.EXPENSES -> ExpensesScreen(month,expenses,{ editingExpense = null; showAddExpense = true },{ editingExpense = it; showAddExpense = true },{ db.deleteExpense(it); refresh++; message = "تم حذف المصروف" })
                MainTab.INCOME -> IncomeScreen(month,incomes,{ db.saveIncome(it); refresh++; message = "تم حفظ الدخل الشهري" })
                MainTab.CERTIFICATES -> CertificatesScreen(certificates,month,{ item -> runCatching { if (item.id > 0) db.updateCertificate(item) else db.addCertificate(item) }.onSuccess { refresh++; message = if (item.id > 0) "تم تحديث الشهادة" else "تم حفظ الشهادة" } .onFailure { message = it.message ?: "تعذر حفظ الشهادة" } },{ db.deleteCertificate(it); refresh++; message = "تم حذف الشهادة" })
                MainTab.REPORTS -> ReportsScreen(month,income,certProfit,expenses,balance,certificates.sumOf { it.amount })
            }
        }
    }
    if (showAddExpense) AddExpenseDialog(initial = editingExpense, onDismiss = { showAddExpense = false; editingExpense = null }, onSave = { item ->
        runCatching { if (item.id > 0) db.updateExpense(item) else db.addExpense(item) }
            .onSuccess { showAddExpense = false; editingExpense = null; refresh++; message = if (item.id > 0) "تم تحديث المصروف" else "تم حفظ المصروف" }
            .onFailure { message = it.message ?: "تعذر حفظ المصروف" }
    })
}
@Composable private fun MetricCard(title: String,value: String,modifier: Modifier = Modifier) {
    ElevatedCard(modifier) { Column(Modifier.padding(14.dp)) { Text(title,style=MaterialTheme.typography.labelMedium,color=MaterialTheme.colorScheme.onSurfaceVariant); Spacer(Modifier.height(6.dp)); Text(value,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold) } }
}
@Composable private fun DashboardScreen(month:String,income:Double,profit:Double,expenses:Double,balance:Double,recent:List<ExpenseRecord>,onOpen:()->Unit,onEdit:(ExpenseRecord)->Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(12.dp)) {
        Spacer(Modifier.height(8.dp)); Text("ملخص الشهر",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold); Text(month,color=MaterialTheme.colorScheme.primary)
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) { MetricCard("الدخل الأساسي",FinanceCalculations.money(income),Modifier.weight(1f)); MetricCard("أرباح الشهادات",FinanceCalculations.money(profit),Modifier.weight(1f)) }
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)) { MetricCard("المصروفات",FinanceCalculations.money(expenses),Modifier.weight(1f)); MetricCard("الصافي",FinanceCalculations.money(balance),Modifier.weight(1f)) }
        Button(onClick=onOpen,modifier=Modifier.fillMaxWidth()) { Text("فتح المصروفات") }
        Text("أحدث المصروفات",fontWeight=FontWeight.Bold)
        if(recent.isEmpty()) Text("لا توجد مصروفات مسجلة لهذا الشهر")
        recent.forEach { item -> ExpenseRow(item,{ onEdit(item) },{}) }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun ExpensesScreen(month:String,expenses:List<ExpenseRecord>,onAdd:()->Unit,onEdit:(ExpenseRecord)->Unit,onDelete:(Long)->Unit) {
    var selectedType by remember(month) { mutableStateOf("all") }
    var filterExpanded by remember { mutableStateOf(false) }
    val visibleExpenses = remember(expenses, selectedType) {
        FinanceCalculations.filterExpenses(expenses, selectedType)
    }
    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().padding(vertical=8.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
            Text("مصروفات $month",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
            Text(FinanceCalculations.money(visibleExpenses.sumOf { it.amount }),color=MaterialTheme.colorScheme.primary)
        }
        ExposedDropdownMenuBox(expanded=filterExpanded,onExpandedChange={filterExpanded=!filterExpanded}) {
            OutlinedTextField(
                value = if (selectedType == "all") "كل الأقسام" else FinanceSection.entries.firstOrNull { it.type == selectedType }?.label ?: "كل الأقسام",
                onValueChange = {},
                readOnly = true,
                label = { Text("تصفية حسب القسم") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(filterExpanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth()
            )
            ExposedDropdownMenu(expanded=filterExpanded,onDismissRequest={filterExpanded=false}) {
                DropdownMenuItem(text={Text("كل الأقسام")},onClick={selectedType="all";filterExpanded=false})
                FinanceSection.entries.forEach { section ->
                    DropdownMenuItem(text={Text(section.label)},onClick={selectedType=section.type;filterExpanded=false})
                }
            }
        }
        if(visibleExpenses.isEmpty()) Text(if (selectedType == "all") "لا توجد مصروفات لهذا الشهر" else "لا توجد مصروفات في القسم المحدد",modifier=Modifier.padding(8.dp))
        LazyColumn(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(8.dp),contentPadding=PaddingValues(bottom=12.dp)) {
            items(visibleExpenses,key={it.id}) { item -> ExpenseRow(item,{ onEdit(item) },{ onDelete(item.id) }) }
        }
        Button(onClick=onAdd,modifier=Modifier.fillMaxWidth()) { Text("إضافة مصروف") }
    }
}
@Composable private fun ExpenseRow(item:ExpenseRecord,onEdit:()->Unit,onDelete:()->Unit) {
    ElevatedCard(Modifier.fillMaxWidth()) { Row(Modifier.fillMaxWidth().padding(12.dp),verticalAlignment=Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { Text(item.title,fontWeight=FontWeight.Bold); Text("${item.category} • ${item.date}",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant); if(item.notes.isNotBlank()) Text(item.notes,style=MaterialTheme.typography.bodySmall) }
        Column(horizontalAlignment=Alignment.End) { Text(FinanceCalculations.money(item.amount),color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold); Row { TextButton(onClick=onEdit) { Text("تعديل") }; TextButton(onClick=onDelete) { Text("حذف",color=MaterialTheme.colorScheme.error) } } }
    } }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun AddExpenseDialog(initial:ExpenseRecord?,onDismiss:()->Unit,onSave:(ExpenseRecord)->Unit) {
    var title by remember(initial) { mutableStateOf(initial?.title ?: "") }; var amount by remember(initial) { mutableStateOf(initial?.amount?.toString() ?: "") }
    var category by remember(initial) { mutableStateOf(FinanceSection.entries.firstOrNull { it.type == initial?.type } ?: FinanceSection.HOUSE) }; var date by remember(initial) { mutableStateOf(initial?.date ?: LocalDate.now().toString()) }
    var notes by remember(initial) { mutableStateOf(initial?.notes ?: "") }; var payment by remember(initial) { mutableStateOf(initial?.paymentMethod ?: "unknown") }; var expanded by remember { mutableStateOf(false) }
    AlertDialog(onDismissRequest=onDismiss,title={Text(if (initial == null) "إضافة مصروف" else "تعديل المصروف")},text={
        Column(Modifier.heightIn(max=520.dp).verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(title,{title=it},label={Text("البيان")},singleLine=true)
            OutlinedTextField(amount,{amount=it},label={Text("المبلغ")},singleLine=true)
            ExposedDropdownMenuBox(expanded=expanded,onExpandedChange={expanded=!expanded}) {
                OutlinedTextField(category.label,{},readOnly=true,label={Text("القسم")},trailingIcon={ExposedDropdownMenuDefaults.TrailingIcon(expanded)},modifier=Modifier.menuAnchor().fillMaxWidth())
                ExposedDropdownMenu(expanded=expanded,onDismissRequest={expanded=false}) { FinanceSection.entries.forEach { s -> DropdownMenuItem(text={Text(s.label)},onClick={category=s;expanded=false}) } }
            }
            OutlinedTextField(date,{date=it},label={Text("التاريخ YYYY-MM-DD")},singleLine=true)
            OutlinedTextField(notes,{notes=it},label={Text("ملاحظات")})
            OutlinedTextField(payment,{payment=it},label={Text("طريقة الدفع")},singleLine=true)
        }
    },confirmButton={ Button(onClick={
        val value=amount.toDoubleOrNull()
        if(title.isNotBlank() && value!=null && value>=0 && runCatching { LocalDate.parse(date) }.isSuccess)
            onSave(ExpenseRecord(id=initial?.id ?: 0,title=title,amount=value,type=category.type,category=category.label,date=date,notes=notes,paymentMethod=payment,createdAt=initial?.createdAt ?: System.currentTimeMillis()))
    }) { Text(if (initial == null) "حفظ" else "حفظ التعديلات") } },dismissButton={TextButton(onClick=onDismiss){Text("إلغاء")}})
}
@Composable private fun IncomeScreen(month:String,incomes:List<MonthlyIncomeRecord>,onSave:(MonthlyIncomeRecord)->Unit) {
    val current=incomes.firstOrNull { it.month==month }
    var salary by remember(month,current) { mutableStateOf(current?.salary?.toString() ?: "") }
    var bonuses by remember(month,current) { mutableStateOf(current?.bonuses?.toString() ?: "") }
    var other by remember(month,current) { mutableStateOf(current?.otherIncome?.toString() ?: "") }
    var note by remember(month,current) { mutableStateOf(current?.otherNote ?: "") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(10.dp)) {
        Text("الدخل الشهري • $month",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
        OutlinedTextField(salary,{salary=it},label={Text("الراتب")},singleLine=true); OutlinedTextField(bonuses,{bonuses=it},label={Text("المكافآت")},singleLine=true)
        OutlinedTextField(other,{other=it},label={Text("دخل آخر")},singleLine=true); OutlinedTextField(note,{note=it},label={Text("تفاصيل الدخل الآخر")})
        MetricCard("إجمالي الدخل",FinanceCalculations.money((salary.toDoubleOrNull()?:0.0)+(bonuses.toDoubleOrNull()?:0.0)+(other.toDoubleOrNull()?:0.0)),Modifier.fillMaxWidth())
        Button(onClick={ val s=salary.toDoubleOrNull()?:0.0; val b=bonuses.toDoubleOrNull()?:0.0; val o=other.toDoubleOrNull()?:0.0; if(s>=0&&b>=0&&o>=0) onSave(MonthlyIncomeRecord(month,s,b,o,note)) },modifier=Modifier.fillMaxWidth()){Text("حفظ الدخل")}
        Text("السجلات السابقة",fontWeight=FontWeight.Bold); incomes.forEach { Text("${it.month} — ${FinanceCalculations.money(it.total)}") }
    }
}
@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun CertificatesScreen(certificates:List<CertificateRecord>,month:String,onSave:(CertificateRecord)->Unit,onDelete:(Long)->Unit) {
    var editingId by remember { mutableLongStateOf(0L) }
    var bank by remember { mutableStateOf("") }; var number by remember { mutableStateOf("") }; var duration by remember { mutableStateOf("1 سنة") }
    var amount by remember { mutableStateOf("") }; var rate by remember { mutableStateOf("") }
    var issue by remember { mutableStateOf(LocalDate.now().toString()) }; var maturity by remember { mutableStateOf(LocalDate.now().plusYears(1).toString()) }
    var profitDate by remember { mutableStateOf(LocalDate.now().toString()) }; var profitAmount by remember { mutableStateOf("") }
    var frequency by remember { mutableStateOf(ProfitFrequency.MONTHLY) }; var notes by remember { mutableStateOf("") }; var expanded by remember { mutableStateOf(false) }
    val preview=FinanceCalculations.certificateProfit(amount.toDoubleOrNull()?:0.0,rate.toDoubleOrNull()?:0.0,frequency,duration)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(8.dp)) {
        Text("الشهادات البنكية",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
        MetricCard("إجمالي قيمة الشهادات",FinanceCalculations.money(certificates.sumOf { it.amount }),Modifier.fillMaxWidth())
        OutlinedTextField(bank,{bank=it},label={Text("اسم البنك")},singleLine=true); OutlinedTextField(number,{number=it},label={Text("رقم الشهادة اختياري")},singleLine=true)
        OutlinedTextField(duration,{duration=it},label={Text("مدة الشهادة")},singleLine=true); OutlinedTextField(amount,{amount=it},label={Text("قيمة الشهادة")},singleLine=true)
        OutlinedTextField(rate,{rate=it},label={Text("العائد السنوي %")},singleLine=true)
        OutlinedTextField(issue,{issue=it},label={Text("تاريخ الإصدار YYYY-MM-DD")},singleLine=true); OutlinedTextField(maturity,{maturity=it},label={Text("تاريخ الاستحقاق YYYY-MM-DD")},singleLine=true)
        OutlinedTextField(profitDate,{profitDate=it},label={Text("تاريخ نزول الأرباح YYYY-MM-DD")},singleLine=true); OutlinedTextField(profitAmount,{profitAmount=it},label={Text("قيمة الأرباح لكل دورية")},singleLine=true)
        ExposedDropdownMenuBox(expanded=expanded,onExpandedChange={expanded=!expanded}) {
            OutlinedTextField(frequency.label,{},readOnly=true,label={Text("دورية الأرباح")},trailingIcon={ExposedDropdownMenuDefaults.TrailingIcon(expanded)},modifier=Modifier.menuAnchor().fillMaxWidth())
            ExposedDropdownMenu(expanded=expanded,onDismissRequest={expanded=false}) { ProfitFrequency.entries.forEach { f -> DropdownMenuItem(text={Text(f.label)},onClick={frequency=f;expanded=false}) } }
        }
        Text("العائد السنوي: ${FinanceCalculations.money(preview.annual)}")
        Text("العائد الدوري: ${FinanceCalculations.money(preview.periodic)}")
        Text("المكافئ الشهري: ${FinanceCalculations.money(preview.monthlyEquivalent)}",color=MaterialTheme.colorScheme.primary)
        OutlinedTextField(notes,{notes=it},label={Text("ملاحظات")})
        Button(onClick={
            val a=amount.toDoubleOrNull()?:0.0; val p=profitAmount.toDoubleOrNull()?:preview.periodic
            if(bank.isNotBlank()&&duration.isNotBlank()&&a>0&&p>=0&&runCatching { LocalDate.parse(issue) }.isSuccess&&runCatching { LocalDate.parse(maturity) }.isSuccess&&runCatching { LocalDate.parse(profitDate) }.isSuccess) {
                onSave(CertificateRecord(id=editingId,bankName=bank,certificateNumber=number,duration=duration,amount=a,annualRate=rate.toDoubleOrNull()?:0.0,issueDate=issue,maturityDate=maturity,profitDate=profitDate,profitAmount=p,frequency=frequency,notes=notes))
                editingId=0L; bank="";number="";duration="1 سنة";amount="";rate="";profitAmount="";notes=""
            }
        },modifier=Modifier.fillMaxWidth()){Text(if(editingId==0L) "حفظ الشهادة" else "حفظ تعديلات الشهادة")}
        certificates.forEach { c -> ElevatedCard(Modifier.fillMaxWidth()) { Row(Modifier.padding(12.dp),verticalAlignment=Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) { Text(c.bankName,fontWeight=FontWeight.Bold); Text("${c.duration} • ${FinanceCalculations.money(c.amount)}"); Text("العائد الشهري: ${FinanceCalculations.money(FinanceCalculations.certificateMonthlyProfit(c,month))}",color=MaterialTheme.colorScheme.primary) }
            Column { TextButton(onClick={ editingId=c.id; bank=c.bankName; number=c.certificateNumber; duration=c.duration; amount=c.amount.toString(); rate=c.annualRate.toString(); issue=c.issueDate; maturity=c.maturityDate; profitDate=c.profitDate; profitAmount=c.profitAmount.toString(); frequency=c.frequency; notes=c.notes }){Text("تعديل")}; TextButton(onClick={onDelete(c.id)}){Text("حذف",color=MaterialTheme.colorScheme.error)} }
        } } }
    }
}
@Composable private fun ReportsScreen(month:String,income:Double,profit:Double,expenses:List<ExpenseRecord>,balance:Double,certificateValue:Double) {
    val context = LocalContext.current
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(10.dp)) {
        Text("التقرير المالي • $month",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
        MetricCard("إجمالي الدخل الأساسي",FinanceCalculations.money(income),Modifier.fillMaxWidth())
        MetricCard("أرباح الشهادات",FinanceCalculations.money(profit),Modifier.fillMaxWidth())
        MetricCard("إجمالي المصروفات",FinanceCalculations.money(expenses.sumOf { it.amount }),Modifier.fillMaxWidth())
        MetricCard("صافي الشهر",FinanceCalculations.money(balance),Modifier.fillMaxWidth())
        MetricCard("قيمة الشهادات",FinanceCalculations.money(certificateValue),Modifier.fillMaxWidth())
        Text("المصروفات حسب القسم",fontWeight=FontWeight.Bold)
        FinanceSection.entries.forEach { section ->
            Row(Modifier.fillMaxWidth().padding(vertical=5.dp),horizontalArrangement=Arrangement.SpaceBetween) { Text(section.label); Text(FinanceCalculations.money(expenses.filter { it.type==section.type }.sumOf { it.amount }),color=MaterialTheme.colorScheme.primary) }
            HorizontalDivider()
        }
        Button(onClick = {
            val csv = buildString {
                appendLine("date,title,type,category,amount,payment_method,notes")
                expenses.forEach { item ->
                    fun cell(value: String) = "\"" + value.replace("\"", "\"\"") + "\""
                    appendLine(listOf(item.date,cell(item.title),cell(item.type),cell(item.category),item.amount.toString(),cell(item.paymentMethod),cell(item.notes)).joinToString(","))
                }
            }
            val intent = Intent(Intent.ACTION_SEND).apply { type = "text/csv"; putExtra(Intent.EXTRA_SUBJECT, "SMART-COST $month"); putExtra(Intent.EXTRA_TEXT, csv) }
            context.startActivity(Intent.createChooser(intent, "تصدير تقرير المصروفات"))
        }, modifier = Modifier.fillMaxWidth()) { Text("تصدير المصروفات CSV") }
        Text("تُحفظ البيانات محليًا على الجهاز باستخدام SQLite.",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
