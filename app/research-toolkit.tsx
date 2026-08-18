"use client";

import { useMemo, useState } from "react";

type ToolId = "matrix" | "question" | "citation" | "text" | "sample" | "effect";

type Paper = {
  id: number;
  author: string;
  year: string;
  title: string;
  method: string;
  finding: string;
  gap: string;
  url?: string;
};

const tools: { id: ToolId; index: string; name: string; note: string }[] = [
  { id: "matrix", index: "01", name: "文獻矩陣", note: "整理證據與研究缺口" },
  { id: "question", index: "02", name: "研究問題框架", note: "PICO / PECO 轉檢索式" },
  { id: "citation", index: "03", name: "引用產生器", note: "APA、MLA、Chicago" },
  { id: "text", index: "04", name: "文字分析", note: "字數、閱讀時間、關鍵詞" },
  { id: "sample", index: "05", name: "樣本數估算", note: "比例研究快速估算" },
  { id: "effect", index: "06", name: "效果量計算", note: "Cohen's d 與解讀" },
];

const initialPapers: Paper[] = [
  {
    id: 1,
    author: "Chen, S.-S., Pai, T.-W., & Sun, C.-Y.",
    year: "2025",
    title: "EnhanceCTI: An Enhanced Semantic Filtering and Feature Extraction Framework for Industry-Specific Cyber Threat Intelligence",
    method: "語意過濾與特徵擷取框架",
    finding: "請閱讀全文後補充主要結果",
    gap: "請依研究限制補充",
    url: "https://doi.org/10.1016/j.cose.2025.104649",
  },
  {
    id: 2,
    author: "Chen, S.-S., Hwang, R.-H., Ali, A., Lin, Y.-D., Wei, Y.-C., & Pai, T.-W.",
    year: "2024",
    title: "Improving Quality of Indicators of Compromise Using STIX Graphs",
    method: "OpenCTI、STIX 圖結構與啟發式評分",
    finding: "相較傳統方法，IoC 信心分數平均誤差降低 30.82%",
    gap: "可進一步驗證不同威脅來源與場景",
    url: "https://doi.org/10.1016/j.cose.2024.103972",
  },
  {
    id: 3,
    author: "Chen, S.-S., Hwang, R.-H., Sun, C.-Y., Lin, Y.-D., & Pai, T.-W.",
    year: "2023",
    title: "Enhancing Cyber Threat Intelligence with Named Entity Recognition Using BERT-CRF",
    method: "移除 BiLSTM 中介層的 BERT-CRF 命名實體辨識",
    finding: "真實情境準確率 82.64%，惡意程式情資資料為 93.95%",
    gap: "可持續檢驗跨領域與新型態情資資料",
    url: "https://doi.org/10.1109/GLOBECOM54140.2023.10436853",
  },
];

function copyText(value: string) {
  if (typeof navigator !== "undefined") void navigator.clipboard.writeText(value);
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function ResearchToolkit() {
  const [active, setActive] = useState<ToolId>("matrix");

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="研知首頁">
          <span className="brand-mark">研</span>
          <span>研知 <i>Research Toolkit</i></span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#tools">研究工具</a>
          <a href="#principles">使用原則</a>
          <span className="privacy-pill"><b /> LOCAL ONLY</span>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">RESEARCH, WITH LESS FRICTION.</p>
          <h1>把時間留給<br /><em>真正的問題。</em></h1>
          <p className="lede">從文獻整理、研究問題到基礎統計，六個不需登入、不會上傳研究資料的實用工具。</p>
          <a className="primary-button" href="#tools">開始整理研究 <span>↘</span></a>
        </div>
        <div className="hero-board" aria-label="研究流程概覽">
          <div className="board-top"><span>RESEARCH FLOW</span><span>01 — 06</span></div>
          <div className="flow-line"><b>探索</b><span /><small>定義問題</small></div>
          <div className="flow-line"><b>整理</b><span /><small>比較證據</small></div>
          <div className="flow-line"><b>驗證</b><span /><small>量化結果</small></div>
          <div className="board-note">所有運算皆在你的瀏覽器內完成。</div>
        </div>
      </section>

      <section className="tool-section" id="tools">
        <div className="section-heading">
          <div><p className="eyebrow">TOOLKIT / 01</p><h2>研究工作臺</h2></div>
          <p>選一個工具，立即開始。輸入內容不會傳送至伺服器。</p>
        </div>

        <div className="workspace">
          <aside className="tool-nav" aria-label="研究工具清單">
            {tools.map((tool) => (
              <button key={tool.id} className={active === tool.id ? "active" : ""} onClick={() => setActive(tool.id)}>
                <span>{tool.index}</span><b>{tool.name}</b><small>{tool.note}</small><i>→</i>
              </button>
            ))}
          </aside>
          <div className="tool-panel">
            {active === "matrix" && <LiteratureMatrix />}
            {active === "question" && <QuestionBuilder />}
            {active === "citation" && <CitationBuilder />}
            {active === "text" && <TextAnalyzer />}
            {active === "sample" && <SampleCalculator />}
            {active === "effect" && <EffectCalculator />}
          </div>
        </div>
      </section>

      <section className="principles" id="principles">
        <div><p className="eyebrow">DESIGNED FOR TRUST</p><h2>研究資料，<br />不該成為交換條件。</h2></div>
        <div className="principle-grid">
          <article><span>01</span><h3>本機優先</h3><p>沒有帳號、追蹤碼或遠端資料庫。重新整理頁面後，尚未匯出的內容即會消失。</p></article>
          <article><span>02</span><h3>計算透明</h3><p>統計工具清楚標示公式與假設，結果適合初步規劃，不取代研究方法專家的審查。</p></article>
          <article><span>03</span><h3>方便帶走</h3><p>文獻矩陣可直接匯出 CSV，研究問題與引用結果可一鍵複製到你的工作流程。</p></article>
        </div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">研</span><span>研知</span></div>
        <p>為專注研究而做 · Privacy by design</p>
        <div className="footer-links"><a className="ecosystem-link" href="https://sectools.tw/tools/" target="_blank" rel="noopener noreferrer">探索 SecTools 資安工具庫 ↗</a><a href="#top">回到頂端 ↑</a></div>
      </footer>
    </main>
  );
}

function PanelHeader({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <><div className="panel-kicker">TOOL {number}</div><h3 className="panel-title">{title}</h3><p className="panel-intro">{children}</p></>;
}

function LiteratureMatrix() {
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [draft, setDraft] = useState<Omit<Paper, "id">>({ author: "", year: "", title: "", method: "", finding: "", gap: "" });
  const update = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const add = () => {
    if (!draft.title.trim()) return;
    setPapers((items) => [...items, { ...draft, id: Date.now() }]);
    setDraft({ author: "", year: "", title: "", method: "", finding: "", gap: "" });
  };
  const exportCsv = () => {
    const rows = [["作者", "年份", "篇名", "方法", "主要發現", "研究缺口"], ...papers.map((p) => [p.author, p.year, p.title, p.method, p.finding, p.gap])];
    const blob = new Blob(["\ufeff" + rows.map((r) => r.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "literature-matrix.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div>
    <PanelHeader number="01" title="文獻矩陣">把每篇文獻放進同一套比較框架，研究脈絡與缺口會更快浮現。</PanelHeader>
    <p className="example-source">預載範例取自 <a href="https://scholar.google.com/citations?user=lgOY-SoAAAAJ" target="_blank" rel="noopener noreferrer">Sheng-Shan Chen 的公開著作 ↗</a>；方法欄為依篇名整理的概括，研究發現與限制請以全文為準。</p>
    <div className="form-grid compact">
      <label>作者<input value={draft.author} onChange={(e) => update("author", e.target.value)} placeholder="例：Chen et al." /></label>
      <label>年份<input value={draft.year} onChange={(e) => update("year", e.target.value)} placeholder="2025" inputMode="numeric" /></label>
      <label className="wide">篇名 *<input value={draft.title} onChange={(e) => update("title", e.target.value)} placeholder="輸入文章或報告名稱" /></label>
      <label>研究方法<input value={draft.method} onChange={(e) => update("method", e.target.value)} placeholder="設計、樣本、資料來源" /></label>
      <label>主要發現<input value={draft.finding} onChange={(e) => update("finding", e.target.value)} placeholder="一句話摘要" /></label>
      <label className="wide">研究缺口<input value={draft.gap} onChange={(e) => update("gap", e.target.value)} placeholder="作者未回答什麼？" /></label>
    </div>
    <div className="action-row"><button className="action" onClick={add}>加入矩陣 ＋</button><button className="secondary" onClick={exportCsv} disabled={!papers.length}>匯出 CSV ↓</button></div>
    <div className="matrix-list">
      {papers.map((paper) => <article key={paper.id}>
        <div><small>{paper.author || "未填作者"} · {paper.year || "年份未填"}</small><h4>{paper.url ? <a href={paper.url} target="_blank" rel="noopener noreferrer">{paper.title} ↗</a> : paper.title}</h4><p><b>方法</b>{paper.method || "—"}</p><p><b>發現</b>{paper.finding || "—"}</p><p><b>缺口</b>{paper.gap || "—"}</p></div>
        <button aria-label={`刪除 ${paper.title}`} onClick={() => setPapers((items) => items.filter((p) => p.id !== paper.id))}>×</button>
      </article>)}
    </div>
  </div>;
}

function QuestionBuilder() {
  const [framework, setFramework] = useState("PICO");
  const [fields, setFields] = useState({ p: "", i: "", c: "", o: "" });
  const query = [fields.p, fields.i, fields.o].filter(Boolean).map((v) => `(${v.trim().split(/[,，]/).filter(Boolean).map((x) => `"${x.trim()}"`).join(" OR ")})`).join(" AND ");
  const labels = framework === "PICO" ? ["族群 / 問題 (P)", "介入 (I)", "比較 (C)", "結果 (O)"] : ["族群 (P)", "暴露因子 (E)", "比較 (C)", "結果 (O)"];
  return <div>
    <PanelHeader number="02" title="研究問題框架">用 PICO 或 PECO 拆解概念，再產生可帶入資料庫的布林檢索式。</PanelHeader>
    <div className="segmented"><button className={framework === "PICO" ? "active" : ""} onClick={() => setFramework("PICO")}>PICO · 介入研究</button><button className={framework === "PECO" ? "active" : ""} onClick={() => setFramework("PECO")}>PECO · 觀察研究</button></div>
    <div className="form-grid">
      {(["p", "i", "c", "o"] as const).map((key, idx) => <label key={key}>{labels[idx]}<textarea value={fields[key]} onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))} placeholder="可用逗號分隔同義詞" /></label>)}
    </div>
    <div className="result-box"><div><span>BOOLEAN SEARCH STRING</span><button onClick={() => copyText(query)}>複製</button></div><code>{query || "填入概念後，檢索式會出現在這裡。"}</code></div>
  </div>;
}

function CitationBuilder() {
  const [style, setStyle] = useState("APA 7");
  const [data, setData] = useState({ author: "", year: "", title: "", journal: "", volume: "", issue: "", pages: "", doi: "" });
  const doi = data.doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  const citation = useMemo(() => {
    if (!data.title) return "填寫資料後，格式化引用會顯示在這裡。";
    const author = data.author || "作者未詳"; const year = data.year || "n.d."; const journal = data.journal ? ` ${data.journal}` : "";
    if (style === "MLA 9") return `${author}. “${data.title}.”${journal}${data.volume ? `, vol. ${data.volume}` : ""}${data.issue ? `, no. ${data.issue}` : ""}, ${year}${data.pages ? `, pp. ${data.pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
    if (style === "Chicago") return `${author}. “${data.title}.”${journal}${data.volume ? ` ${data.volume}` : ""}${data.issue ? `, no. ${data.issue}` : ""} (${year})${data.pages ? `: ${data.pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
    return `${author} (${year}). ${data.title}.${journal}${data.volume ? `, ${data.volume}` : ""}${data.issue ? `(${data.issue})` : ""}${data.pages ? `, ${data.pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
  }, [data, doi, style]);
  const update = (key: keyof typeof data, value: string) => setData((d) => ({ ...d, [key]: value }));
  return <div>
    <PanelHeader number="03" title="引用產生器">快速整理期刊文章的書目格式；提交前仍建議依期刊指南人工核對。</PanelHeader>
    <div className="segmented">{["APA 7", "MLA 9", "Chicago"].map((s) => <button key={s} className={style === s ? "active" : ""} onClick={() => setStyle(s)}>{s}</button>)}</div>
    <div className="form-grid compact">
      <label>作者<input value={data.author} onChange={(e) => update("author", e.target.value)} placeholder="姓氏, 名字縮寫" /></label><label>年份<input value={data.year} onChange={(e) => update("year", e.target.value)} /></label>
      <label className="wide">文章標題<input value={data.title} onChange={(e) => update("title", e.target.value)} /></label><label>期刊名稱<input value={data.journal} onChange={(e) => update("journal", e.target.value)} /></label>
      <label>卷 / 期<input value={`${data.volume}${data.issue ? ` / ${data.issue}` : ""}`} onChange={(e) => { const [volume, issue = ""] = e.target.value.split("/"); setData((d) => ({ ...d, volume: volume.trim(), issue: issue.trim() })); }} placeholder="12 / 3" /></label>
      <label>頁碼<input value={data.pages} onChange={(e) => update("pages", e.target.value)} placeholder="121–138" /></label><label>DOI<input value={data.doi} onChange={(e) => update("doi", e.target.value)} placeholder="10.xxxx/xxxxx" /></label>
    </div>
    <div className="result-box citation"><div><span>{style}</span><button onClick={() => copyText(citation)}>複製引用</button></div><p>{citation}</p></div>
  </div>;
}

function TextAnalyzer() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
    const tokens = (text.toLowerCase().match(/[a-zà-ž]{3,}|[\u3400-\u9fff]{2,}/g) || []).filter((x) => !["this", "that", "with", "from", "的研究", "以及"].includes(x));
    const frequencies = Object.entries(tokens.reduce<Record<string, number>>((a, x) => ({ ...a, [x]: (a[x] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const units = words.length + cjk;
    return { words: words.length, cjk, chars: text.length, sentences: text.split(/[。！？.!?]+/).filter((s) => s.trim()).length, minutes: units ? Math.max(1, Math.ceil(units / 300)) : 0, frequencies };
  }, [text]);
  return <div>
    <PanelHeader number="04" title="文字分析">貼上摘要或草稿，即時計算篇幅、閱讀時間與高頻詞。</PanelHeader>
    <label className="full-label">研究文字<textarea className="large-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="在此貼上文字。內容只在這個頁面中分析…" /></label>
    <div className="stat-grid"><div><b>{stats.words}</b><span>英文詞數</span></div><div><b>{stats.cjk}</b><span>中文字數</span></div><div><b>{stats.sentences}</b><span>句子</span></div><div><b>{stats.minutes}</b><span>分鐘閱讀</span></div></div>
    <div className="keyword-box"><span>高頻詞</span><div>{stats.frequencies.length ? stats.frequencies.map(([word, count]) => <i key={word}>{word} <b>{count}</b></i>) : <small>輸入較長的文字後顯示</small>}</div></div>
  </div>;
}

function SampleCalculator() {
  const [confidence, setConfidence] = useState("1.96"); const [margin, setMargin] = useState("5"); const [proportion, setProportion] = useState("50"); const [population, setPopulation] = useState("");
  const z = Number(confidence); const e = Number(margin) / 100; const p = Number(proportion) / 100; const n0 = e > 0 ? (z * z * p * (1 - p)) / (e * e) : 0; const pop = Number(population); const adjusted = pop > 0 ? n0 / (1 + (n0 - 1) / pop) : n0; const result = Number.isFinite(adjusted) ? Math.ceil(adjusted) : 0;
  return <div>
    <PanelHeader number="05" title="樣本數估算">以母體比例估計公式計算基礎樣本數，適合問卷與盛行率研究的初步規劃。</PanelHeader>
    <div className="form-grid">
      <label>信心水準<select value={confidence} onChange={(e) => setConfidence(e.target.value)}><option value="1.645">90%</option><option value="1.96">95%</option><option value="2.576">99%</option></select></label>
      <label>容許誤差 (%)<input type="number" min="0.1" max="50" value={margin} onChange={(e) => setMargin(e.target.value)} /></label>
      <label>預期比例 (%)<input type="number" min="1" max="99" value={proportion} onChange={(e) => setProportion(e.target.value)} /></label>
      <label>有限母體數（選填）<input type="number" min="1" value={population} onChange={(e) => setPopulation(e.target.value)} placeholder="留白視為無限母體" /></label>
    </div>
    <div className="number-result"><span>建議最低樣本數</span><strong>{result || "—"}</strong><p>n = z² × p(1−p) ÷ e²{pop > 0 ? "，已套用有限母體修正" : ""}</p></div>
    <p className="caveat">未包含無回覆率、設計效應、分層分析與統計檢定力需求。正式研究請與統計專家確認。</p>
  </div>;
}

function EffectCalculator() {
  const [v, setV] = useState({ m1: "", sd1: "", n1: "", m2: "", sd2: "", n2: "" });
  const n1 = Number(v.n1), n2 = Number(v.n2), sd1 = Number(v.sd1), sd2 = Number(v.sd2); const pooled = n1 > 1 && n2 > 1 ? Math.sqrt(((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / (n1 + n2 - 2)) : 0; const d = pooled ? (Number(v.m1) - Number(v.m2)) / pooled : NaN; const magnitude = Number.isFinite(d) ? Math.abs(d) < .2 ? "可忽略" : Math.abs(d) < .5 ? "小效果" : Math.abs(d) < .8 ? "中效果" : "大效果" : "等待資料";
  return <div>
    <PanelHeader number="06" title="效果量計算">用兩組平均數、標準差與樣本數，計算標準化平均差 Cohen&apos;s d。</PanelHeader>
    <div className="group-grid">
      {[1, 2].map((group) => <fieldset key={group}><legend>GROUP {group}</legend>{(["m", "sd", "n"] as const).map((key) => { const field = `${key}${group}` as keyof typeof v; return <label key={key}>{key === "m" ? "平均數" : key === "sd" ? "標準差" : "樣本數"}<input type="number" value={v[field]} onChange={(e) => setV((old) => ({ ...old, [field]: e.target.value }))} /></label>; })}</fieldset>)}
    </div>
    <div className="number-result effect"><span>COHEN&apos;S D</span><strong>{Number.isFinite(d) ? d.toFixed(3) : "—"}</strong><p>{magnitude} · 正負號表示兩組平均數差異方向</p></div>
    <p className="caveat">常用門檻僅供參考，效果的實質意義應依研究領域、測量尺度與信賴區間判斷。</p>
  </div>;
}
