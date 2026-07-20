import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/auth/sign-in") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the KOVE OPS sign-in experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /KOVE/);
  assert.match(html, /Welcome back/);
  assert.match(html, /Sign in to your operations workspace/);
  assert.match(html, /Forgot password/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps the dashboard protected and Supabase auth wired", async () => {
  const [page, dashboard, css, layout, packageJson, proxy, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260720040329_identity_organization_foundation.sql", import.meta.url), "utf8"),
  ]);
  assert.match(page, /requireUser/);
  assert.match(dashboard, /useMemo, useState/);
  assert.match(dashboard, /Create work order/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(layout, /SessionProvider/);
  assert.match(packageJson, /"name": "kove-ops"/);
  assert.match(proxy, /updateSession/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /handle_new_auth_user/);
  assert.doesNotMatch(dashboard, /SkeletonPreview|react-loading-skeleton/);
});
