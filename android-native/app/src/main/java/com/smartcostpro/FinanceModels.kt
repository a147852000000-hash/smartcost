package com.smartcostpro

import java.time.YearMonth
import java.util.Locale
import kotlin.math.round

enum class FinanceSection(val label: String, val type: String) {
    HOUSE("المنزل", "house"), MEDICAL("الطب والعلاج", "medical"), WORK("العمل", "work"),
    PERSONAL("الشخصي والجمعيات", "personal"), VEHICLE_FUEL("وقود السيارة", "vehicle_fuel"),
    VEHICLE_MAINT("صيانة السيارة", "vehicle_maint"), VEHICLE_OIL("الزيوت والفلاتر", "vehicle_oil"),
    STUDENT("التعليم", "student")
}
data class ExpenseRecord(
    val id: Long = 0, val title: String, val amount: Double, val type: String,
    val category: String, val date: String, val notes: String = "",
    val paymentMethod: String = "unknown", val createdAt: Long = System.currentTimeMillis()
)
data class MonthlyIncomeRecord(val month: String, val salary: Double, val bonuses: Double, val otherIncome: Double, val otherNote: String = "") {
    val total: Double get() = salary + bonuses + otherIncome
}
enum class ProfitFrequency(val label: String) {
    MONTHLY("شهري"), QUARTERLY("ربع سنوي"), SEMIANNUAL("نصف سنوي"), ANNUAL("سنوي"), MATURITY("عند الاستحقاق")
}
data class CertificateRecord(
    val id: Long = 0, val bankName: String, val certificateNumber: String = "", val duration: String,
    val amount: Double, val annualRate: Double = 0.0, val issueDate: String, val maturityDate: String,
    val profitDate: String, val profitAmount: Double, val frequency: ProfitFrequency, val notes: String = ""
)
data class CertificateProfit(val annual: Double, val periodic: Double, val monthlyEquivalent: Double)

object FinanceCalculations {
    fun currentMonth(): String = YearMonth.now().toString()
    fun money(value: Double, currency: String = "EGP"): String = String.format(Locale.US, "%,.2f %s", value, currency)
    fun isInMonth(date: String, month: String): Boolean = date.take(7) == month
    fun durationYears(duration: String): Double {
        val number = Regex("""(\d+(?:\.\d+)?)""").find(duration)?.value?.toDoubleOrNull() ?: return 1.0
        return if (duration.contains("شهر") || duration.contains("month", true)) number / 12.0 else number
    }
    fun certificateProfit(amount: Double, annualRate: Double, frequency: ProfitFrequency, duration: String): CertificateProfit {
        if (amount <= 0.0 || annualRate <= 0.0) return CertificateProfit(0.0, 0.0, 0.0)
        val annual = amount * annualRate / 100.0
        val years = durationYears(duration)
        val periodic = when (frequency) {
            ProfitFrequency.MONTHLY -> annual / 12.0
            ProfitFrequency.QUARTERLY -> annual / 4.0
            ProfitFrequency.SEMIANNUAL -> annual / 2.0
            ProfitFrequency.ANNUAL -> annual
            ProfitFrequency.MATURITY -> annual * years
        }
        val monthly = if (frequency == ProfitFrequency.MATURITY) annual * years / maxOf(1.0, years * 12.0) else annual / 12.0
        return CertificateProfit(round(annual * 100) / 100, round(periodic * 100) / 100, round(monthly * 100) / 100)
    }
    fun certificateMonthlyProfit(c: CertificateRecord, targetMonth: String): Double {
        val start = c.issueDate.take(7); val end = c.maturityDate.take(7)
        if (start.length == 7 && end.length == 7 && (targetMonth < start || targetMonth > end)) return 0.0
        if (c.annualRate > 0 && c.amount > 0) return certificateProfit(c.amount, c.annualRate, c.frequency, c.duration).monthlyEquivalent
        return when (c.frequency) {
            ProfitFrequency.MONTHLY -> c.profitAmount
            ProfitFrequency.QUARTERLY -> c.profitAmount / 3
            ProfitFrequency.SEMIANNUAL -> c.profitAmount / 6
            ProfitFrequency.ANNUAL, ProfitFrequency.MATURITY -> c.profitAmount / 12
        }
    }
}
