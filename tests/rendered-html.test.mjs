import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the research toolkit", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /研知 Research Toolkit/);
  assert.match(html, /把時間留給/);
  assert.match(html, /文獻矩陣/);
  assert.match(html, /sectools\.tw\/tools/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("source includes all six local tools and the public publication examples", async () => {
  const source = await readFile(new URL("../app/research-toolkit.tsx", import.meta.url), "utf8");
  for (const expected of ["文獻矩陣", "研究問題框架", "引用產生器", "文字分析", "樣本數估算", "效果量計算"]) {
    assert.match(source, new RegExp(expected));
  }
  assert.match(source, /EnhanceCTI/);
  assert.match(source, /Improving Quality of Indicators of Compromise/);
  assert.match(source, /BERT-CRF/);
  assert.match(source, /lgOY-SoAAAAJ/);
});
