import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the KOVE OPS command center", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>KOVE OPS — Operations Command Center<\/title>/i);
  assert.match(html, /Good evening, Alex\./);
  assert.match(html, /Priority work/);
  assert.match(html, /Operational health/);
  assert.match(html, /Live activity/);
  assert.match(html, /WO-1048/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps product interactions and responsive styling in source", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useMemo, useState/);
  assert.match(page, /setQuery/);
  assert.match(page, /setMenu/);
  assert.match(page, /Create work order/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /\.sidebar\.open/);
  assert.match(layout, /KOVE OPS — Operations Command Center/);
  assert.match(packageJson, /"name": "kove-ops"/);
  assert.doesNotMatch(page, /SkeletonPreview|react-loading-skeleton/);
});
