import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

let child: ChildProcess | undefined;
let baseUrl = "";
let tempDir = "";

async function freePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not allocate a test port");
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return address.port;
}
async function waitForHealth(): Promise<void> {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child?.exitCode !== null && child?.exitCode !== undefined) throw new Error("API server exited before becoming healthy");
    try { const response = await fetch(baseUrl + "/api/health"); if (response.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("API health endpoint did not become ready");
}
async function json(path: string, init?: RequestInit) {
  const response = await fetch(baseUrl + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) }
  });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

before(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "smartcost-test-"));
  const port = await freePort();
  baseUrl = "http://127.0.0.1:" + port;
  child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), DATABASE_PATH: join(tempDir, "test.sqlite"), CORS_ORIGIN: baseUrl },
    stdio: "ignore"
  });
  await waitForHealth();
});

after(async () => {
  child?.kill("SIGTERM");
  await new Promise(resolve => setTimeout(resolve, 150));
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
});

test("expense create, read, update and delete use the finance type", async () => {
  const created = await json("/api/expenses", { method: "POST", body: JSON.stringify({
    title: "اختبار مصروف", amount: 125.5, type: "student", category: "تعليم", date: "2026-10-15", notes: "integration test"
  }) });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.type, "student");
  const id = String(created.body.id);
  const updated = await json("/api/expenses/" + id, { method: "PUT", body: JSON.stringify({
    title: "اختبار مصروف معدل", amount: 150, type: "student", category: "تعليم", date: "2026-10-15", notes: null
  }) });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.amount, 150);
  const deleted = await json("/api/expenses/" + id, { method: "DELETE" });
  assert.equal(deleted.response.status, 204);
});

test("income details and certificate collection persist and appear in finance-only backup", async () => {
  const incomeDetails = { id: "income_test", month: "2026-10", salary: 1000, bonuses: 50, otherIncome: 25, sources: [], createdAt: new Date().toISOString() };
  const income = await json("/api/income/2026-10", { method: "PUT", body: JSON.stringify({
    salary: 1000, bonuses: 50, otherIncome: 25, details: incomeDetails
  }) });
  assert.equal(income.response.status, 200);
  const incomeList = await json("/api/income");
  assert.ok(incomeList.body.some((row: any) => row.id === "income_test"));

  const certificate = { id: "cert_test", bankName: "Test Bank", certificateNumber: "TEST-1", duration: "1 year", amount: 5000, issueDate: "2026-01-01", maturityDate: "2027-01-01", profitDate: "2026-02-01", profitAmount: 100, profitFrequency: "monthly", notes: "test", createdAt: new Date().toISOString() };
  const synced = await json("/api/certificates-sync", { method: "PUT", body: JSON.stringify({ items: [certificate] }) });
  assert.equal(synced.response.status, 200);
  const certList = await json("/api/certificates");
  assert.ok(certList.body.some((row: any) => row.id === "cert_test"));

  const backup = await json("/api/backup");
  assert.equal(backup.response.status, 200);
  assert.deepEqual(Object.keys(backup.body).sort(), ["certificates", "exportedAt", "expenses", "income", "schemaVersion"].sort());
  assert.ok(backup.body.income.some((row: any) => row.id === "income_test"));
  assert.ok(backup.body.certificates.some((row: any) => row.id === "cert_test"));
  const restored = await json("/api/backup/restore", { method: "POST", body: JSON.stringify(backup.body) });
  assert.equal(restored.response.status, 200);
  assert.equal(restored.body.ok, true);
  assert.equal(restored.body.counts.certificates, 1);
});
