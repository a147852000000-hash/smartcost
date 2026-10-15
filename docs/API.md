# SMARTCOST API

All routes are prefixed with `/api`. JSON request and response bodies use UTF-8. This is an initial contract; authorization and per-user data isolation must be implemented before exposing the service to the internet.

## Health
- `GET /api/health` — liveness only; no secrets or database contents.

## Expenses
- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

Expense records: `id`, `title`, `amount`, `category`, `date`, optional `notes`, `createdAt`, `updatedAt`.

## Monthly income
- `GET /api/income`
- `PUT /api/income/:month` — upsert one monthly record.

Fields: `month`, `salary`, `bonuses`, `otherIncome`, optional `otherIncomeNote`.

## Bank certificates
- `GET /api/certificates`
- `POST /api/certificates`
- `PUT /api/certificates/:id`
- `DELETE /api/certificates/:id`

Fields include bank name, optional certificate number, duration, amount, issue/maturity/profit dates, profit amount/frequency, and optional notes.

## Backup
- `GET /api/backup` exports only expenses, monthly income, and bank certificates.
- `POST /api/backup/restore` validates the entire payload before replacing these three financial collections in a single database transaction.

## Security gate before deployment
This initial scaffold has no authentication yet. Do not expose personal financial endpoints publicly until authentication, authorization, input validation, rate limits, and per-user ownership boundaries are implemented and tested.
