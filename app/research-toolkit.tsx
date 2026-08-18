"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { assignRandomGroups, calculateTwoByTwo, cronbachAlpha, describe, meanConfidenceInterval, normalizeAcademicIdentifier, parseNumericData, parseNumericMatrix, proportionConfidenceInterval } from "../lib/research-utils";

type ToolId = "matrix" | "question" | "citation" | "text" | "sample" | "effect" | "descriptive" | "twobytwo" | "identifier" | "confidence" | "reliability" | "randomize";

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
  { id: "descriptive", index: "07", name: "描述統計", note: "平均數、中位數、標準差" },
  { id: "twobytwo", index: "08", name: "2×2 效果指標", note: "RR、OR、風險差與 NNT" },
  { id: "identifier", index: "09", name: "識別碼整理", note: "DOI、PMID、arXiv 正規化" },
  { id: "confidence", index: "10", name: "信賴區間", note: "平均數與比例的 95% CI" },
  { id: "reliability", index: "11", name: "信度分析", note: "Cronbach's α 快速檢查" },
  { id: "randomize", index: "12", name: "隨機分組", note: "種子碼、平衡分派、CSV" },
];

const researchJourney = [
  { index: "01", stage: "還在寫", title: "游標還在閃", note: "寫不出來時，先笑一下再寫一句。", href: "https://cant-write-my-paper.sectools.tw/", tone: "night" },
  { index: "02", stage: "準備口試", title: "口試生存指南", note: "抽一題口委愛問的問題，附生存建議。", href: "https://thesis-defense-survival.sectools.tw/", tone: "defense" },
  { index: "03", stage: "等待消息", title: "Still Under Review", note: "進度永遠 68%，但你不是一個人在等。", href: "https://still-under-review.sectools.tw/", tone: "wait" },
  { index: "04", stage: "終於錄取", title: "We Are Pleased…", note: "按一下，再被錄取一次。", href: "https://we-are-pleased-to-inform-you.sectools.tw/", tone: "pleased" },
  { index: "05", stage: "這次拒稿", title: "We Regret…", note: "笑著把眼淚吞回去，下一站見。", href: "https://we-regret-to-inform-you.sectools.tw/", tone: "regret" },
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

async function copyText(value: string) {
  if (typeof navigator === "undefined" || !value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadText(filename: string, value: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff" + value], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function ResearchToolkit() {
  const [active, setActive] = useState<ToolId>("matrix");
  const activeToolButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeToolButton.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [active]);

  const openTool = (tool: ToolId) => {
    setActive(tool);
    requestAnimationFrame(() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="研知首頁">
          <span className="brand-mark">研</span>
          <span>研知 <i>Research Toolkit</i></span>
        </a>
        <nav aria-label="主要導覽">
          <a href="#tools">研究工具</a>
          <a href="#guide">工具指南</a>
          <a href="#journey">論文旅程</a>
          <a href="#faq">常見問題</a>
          <a href="#principles">使用原則</a>
          <span className="privacy-pill"><b /> LOCAL ONLY</span>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">RESEARCH, WITH LESS FRICTION.</p>
          <h1>把時間留給<br /><em>真正的問題。</em></h1>
          <p className="lede">從文獻整理、研究問題到基礎統計，十二個不需登入、不會上傳研究資料的實用工具。</p>
          <a className="primary-button" href="#tools">開始整理研究 <span>↘</span></a>
        </div>
        <div className="hero-board" aria-label="研究流程概覽">
          <div className="board-top"><span>RESEARCH FLOW</span><span>01 — 12</span></div>
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
        <ol className="getting-started" aria-label="三步開始使用">
          <li><span>1</span><b>選工具</b><small>依現在的研究任務切換</small></li>
          <li><span>2</span><b>貼資料</b><small>可直接使用範例快速試算</small></li>
          <li><span>3</span><b>帶走結果</b><small>複製摘要或下載 CSV</small></li>
        </ol>

        <div className="workspace">
          <aside className="tool-nav" aria-label="研究工具清單">
            {tools.map((tool) => (
              <button key={tool.id} ref={active === tool.id ? activeToolButton : undefined} className={active === tool.id ? "active" : ""} onClick={() => setActive(tool.id)}>
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
            {active === "descriptive" && <DescriptiveCalculator />}
            {active === "twobytwo" && <TwoByTwoCalculator />}
            {active === "identifier" && <IdentifierCleaner />}
            {active === "confidence" && <ConfidenceIntervalCalculator />}
            {active === "reliability" && <ReliabilityCalculator />}
            {active === "randomize" && <RandomizationTool />}
          </div>
        </div>
      </section>

      <section className="seo-guide" id="guide">
        <div className="section-heading">
          <div><p className="eyebrow">RESEARCH GUIDE / 02</p><h2>給中文研究者的<br />免費研究工具</h2></div>
          <p>從定義研究問題到整理論文與解讀研究結果，每個工具都對應一個常見的研究工作情境。</p>
        </div>
        <div className="guide-grid">
          <article><span>01</span><h3>文獻矩陣與文獻回顧整理</h3><p>將作者、年份、研究方法、主要發現與研究缺口放在同一張文獻矩陣中，比較多篇論文時不再反覆翻找筆記。整理完成後可匯出 CSV。</p><a href="#tools" onClick={() => setActive("matrix")}>開啟文獻矩陣 →</a></article>
          <article><span>02</span><h3>PICO／PECO 研究問題框架</h3><p>PICO 適合介入研究，PECO 適合暴露與觀察性研究。輸入族群、介入或暴露、比較與結果，即可建立適合學術資料庫的布林檢索式。</p><a href="#tools" onClick={() => setActive("question")}>建立研究問題 →</a></article>
          <article><span>03</span><h3>APA 7、MLA 與 Chicago 引用</h3><p>輸入期刊文章的作者、年份、篇名、卷期、頁碼與 DOI，快速產生常見引用格式。正式投稿前仍應依目標期刊的作者指南核對。</p><a href="#tools" onClick={() => setActive("citation")}>產生引用格式 →</a></article>
          <article><span>04</span><h3>中英文文字與關鍵詞分析</h3><p>分析中文摘要或英文草稿的字數、句數、閱讀時間與高頻詞，協助檢查摘要長度、內容重點與重複用詞。</p><a href="#tools" onClick={() => setActive("text")}>分析研究文字 →</a></article>
          <article><span>05</span><h3>問卷與比例研究樣本數計算</h3><p>依信心水準、容許誤差與預期比例估算最低樣本數，也能套用有限母體修正。適合問卷或盛行率研究的早期規劃。</p><a href="#tools" onClick={() => setActive("sample")}>估算研究樣本數 →</a></article>
          <article><span>06</span><h3>Cohen&apos;s d 效果量計算</h3><p>用兩組平均數、標準差與樣本數計算標準化平均差，快速判斷效果方向與大小。結果應搭配信賴區間及領域脈絡解讀。</p><a href="#tools" onClick={() => setActive("effect")}>計算 Cohen&apos;s d →</a></article>
          <article><span>07</span><h3>平均數、中位數與標準差</h3><p>貼上 Excel 或統計軟體中的數值，就能查看樣本數、平均數、中位數、樣本標準差、四分位數與全距，適合先快速認識資料。</p><a href="#tools" onClick={() => openTool("descriptive")}>計算描述統計 →</a></article>
          <article><span>08</span><h3>2×2 表格與研究效果指標</h3><p>輸入暴露組與對照組的事件人數，計算風險比、勝算比、風險差、NNT 與 95% 信賴區間，適合世代研究與臨床研究初步整理。</p><a href="#tools" onClick={() => openTool("twobytwo")}>分析 2×2 表格 →</a></article>
          <article><span>09</span><h3>DOI、PMID 與 arXiv 整理</h3><p>從混雜的網址或文字中辨識學術識別碼，產生乾淨格式與可直接開啟的永久連結，減少整理參考資料時的複製錯誤。</p><a href="#tools" onClick={() => openTool("identifier")}>整理學術識別碼 →</a></article>
          <article><span>10</span><h3>平均數與比例信賴區間</h3><p>輸入平均數、標準差與樣本數，或成功人數與總樣本數，快速取得 90%、95% 或 99% 信賴區間與誤差範圍。</p><a href="#tools" onClick={() => openTool("confidence")}>計算信賴區間 →</a></article>
          <article><span>11</span><h3>Cronbach&apos;s α 信度分析</h3><p>貼上問卷受試者 × 題目的作答矩陣，計算內部一致性係數、受試者數與題目數，適合量表資料的第一輪品質檢查。</p><a href="#tools" onClick={() => openTool("reliability")}>檢查量表信度 →</a></article>
          <article><span>12</span><h3>可重現的研究隨機分組</h3><p>貼上參與者編號、設定組名與種子碼，建立人數盡量平衡且可重現的分派表，完成後可複製或下載 CSV。</p><a href="#tools" onClick={() => openTool("randomize")}>開始隨機分組 →</a></article>
        </div>
      </section>

      <section className="journey-section" id="journey">
        <div className="journey-heading">
          <div><p className="eyebrow">ACADEMIC LIFE / 03</p><h2>論文旅程，<br /><em>也需要一點沒用。</em></h2></div>
          <p>研究工具負責把事情做好；這些神奇小站負責陪你撐過寫作、口試、審查與結果揭曉。</p>
        </div>
        <div className="journey-grid">
          {researchJourney.map((item) => <a key={item.href} className={`journey-card ${item.tone}`} href={item.href} target="_blank" rel="noopener noreferrer">
            <span>{item.index} · {item.stage}</span><h3>{item.title}</h3><p>{item.note}</p><b>去這一站 ↗</b>
          </a>)}
        </div>
        <div className="journey-foot"><span>神奇無用工具 · 論文分類</span><p>有用與無用之間，通常只差一個 deadline。</p></div>
      </section>

      <section className="faq-section" id="faq">
        <div><p className="eyebrow">QUESTIONS / 04</p><h2>研究工具常見問題</h2><p className="faq-lede">這些工具適合快速整理與初步估算，但不取代研究方法、統計或投稿規範的專業審查。</p></div>
        <div className="faq-list">
          <details open><summary>文獻矩陣是什麼？</summary><p>文獻矩陣是把多篇研究的作者、年份、方法、發現與缺口放在同一套欄位中比較。它能幫助你看出研究共識、矛盾與尚未回答的問題，是撰寫文獻回顧與系統性整理的實用起點。</p></details>
          <details><summary>PICO 與 PECO 有什麼差別？</summary><p>PICO 的 I 代表介入，常用於治療、教育介入或實驗問題；PECO 的 E 代表暴露，較適合觀察性與風險因子研究。兩者都以 P（族群）、C（比較）與 O（結果）協助把研究問題轉成檢索概念。</p></details>
          <details><summary>APA 引用產生器可以直接用於投稿嗎？</summary><p>產生器適合建立 APA 7、MLA 9 或 Chicago 引用初稿。不同期刊可能調整作者縮寫、標題大小寫、DOI 呈現或標點，因此投稿前仍應對照該期刊最新指南。</p></details>
          <details><summary>樣本數與 Cohen&apos;s d 可以取代統計諮詢嗎？</summary><p>不可以。樣本數工具使用比例估計的基礎公式，Cohen&apos;s d 使用兩獨立組的合併標準差。正式研究仍需考量檢定力、分層或群聚設計、失訪率、分布假設與領域中的實質意義。</p></details>
          <details><summary>描述統計與 2×2 效果指標怎麼使用？</summary><p>描述統計可直接貼上以逗號、空白或換行分隔的數值；2×2 工具則填入兩組的事件與未事件人數。網站會同步顯示公式假設與解讀提醒，並提供範例資料讓第一次使用的人先試算。</p></details>
          <details><summary>DOI、PMID 與 arXiv 整理工具會查詢外部資料嗎？</summary><p>不會。工具只在瀏覽器中辨識並正規化你貼上的識別碼，再建立對應的官方連結，不會連線抓取論文標題、作者或摘要。</p></details>
          <details><summary>信賴區間、Cronbach&apos;s α 與隨機分組可以直接用於論文嗎？</summary><p>可用於資料檢查與研究規劃，但正式報告前仍要依研究設計確認統計假設。隨機分組請保留種子碼與匯出結果作為分派紀錄；Cronbach&apos;s α 也應搭配題目內容、反向題處理與其他效度證據解讀。</p></details>
          <details><summary>「神奇無用工具」是研究方法工具嗎？</summary><p>不是。論文旅程分類收錄寫作卡關、口試、等待審查、錄取與拒稿主題的小站，提供自嘲、心理準備與打氣；真正的方法與統計工作請使用研究工作臺。</p></details>
          <details><summary>輸入的研究資料會被上傳嗎？</summary><p>不會。研知的文字、文獻與數值運算都在瀏覽器中完成，不需要帳號，也不會把輸入內容傳送到遠端資料庫。請在離開頁面前匯出需要保留的文獻矩陣。</p></details>
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

function CopyButton({ value, label = "複製" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const success = await copyText(value);
    setCopied(success);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <button type="button" onClick={handleCopy} disabled={!value}>{copied ? "已複製 ✓" : label}</button>;
}

function LiteratureMatrix() {
  const [papers, setPapers] = useState<Paper[]>(initialPapers);
  const [draft, setDraft] = useState<Omit<Paper, "id">>({ author: "", year: "", title: "", method: "", finding: "", gap: "" });
  const [notice, setNotice] = useState("");
  const update = (key: keyof typeof draft, value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const add = () => {
    if (!draft.title.trim()) return;
    setPapers((items) => [...items, { ...draft, id: Date.now() }]);
    setDraft({ author: "", year: "", title: "", method: "", finding: "", gap: "" });
    setNotice("已加入文獻矩陣");
  };
  const exportCsv = () => {
    const rows = [["作者", "年份", "篇名", "方法", "主要發現", "研究缺口"], ...papers.map((p) => [p.author, p.year, p.title, p.method, p.finding, p.gap])];
    const blob = new Blob(["\ufeff" + rows.map((r) => r.map(csvEscape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "literature-matrix.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    setNotice("CSV 已下載，可用 Excel、Numbers 或試算表開啟");
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
    <div className="action-row"><button className="action" onClick={add}>加入矩陣 ＋</button><button className="secondary" onClick={exportCsv} disabled={!papers.length}>匯出 CSV ↓</button><span className="action-notice" role="status">{notice}</span></div>
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
    <div className="result-box"><div><span>BOOLEAN SEARCH STRING</span><CopyButton value={query} /></div><code>{query || "填入概念後，檢索式會出現在這裡。"}</code></div>
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
    <div className="result-box citation"><div><span>{style}</span><CopyButton value={data.title ? citation : ""} label="複製引用" /></div><p>{citation}</p></div>
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

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: digits }).format(value);
}

function DescriptiveCalculator() {
  const [raw, setRaw] = useState("");
  const values = useMemo(() => parseNumericData(raw), [raw]);
  const stats = useMemo(() => describe(values), [values]);
  const summary = stats
    ? `n = ${stats.count}; 平均數 = ${formatNumber(stats.mean, 3)}; 中位數 = ${formatNumber(stats.median, 3)}; 樣本標準差 = ${formatNumber(stats.sampleSd, 3)}; 最小值 = ${formatNumber(stats.min, 3)}; Q1 = ${formatNumber(stats.q1, 3)}; Q3 = ${formatNumber(stats.q3, 3)}; 最大值 = ${formatNumber(stats.max, 3)}`
    : "";

  return <div>
    <PanelHeader number="07" title="描述統計">貼上用逗號、空白或換行分隔的數值，立即掌握資料中心與分散程度。</PanelHeader>
    <div className="example-bar"><span>不知道怎麼開始？</span><button type="button" onClick={() => setRaw("12, 15, 18, 18, 20, 22, 25, 27, 29, 34")}>載入範例資料</button></div>
    <label className="full-label">數值資料<textarea className="data-textarea" value={raw} onChange={(event) => setRaw(event.target.value)} placeholder={"例：12, 15, 18, 20\n可直接貼上 Excel 的一欄數值"} /></label>
    {stats ? <>
      <div className="summary-grid" aria-label="描述統計結果">
        <div><span>樣本數 n</span><b>{stats.count}</b></div>
        <div><span>平均數</span><b>{formatNumber(stats.mean)}</b></div>
        <div><span>中位數</span><b>{formatNumber(stats.median)}</b></div>
        <div><span>樣本標準差</span><b>{formatNumber(stats.sampleSd)}</b></div>
        <div><span>最小值</span><b>{formatNumber(stats.min)}</b></div>
        <div><span>Q1</span><b>{formatNumber(stats.q1)}</b></div>
        <div><span>Q3</span><b>{formatNumber(stats.q3)}</b></div>
        <div><span>最大值</span><b>{formatNumber(stats.max)}</b></div>
      </div>
      <div className="result-actions"><p>已辨識 {stats.count} 個有效數值；樣本標準差以 n−1 為分母。</p><CopyButton value={summary} label="複製統計摘要" /></div>
    </> : <div className="empty-result">貼上至少一個數值後，結果會立即顯示。</div>}
    <p className="caveat">描述統計只能概括目前資料，不能單獨判斷常態性、離群值或推論統計是否適用。</p>
  </div>;
}

function TwoByTwoCalculator() {
  const [cells, setCells] = useState({ a: "", b: "", c: "", d: "" });
  const numbers = (Object.keys(cells) as (keyof typeof cells)[]).map((key) => Number(cells[key]));
  const complete = Object.values(cells).every((value) => value !== "");
  const result = complete ? calculateTwoByTwo(numbers[0], numbers[1], numbers[2], numbers[3]) : null;
  const setExample = () => setCells({ a: "30", b: "70", c: "15", d: "85" });
  const summary = result
    ? `暴露／介入組風險 ${formatNumber(result.exposedRisk * 100, 1)}%；對照組風險 ${formatNumber(result.controlRisk * 100, 1)}%；RR ${formatNumber(result.riskRatio)}（95% CI ${formatNumber(result.riskRatioCi[0])}–${formatNumber(result.riskRatioCi[1])}）；OR ${formatNumber(result.oddsRatio)}（95% CI ${formatNumber(result.oddsRatioCi[0])}–${formatNumber(result.oddsRatioCi[1])}）；風險差 ${formatNumber(result.riskDifference * 100, 1)} 個百分點${result.nnt ? `；NNT/NNH ${Math.ceil(result.nnt)}` : ""}`
    : "";

  return <div>
    <PanelHeader number="08" title="2×2 效果指標">用事件與未事件人數，快速計算 RR、OR、風險差、NNT／NNH 與 95% 信賴區間。</PanelHeader>
    <div className="example-bar"><span>欄位怎麼填？輸入每一格的人數</span><button type="button" onClick={setExample}>載入範例</button></div>
    <div className="two-table" role="group" aria-label="2×2 研究資料表">
      <div className="table-corner" aria-hidden="true" /><b>有事件</b><b>無事件</b>
      <strong>暴露／介入組</strong><label><span className="sr-only">暴露／介入組有事件</span><input aria-label="暴露／介入組有事件" type="number" min="0" value={cells.a} onChange={(event) => setCells((old) => ({ ...old, a: event.target.value }))} placeholder="a" /></label><label><span className="sr-only">暴露／介入組無事件</span><input aria-label="暴露／介入組無事件" type="number" min="0" value={cells.b} onChange={(event) => setCells((old) => ({ ...old, b: event.target.value }))} placeholder="b" /></label>
      <strong>對照組</strong><label><span className="sr-only">對照組有事件</span><input aria-label="對照組有事件" type="number" min="0" value={cells.c} onChange={(event) => setCells((old) => ({ ...old, c: event.target.value }))} placeholder="c" /></label><label><span className="sr-only">對照組無事件</span><input aria-label="對照組無事件" type="number" min="0" value={cells.d} onChange={(event) => setCells((old) => ({ ...old, d: event.target.value }))} placeholder="d" /></label>
    </div>
    {result ? <>
      <div className="metric-grid">
        <div><span>風險比 RR</span><b>{formatNumber(result.riskRatio)}</b><small>95% CI {formatNumber(result.riskRatioCi[0])}–{formatNumber(result.riskRatioCi[1])}</small></div>
        <div><span>勝算比 OR</span><b>{formatNumber(result.oddsRatio)}</b><small>95% CI {formatNumber(result.oddsRatioCi[0])}–{formatNumber(result.oddsRatioCi[1])}</small></div>
        <div><span>風險差</span><b>{formatNumber(result.riskDifference * 100, 1)}%</b><small>兩組絕對風險差</small></div>
        <div><span>{result.riskDifference < 0 ? "NNT" : "NNH"}</span><b>{result.nnt ? Math.ceil(result.nnt) : "—"}</b><small>{result.riskDifference < 0 ? "避免一個事件" : "增加一個事件"}</small></div>
      </div>
      <div className="result-actions"><p>組別風險：{formatNumber(result.exposedRisk * 100, 1)}% vs. {formatNumber(result.controlRisk * 100, 1)}%</p><CopyButton value={summary} label="複製結果摘要" /></div>
      {result.usedCorrection && <p className="calculation-note">因表格含 0，RR、OR 與信賴區間已對四格各加 0.5 修正。</p>}
    </> : <div className="empty-result">填滿四格非負人數後，研究效果指標會顯示在這裡。</div>}
    <p className="caveat">RR 常用於世代與介入研究；病例對照研究通常解讀 OR。信賴區間採常見的大樣本近似，正式分析仍需依研究設計選擇方法。</p>
  </div>;
}

function IdentifierCleaner() {
  const [input, setInput] = useState("");
  const identifier = useMemo(() => normalizeAcademicIdentifier(input), [input]);

  return <div>
    <PanelHeader number="09" title="學術識別碼整理">貼上 DOI、PubMed 或 arXiv 網址，取得乾淨識別碼與可直接使用的永久連結。</PanelHeader>
    <div className="example-bar"><span>支援 DOI、PMID 與 arXiv</span><button type="button" onClick={() => setInput("https://doi.org/10.1016/j.cose.2025.104649")}>載入 DOI 範例</button></div>
    <label className="full-label">識別碼或網址<input value={input} onChange={(event) => setInput(event.target.value)} placeholder="貼上 doi:10…、PubMed 網址或 arXiv:…" autoCapitalize="off" spellCheck={false} /></label>
    {identifier ? <div className="identifier-result">
      <span>{identifier.type}</span>
      <strong>{identifier.value}</strong>
      <a href={identifier.url} target="_blank" rel="noopener noreferrer">開啟正式頁面 ↗</a>
      <div><CopyButton value={identifier.value} label="複製識別碼" /><CopyButton value={identifier.url} label="複製永久連結" /></div>
    </div> : <div className="empty-result">貼上識別碼後，系統會自動辨識類型並移除多餘網址與標點。</div>}
    <p className="caveat">此工具只整理識別碼，不會連線查詢論文內容。若無法辨識，請確認 DOI、PMID 或 arXiv 編號是否完整。</p>
  </div>;
}

function ConfidenceIntervalCalculator() {
  const [kind, setKind] = useState<"mean" | "proportion">("mean");
  const [confidence, setConfidence] = useState<90 | 95 | 99>(95);
  const [meanData, setMeanData] = useState({ mean: "", sd: "", n: "" });
  const [proportionData, setProportionData] = useState({ successes: "", n: "" });
  const meanResult = kind === "mean" ? meanConfidenceInterval(Number(meanData.mean), Number(meanData.sd), Number(meanData.n), confidence) : null;
  const proportionResult = kind === "proportion" ? proportionConfidenceInterval(Number(proportionData.successes), Number(proportionData.n), confidence) : null;
  const summary = meanResult
    ? `平均數 ${meanData.mean}，${confidence}% CI [${formatNumber(meanResult.lower, 3)}, ${formatNumber(meanResult.upper, 3)}]，誤差範圍 ±${formatNumber(meanResult.margin, 3)}，n = ${meanData.n}`
    : proportionResult
      ? `比例 ${formatNumber(proportionResult.proportion * 100, 1)}%，${confidence}% Wilson CI [${formatNumber(proportionResult.lower * 100, 1)}%, ${formatNumber(proportionResult.upper * 100, 1)}%]，n = ${proportionData.n}`
      : "";

  return <div>
    <PanelHeader number="10" title="信賴區間計算">計算平均數的 t 信賴區間，或比例的 Wilson 信賴區間。</PanelHeader>
    <div className="segmented"><button className={kind === "mean" ? "active" : ""} onClick={() => setKind("mean")}>平均數</button><button className={kind === "proportion" ? "active" : ""} onClick={() => setKind("proportion")}>比例</button></div>
    <div className="example-bar"><span>信賴水準</span><div className="mini-options">{([90, 95, 99] as const).map((value) => <button key={value} type="button" className={confidence === value ? "active" : ""} onClick={() => setConfidence(value)}>{value}%</button>)}</div></div>
    {kind === "mean" ? <>
      <div className="form-grid thirds">
        <label>樣本平均數<input aria-label="樣本平均數" type="number" value={meanData.mean} onChange={(event) => setMeanData((old) => ({ ...old, mean: event.target.value }))} /></label>
        <label>樣本標準差<input aria-label="樣本標準差" type="number" min="0" value={meanData.sd} onChange={(event) => setMeanData((old) => ({ ...old, sd: event.target.value }))} /></label>
        <label>樣本數<input aria-label="信賴區間樣本數" type="number" min="2" value={meanData.n} onChange={(event) => setMeanData((old) => ({ ...old, n: event.target.value }))} /></label>
      </div>
      <button className="sample-link" type="button" onClick={() => setMeanData({ mean: "72.4", sd: "10.8", n: "64" })}>載入平均數範例</button>
    </> : <>
      <div className="form-grid">
        <label>成功／事件人數<input aria-label="成功／事件人數" type="number" min="0" value={proportionData.successes} onChange={(event) => setProportionData((old) => ({ ...old, successes: event.target.value }))} /></label>
        <label>總樣本數<input aria-label="比例總樣本數" type="number" min="1" value={proportionData.n} onChange={(event) => setProportionData((old) => ({ ...old, n: event.target.value }))} /></label>
      </div>
      <button className="sample-link" type="button" onClick={() => setProportionData({ successes: "84", n: "120" })}>載入比例範例</button>
    </>}
    {meanResult ? <div className="interval-result"><span>{confidence}% CONFIDENCE INTERVAL</span><strong>{formatNumber(meanResult.lower, 2)} — {formatNumber(meanResult.upper, 2)}</strong><p>誤差範圍 ±{formatNumber(meanResult.margin, 2)} · 使用 t 臨界值 {formatNumber(meanResult.criticalValue, 3)}</p><CopyButton value={summary} label="複製結果" /></div>
      : proportionResult ? <div className="interval-result"><span>{confidence}% WILSON INTERVAL</span><strong>{formatNumber(proportionResult.lower * 100, 1)}% — {formatNumber(proportionResult.upper * 100, 1)}%</strong><p>樣本比例 {formatNumber(proportionResult.proportion * 100, 1)}% · Wilson score interval</p><CopyButton value={summary} label="複製結果" /></div>
        : <div className="empty-result">填入完整且有效的數值後，信賴區間會顯示在這裡。</div>}
    <p className="caveat">信賴區間反映估計的不確定性，不代表有 {confidence}% 的個別觀測值落在區間內。複雜抽樣與群聚資料需使用對應方法。</p>
  </div>;
}

function ReliabilityCalculator() {
  const [raw, setRaw] = useState("");
  const matrix = useMemo(() => parseNumericMatrix(raw), [raw]);
  const result = useMemo(() => matrix ? cronbachAlpha(matrix) : null, [matrix]);
  const interpretation = result
    ? result.alpha >= .9 ? "極高內部一致性" : result.alpha >= .8 ? "良好內部一致性" : result.alpha >= .7 ? "可接受內部一致性" : result.alpha >= .6 ? "偏低，建議檢查題目" : "低或異常，需重新檢查量表"
    : "";
  const summary = result ? `Cronbach's α = ${formatNumber(result.alpha, 3)}；${result.respondents} 位受試者；${result.items} 題；${interpretation}` : "";

  return <div>
    <PanelHeader number="11" title="Cronbach's α 信度分析">每列一位受試者、每欄一個題目，快速檢查量表內部一致性。</PanelHeader>
    <div className="example-bar"><span>可從 Excel 直接複製多欄資料</span><button type="button" onClick={() => setRaw("4,5,4,5\n3,4,3,4\n5,5,4,5\n2,3,2,3\n4,4,5,4\n3,3,4,3")}>載入 6×4 範例</button></div>
    <label className="full-label">受試者 × 題目作答矩陣<textarea className="data-textarea matrix-input" value={raw} onChange={(event) => setRaw(event.target.value)} placeholder={"4, 5, 4, 5\n3, 4, 3, 4\n每列一位受試者；逗號、空白或 Tab 皆可"} /></label>
    {result ? <div className="reliability-result">
      <div><span>CRONBACH&apos;S α</span><strong>{formatNumber(result.alpha, 3)}</strong><b>{interpretation}</b></div>
      <dl><div><dt>受試者</dt><dd>{result.respondents}</dd></div><div><dt>題目數</dt><dd>{result.items}</dd></div></dl>
      <CopyButton value={summary} label="複製信度摘要" />
    </div> : <div className="empty-result">貼上至少 2 位受試者、2 個題目的完整數值矩陣。</div>}
    <p className="caveat">請先完成反向題重新計分並處理遺漏值。α 高不代表量表單一向度或有效，也不應只依固定門檻刪題。</p>
  </div>;
}

function RandomizationTool() {
  const [participants, setParticipants] = useState("");
  const [groups, setGroups] = useState("介入組, 對照組");
  const [seed, setSeed] = useState("");
  const [notice, setNotice] = useState("");
  const participantList = useMemo(() => participants.split(/[\n,，;；]+/), [participants]);
  const groupList = useMemo(() => groups.split(/[,，;；\n]+/), [groups]);
  const assignments = useMemo(() => assignRandomGroups(participantList, groupList, seed), [participantList, groupList, seed]);
  const csv = assignments.length ? [["分派順序", "參與者", "組別"], ...assignments.map((item) => [String(item.order), item.participant, item.group])].map((row) => row.map(csvEscape).join(",")).join("\n") : "";
  const counts = assignments.reduce<Record<string, number>>((all, item) => ({ ...all, [item.group]: (all[item.group] || 0) + 1 }), {});
  const loadExample = () => {
    setParticipants(Array.from({ length: 12 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`).join("\n"));
    setGroups("介入組, 對照組");
    setSeed("research-2026");
  };
  const exportAssignments = () => {
    downloadText("random-assignment.csv", csv);
    setNotice("分派表已下載");
  };

  return <div>
    <PanelHeader number="12" title="可重現隨機分組">使用種子碼打亂參與者，平均輪流分派至各組；同一份輸入與種子會得到相同結果。</PanelHeader>
    <div className="example-bar"><span>正式使用前先用範例確認格式</span><button type="button" onClick={loadExample}>載入 12 人範例</button></div>
    <div className="form-grid random-form">
      <label>參與者編號<textarea value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder={"P01\nP02\nP03"} /></label>
      <div className="stacked-fields"><label>組別名稱<input value={groups} onChange={(event) => setGroups(event.target.value)} placeholder="介入組, 對照組" /></label><label>種子碼<input value={seed} onChange={(event) => setSeed(event.target.value)} placeholder="請輸入並保存種子碼" /></label></div>
    </div>
    {assignments.length ? <>
      <div className="assignment-summary">{Object.entries(counts).map(([group, count]) => <span key={group}><b>{group}</b>{count} 人</span>)}</div>
      <div className="assignment-table" role="table" aria-label="隨機分組結果">
        <div role="row"><b role="columnheader">順序</b><b role="columnheader">參與者</b><b role="columnheader">組別</b></div>
        {assignments.map((item) => <div role="row" key={item.participant}><span role="cell">{item.order}</span><span role="cell">{item.participant}</span><strong role="cell">{item.group}</strong></div>)}
      </div>
      <div className="action-row"><CopyButton value={csv} label="複製分派表" /><button className="secondary" type="button" onClick={exportAssignments}>匯出 CSV ↓</button><span className="action-notice" role="status">{notice}</span></div>
    </> : <div className="empty-result">輸入參與者、至少兩個組別與種子碼後，即時產生分派結果。</div>}
    <p className="caveat">此工具為簡單平衡分派，不含分層、區塊大小隱藏或配置隱蔽。臨床試驗等高風險研究請使用經審查的隨機化程序並保存完整稽核紀錄。</p>
  </div>;
}
