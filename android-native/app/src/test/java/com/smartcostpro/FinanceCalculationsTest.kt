package com.smartcostpro

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FinanceCalculationsTest {
    @Test fun monthFilterUsesFirstSevenCharacters() {
        assertTrue(FinanceCalculations.isInMonth("2026-10-03", "2026-10"))
        assertFalse(FinanceCalculations.isInMonth("2026-09-30", "2026-10"))
    }

    @Test fun expenseFilterReturnsOnlySelectedSectionAndAllForAll() {
        val expenses = listOf(
            ExpenseRecord(id = 1, title = "Groceries", amount = 100.0, type = "house", category = "المنزل", date = "2026-10-01"),
            ExpenseRecord(id = 2, title = "Fuel", amount = 250.0, type = "vehicle_fuel", category = "وقود السيارة", date = "2026-10-02")
        )
        assertEquals(listOf(2L), FinanceCalculations.filterExpenses(expenses, "vehicle_fuel").map { it.id })
        assertEquals(2, FinanceCalculations.filterExpenses(expenses, "all").size)
        assertEquals(2, FinanceCalculations.filterExpenses(expenses, null).size)
    }

    @Test fun incomeTotalAddsAllIncomeSources() {
        assertEquals(17500.0, MonthlyIncomeRecord("2026-10", 12000.0, 2500.0, 3000.0).total, 0.001)
    }

    @Test fun certificateAnnualAndMonthlyProfitAreCalculated() {
        val result = FinanceCalculations.certificateProfit(100000.0, 18.0, ProfitFrequency.MONTHLY, "1 سنة")
        assertEquals(18000.0, result.annual, 0.001)
        assertEquals(1500.0, result.periodic, 0.001)
        assertEquals(1500.0, result.monthlyEquivalent, 0.001)
    }

    @Test fun quarterlyProfitIsOneQuarterOfAnnualProfit() {
        val result = FinanceCalculations.certificateProfit(50000.0, 12.0, ProfitFrequency.QUARTERLY, "2 سنة")
        assertEquals(6000.0, result.annual, 0.001)
        assertEquals(1500.0, result.periodic, 0.001)
        assertEquals(500.0, result.monthlyEquivalent, 0.001)
    }

    @Test fun certificatesOutsideTheirActiveDatesDoNotCount() {
        val certificate = CertificateRecord(
            bankName = "Test", duration = "3 سنوات", amount = 10000.0, annualRate = 10.0,
            issueDate = "2025-01-01", maturityDate = "2027-12-31", profitDate = "2025-02-01",
            profitAmount = 100.0, frequency = ProfitFrequency.MONTHLY
        )
        assertEquals(0.0, FinanceCalculations.certificateMonthlyProfit(certificate, "2028-01"), 0.001)
        assertEquals(100.0 / 12.0 * 10.0, FinanceCalculations.certificateMonthlyProfit(certificate, "2026-06"), 0.001)
    }
}
