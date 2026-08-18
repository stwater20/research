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
  assert.match(html, /給中文研究者的/);
  assert.match(html, /PICO／PECO 研究問題框架/);
  assert.match(html, /APA 7、MLA 與 Chicago 引用/);
  assert.match(html, /研究工具常見問題/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /FAQPage/);
  assert.match(html, /sectools\.tw\/tools/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("source includes all twelve local tools, journey links and publication examples", async () => {
  const source = await readFile(new URL("../app/research-toolkit.tsx", import.meta.url), "utf8");
  for (const expected of ["文獻矩陣", "研究問題框架", "引用產生器", "文字分析", "樣本數估算", "效果量計算", "描述統計", "2×2 效果指標", "識別碼整理", "信賴區間", "信度分析", "隨機分組"]) {
    assert.match(source, new RegExp(expected));
  }
  assert.match(source, /EnhanceCTI/);
  assert.match(source, /Improving Quality of Indicators of Compromise/);
  assert.match(source, /BERT-CRF/);
  assert.match(source, /lgOY-SoAAAAJ/);
  assert.match(source, /cant-write-my-paper\.sectools\.tw/);
  assert.match(source, /thesis-defense-survival\.sectools\.tw/);
  assert.match(source, /still-under-review\.sectools\.tw/);
  assert.match(source, /we-are-pleased-to-inform-you\.sectools\.tw/);
  assert.match(source, /we-regret-to-inform-you\.sectools\.tw/);
});

test("publishes Traditional Chinese search metadata and discovery routes", async () => {
  const [layout, robots, sitemap] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /免費中文研究工具箱/);
  assert.match(layout, /APA 7 引用格式/);
  assert.match(layout, /描述統計/);
  assert.match(layout, /DOI 查詢/);
  assert.match(layout, /Cronbach alpha/);
  assert.match(layout, /隨機分組/);
  assert.match(layout, /locale: "zh_TW"/);
  assert.match(layout, /max-image-preview/);
  assert.match(robots, /research\.sectools\.tw\/sitemap\.xml/);
  assert.match(sitemap, /research\.sectools\.tw/);
});
