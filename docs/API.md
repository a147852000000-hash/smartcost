# SMARTCOST API

All endpoints use JSON and the `/api` prefix. This API is for local development only until authentication and per-user ownership are implemented.

## Health
- `GET /api/health`

## Expenses
- `GET /api/expenses`
- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

Expense type must be one of: `house`, `medical`, `personal`, `student`, `vehicle_fuel`, `vehicle_maint`, `vehicle_oil`, `work`.

## Income
- `GET /api/income`
- `PUT /api/income/:month` with aggregate values and optional `details` containing the full finance record.

## Vehicle income (financial records)
- `GET /api/car-income`
- `PUT /api/car-income-sync` replaces the vehicle-trip income collection after validation.

## Bank certificates
- `GET /api/certificates`
- `POST /api/certificates`
- `PUT /api/certificates/:id`
- `DELETE /api/certificates/:id`
- `PUT /api/certificates-sync` replaces the certificate collection transactionally after validation.

## Backup / restore
- `GET /api/backup` exports only expenses, monthly income, vehicle-trip income, and bank certificates.
- `POST /api/backup/restore` validates the complete payload and restores the finance collections in one SQLite transaction.

## Deployment gate
Authentication, authorization, per-user data isolation, rate limiting, and automated runtime/security tests are required before any public deployment. Do not expose the current API publicly.
