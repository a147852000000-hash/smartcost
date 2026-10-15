CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL CHECK(amount >= 0),
  type TEXT NOT NULL DEFAULT 'house', category TEXT NOT NULL, date TEXT NOT NULL, notes TEXT,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS monthly_income (
  month TEXT PRIMARY KEY, salary REAL NOT NULL DEFAULT 0 CHECK(salary >= 0),
  bonuses REAL NOT NULL DEFAULT 0 CHECK(bonuses >= 0),
  otherIncome REAL NOT NULL DEFAULT 0 CHECK(otherIncome >= 0),
  otherIncomeNote TEXT, detailsJson TEXT, updatedAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS car_income_trips (
  id TEXT PRIMARY KEY, date TEXT NOT NULL, amount REAL NOT NULL CHECK(amount >= 0),
  tripJson TEXT NOT NULL, createdAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bank_certificates (
  id TEXT PRIMARY KEY, bankName TEXT NOT NULL, certificateNumber TEXT,
  duration TEXT NOT NULL, amount REAL NOT NULL CHECK(amount > 0),
  issueDate TEXT NOT NULL, maturityDate TEXT NOT NULL, profitDate TEXT NOT NULL,
  profitAmount REAL NOT NULL DEFAULT 0 CHECK(profitAmount >= 0),
  profitFrequency TEXT NOT NULL, notes TEXT, detailsJson TEXT,
  createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
);
