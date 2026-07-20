import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const password = process.env.KOVE_DEMO_PASSWORD;
if (!url || !publishableKey || !password) throw new Error("Live platform verification requires Supabase URL, publishable key, and KOVE_DEMO_PASSWORD.");

const organizationId = "20000000-0000-4000-8000-000000000001";
const isolationOrganizationId = "90000000-0000-4000-8000-000000000001";
const owner = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const viewer = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const testId = randomUUID();
let created = false;

try {
  const { data: ownerAuth, error: ownerAuthError } = await owner.auth.signInWithPassword({ email: "demo.owner@koveops.example", password });
  assert.ifError(ownerAuthError); assert.ok(ownerAuth.user);
  const { data: viewerAuth, error: viewerAuthError } = await viewer.auth.signInWithPassword({ email: "demo.viewer@koveops.example", password });
  assert.ifError(viewerAuthError); assert.ok(viewerAuth.user);

  const { data: customers, error: readError } = await owner.from("customers").select("id").eq("organization_id", organizationId);
  assert.ifError(readError); assert.ok(customers.length >= 2);
  const { data: isolatedOrganizations, error: isolationError } = await owner.from("organizations").select("id").eq("id", isolationOrganizationId);
  assert.ifError(isolationError); assert.equal(isolatedOrganizations.length, 0);

  const { error: createError } = await owner.from("customers").insert({ id: testId, organization_id: organizationId, customer_code: `VERIFY-${testId.slice(0, 8)}`, name: "Platform Verification Customer", status: "prospect", created_by: ownerAuth.user.id });
  assert.ifError(createError); created = true;
  const { data: updated, error: updateError } = await owner.from("customers").update({ status: "active" }).eq("id", testId).select("status").single();
  assert.ifError(updateError); assert.equal(updated.status, "active");

  const { error: revisionMutationError } = await owner.from("order_revisions").update({ reason: "Mutation must fail" }).eq("id", "38000000-0000-4000-8000-000000000002");
  assert.equal(revisionMutationError?.code, "55000");

  const { error: viewerWriteError } = await viewer.from("materials").insert({ organization_id: organizationId, sku: `DENIED-${testId.slice(0, 8)}`, description: "Viewer write must fail", unit: "EA" });
  assert.equal(viewerWriteError?.code, "42501");

  const { error: deleteError } = await owner.from("customers").delete().eq("id", testId);
  assert.ifError(deleteError); created = false;
  const { data: audit, error: auditError } = await owner.from("audit_logs").select("action").eq("record_id", testId);
  assert.ifError(auditError); assert.deepEqual(new Set(audit.map(({ action }) => action)), new Set(["INSERT", "UPDATE", "DELETE"]));
  console.log("Live platform verification passed: owner CRUD, tenant isolation, audit capture, revision immutability, and viewer denial.");
} finally {
  if (created) await owner.from("customers").delete().eq("id", testId);
  await Promise.all([owner.auth.signOut(), viewer.auth.signOut()]);
}
