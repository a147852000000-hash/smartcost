package com.smartcostpro

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class FinanceDatabase(context: Context) : SQLiteOpenHelper(context, "smartcost_native.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""CREATE TABLE expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
            amount REAL NOT NULL CHECK(amount >= 0), type TEXT NOT NULL, category TEXT NOT NULL,
            date TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', payment_method TEXT NOT NULL DEFAULT 'unknown',
            created_at INTEGER NOT NULL)""")
        db.execSQL("""CREATE TABLE monthly_income (
            month TEXT PRIMARY KEY, salary REAL NOT NULL DEFAULT 0 CHECK(salary >= 0),
            bonuses REAL NOT NULL DEFAULT 0 CHECK(bonuses >= 0), other_income REAL NOT NULL DEFAULT 0 CHECK(other_income >= 0),
            other_note TEXT NOT NULL DEFAULT '')""")
        db.execSQL("""CREATE TABLE certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT, bank_name TEXT NOT NULL, certificate_number TEXT NOT NULL DEFAULT '',
            duration TEXT NOT NULL, amount REAL NOT NULL CHECK(amount > 0), annual_rate REAL NOT NULL DEFAULT 0,
            issue_date TEXT NOT NULL, maturity_date TEXT NOT NULL, profit_date TEXT NOT NULL,
            profit_amount REAL NOT NULL DEFAULT 0 CHECK(profit_amount >= 0), frequency TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '')""")
        db.execSQL("CREATE INDEX expenses_month_type_idx ON expenses(date,type)")
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Use explicit forward-only migrations for future schema versions; never drop user finance data.
    }
    fun addExpense(x: ExpenseRecord): Long {
        require(x.title.isNotBlank()) { "عنوان المصروف مطلوب" }; require(x.amount >= 0) { "المبلغ لا يمكن أن يكون سالبًا" }
        val v = ContentValues().apply { put("title",x.title.trim()); put("amount",x.amount); put("type",x.type); put("category",x.category); put("date",x.date); put("notes",x.notes); put("payment_method",x.paymentMethod); put("created_at",x.createdAt) }
        return writableDatabase.insertOrThrow("expenses",null,v)
    }
    fun updateExpense(x: ExpenseRecord): Int {
        require(x.id > 0 && x.title.isNotBlank() && x.amount >= 0)
        val v = ContentValues().apply { put("title",x.title.trim()); put("amount",x.amount); put("type",x.type); put("category",x.category); put("date",x.date); put("notes",x.notes); put("payment_method",x.paymentMethod) }
        return writableDatabase.update("expenses",v,"id=?",arrayOf(x.id.toString()))
    }
    fun deleteExpense(id: Long): Int = writableDatabase.delete("expenses","id=?",arrayOf(id.toString()))
    fun expenses(month: String? = null, type: String? = null): List<ExpenseRecord> {
        val clauses = mutableListOf<String>(); val args = mutableListOf<String>()
        if (!month.isNullOrBlank()) { clauses += "substr(date,1,7)=?"; args += month }
        if (!type.isNullOrBlank()) { clauses += "type=?"; args += type }
        val where = if (clauses.isEmpty()) "" else " WHERE " + clauses.joinToString(" AND ")
        val result = mutableListOf<ExpenseRecord>()
        readableDatabase.rawQuery("SELECT id,title,amount,type,category,date,notes,payment_method,created_at FROM expenses$where ORDER BY date DESC,id DESC",args.toTypedArray()).use { c ->
            while (c.moveToNext()) result += ExpenseRecord(c.getLong(0),c.getString(1),c.getDouble(2),c.getString(3),c.getString(4),c.getString(5),c.getString(6),c.getString(7),c.getLong(8))
        }
        return result
    }
    fun saveIncome(x: MonthlyIncomeRecord) {
        require(x.salary >= 0 && x.bonuses >= 0 && x.otherIncome >= 0)
        val v = ContentValues().apply { put("month",x.month); put("salary",x.salary); put("bonuses",x.bonuses); put("other_income",x.otherIncome); put("other_note",x.otherNote) }
        writableDatabase.insertWithOnConflict("monthly_income",null,v,SQLiteDatabase.CONFLICT_REPLACE)
    }
    fun incomes(): List<MonthlyIncomeRecord> {
        val result = mutableListOf<MonthlyIncomeRecord>()
        readableDatabase.rawQuery("SELECT month,salary,bonuses,other_income,other_note FROM monthly_income ORDER BY month DESC",null).use { c ->
            while (c.moveToNext()) result += MonthlyIncomeRecord(c.getString(0),c.getDouble(1),c.getDouble(2),c.getDouble(3),c.getString(4))
        }; return result
    }
    fun addCertificate(x: CertificateRecord): Long {
        require(x.bankName.isNotBlank() && x.amount > 0 && x.profitAmount >= 0)
        return writableDatabase.insertOrThrow("certificates",null,certificateValues(x))
    }
    fun updateCertificate(x: CertificateRecord): Int {
        require(x.id > 0 && x.bankName.isNotBlank() && x.amount > 0 && x.profitAmount >= 0)
        return writableDatabase.update("certificates",certificateValues(x),"id=?",arrayOf(x.id.toString()))
    }
    private fun certificateValues(x: CertificateRecord) = ContentValues().apply {
        put("bank_name",x.bankName.trim()); put("certificate_number",x.certificateNumber); put("duration",x.duration)
        put("amount",x.amount); put("annual_rate",x.annualRate); put("issue_date",x.issueDate); put("maturity_date",x.maturityDate)
        put("profit_date",x.profitDate); put("profit_amount",x.profitAmount); put("frequency",x.frequency.name); put("notes",x.notes)
    }
    fun deleteCertificate(id: Long): Int = writableDatabase.delete("certificates","id=?",arrayOf(id.toString()))
    fun certificates(): List<CertificateRecord> {
        val result = mutableListOf<CertificateRecord>()
        readableDatabase.rawQuery("SELECT id,bank_name,certificate_number,duration,amount,annual_rate,issue_date,maturity_date,profit_date,profit_amount,frequency,notes FROM certificates ORDER BY issue_date DESC",null).use { c ->
            while (c.moveToNext()) result += CertificateRecord(c.getLong(0),c.getString(1),c.getString(2),c.getString(3),c.getDouble(4),c.getDouble(5),c.getString(6),c.getString(7),c.getString(8),c.getDouble(9),runCatching { ProfitFrequency.valueOf(c.getString(10)) }.getOrDefault(ProfitFrequency.MONTHLY),c.getString(11))
        }; return result
    }
    fun monthlyExpenseTotal(month: String): Double = expenses(month).sumOf { it.amount }
}
