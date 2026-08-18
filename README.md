# 研知 Research Toolkit

一套隱私優先、免登入的研究工作工具，預計部署於 [research.sectools.tw](https://research.sectools.tw/)。

## 首批工具

- 文獻矩陣：加入、比較、刪除與匯出 CSV
- 研究問題框架：PICO / PECO 與布林檢索式
- 引用產生器：APA 7、MLA 9、Chicago
- 文字分析：中英文字數、句子、閱讀時間與高頻詞
- 樣本數估算：比例研究與有限母體修正
- 效果量計算：兩獨立組的 Cohen's d
- 描述統計：平均數、中位數、樣本標準差與四分位數
- 2×2 效果指標：風險比、勝算比、風險差、NNT／NNH 與 95% 信賴區間
- 學術識別碼整理：正規化 DOI、PMID 與 arXiv 並產生永久連結

文獻矩陣預載 Sheng-Shan Chen 的公開著作作為可編輯範例，來源連回 Google Scholar 與出版頁面。

## 隱私與安全

- 所有輸入與計算都在瀏覽器內完成
- 不需註冊、沒有追蹤碼，也不把研究內容送到遠端
- 網站不提供醫療或統計決策建議；計算結果應由研究方法或統計專家覆核
- 外部著作連結以新分頁開啟，並使用 `noopener noreferrer`

## 開發

需要 Node.js 22.13 或更新版本。

```bash
npm install
npm run dev
npm test
npm run lint
```

本專案目前採 vinext 產生 Cloudflare Worker 相容輸出，正式網域預留為 `research.sectools.tw`。
