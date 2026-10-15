# Screens and feature boundaries

## Preserved finance screens
- Expenses view and finance dashboard.
- Household and medical expenses.
- Work and personal expenses, including associations.
- Vehicle fuel, maintenance, oil, and related expense records.
- Education expenses and student expense categories (not a separate education application).
- Monthly income, bank certificates, financial reports, exports, and print views.
- Arabic/English UI, RTL, light/dark presentation, and currency selector.

## Removed boundaries
- Main multi-product dashboard and live ticker.
- Standalone education and vehicle-management applications, and wallet.
- AI, notes, calculator, trips, chat, religious features, vault, media, sports, and calendar.
- Vehicle camera no longer stores files in a separate secure vault.

## Migration/verification status
The original finance view components have been copied into this repository. A finance-only service layer and SQLite API were added. The UI/API contract and runtime behavior have not yet been validated by a successful build or executed integration test. No production deployment was performed.
