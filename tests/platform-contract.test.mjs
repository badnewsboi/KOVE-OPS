import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = new URL("../supabase/migrations/20260720050145_industrial_operations_data_platform.sql", import.meta.url);
const tables = ["customers","customer_contacts","vendors","vendor_contacts","facilities","materials","orders","order_items","order_revisions","revision_line_items","revision_differences","approvals","warehouse_events","risk_events","attachments","comments","activity_events","audit_logs"];

test("defines tenant-scoped operational tables, RLS, and grants", async () => {
  const sql = await readFile(migration, "utf8");
  for (const table of tables) assert.match(sql, new RegExp(`create table public\\.${table} \\(`));
  assert.match(sql, /enable row level security/); assert.match(sql, /grant select, insert/);
  assert.match(sql, /private\.is_organization_member/); assert.match(sql, /private\.can_write_operations/);
});

test("protects revision and audit history", async () => {
  const sql = await readFile(migration, "utf8");
  for (const trigger of ["order_revisions_immutable","revision_line_items_immutable","revision_differences_immutable","audit_logs_immutable","capture_audit_log"]) assert.match(sql, new RegExp(trigger));
  for (const difference of ["added_line","removed_line","changed_quantity","changed_material","changed_dates","changed_notes"]) assert.match(sql, new RegExp(difference));
});

test("keeps persistence in repositories and validation outside routes", async () => {
  const [repository, validation, collection, item] = await Promise.all([
    readFile(new URL("../repositories/platform-repository.ts", import.meta.url), "utf8"), readFile(new URL("../lib/validation/platform.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/platform/[resource]/route.ts", import.meta.url), "utf8"), readFile(new URL("../app/api/platform/[resource]/[id]/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(repository, /class PlatformRepository/); assert.match(validation, /validatePayload/); assert.match(collection, /PlatformRepository/); assert.match(item, /IMMUTABLE_RESOURCE/);
  assert.doesNotMatch(collection, /\.from\(/); assert.doesNotMatch(item, /\.from\(/);
});
