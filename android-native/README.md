# SMART-COST Native Android

Native Kotlin + Jetpack Compose project, independent from the React/Vite preview. Open the `android-native` folder in Android Studio and let Gradle sync.

## Current implementation
- Android application module, package `com.smartcostpro`, min SDK 26, Java 17, Compose Material 3.
- Device-local SQLite persistence for expense records, monthly salary/bonus/other income, and bank certificates.
- Expense categories preserved by type: `house`, `medical`, `work`, `personal`, `vehicle_fuel`, `vehicle_maint`, `vehicle_oil`, `student`.
- Month-based totals, dashboard, expense add/delete, monthly income, certificate profit calculations, and finance summary.
- The app starts directly into its native UI. It does not use a WebView.

## Important conversion status
This is the first native implementation stage, not a claim that every original feature has been migrated. The React source remains intact as the reference. Pending parity work includes student profiles and detailed education records, associations/rotating savings, vehicle maintenance/fuel/oil/accident detail forms, income-source ledger and current-account movements, full edit flows, CSV/Excel/print reports, and validated backup/restore. Authentication and server sync are intentionally not represented as live: the existing web repo documents that auth/ownership are not ready. Do not connect financial API endpoints publicly before authentication and authorization are implemented.

## Verification
No Android Gradle build or emulator/device test has been run from this connector. Treat compilation and runtime as unverified until Gradle sync/build and real-device testing succeed.
