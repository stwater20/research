import { ResearchToolkit } from "./research-toolkit";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://research.sectools.tw/#website",
      url: "https://research.sectools.tw/",
      name: "研知 Research Toolkit",
      alternateName: ["研知研究工具箱", "免費研究工具"],
      description: "為中文研究者設計的免費研究工具箱，提供文獻矩陣、PICO 與 PECO、引用格式、文字分析、樣本數與效果量計算。",
      inLanguage: "zh-Hant-TW",
    },
    {
      "@type": "WebApplication",
      "@id": "https://research.sectools.tw/#app",
      name: "研知 Research Toolkit",
      url: "https://research.sectools.tw/",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      inLanguage: "zh-Hant-TW",
      description: "免登入、資料不離開瀏覽器的中文研究工具，協助整理文獻、建立研究問題、產生引用並進行基礎統計估算。",
      featureList: ["文獻矩陣與 CSV 匯出", "PICO 與 PECO 研究問題框架", "APA 7、MLA 9 與 Chicago 引用格式", "中英文文字分析", "樣本數估算", "Cohen's d 效果量計算"],
      publisher: { "@type": "Organization", name: "SecTools.tw", url: "https://sectools.tw/" },
    },
    {
      "@type": "ItemList",
      name: "免費中文研究工具",
      itemListElement: ["文獻矩陣", "PICO／PECO 研究問題框架", "APA／MLA／Chicago 引用產生器", "中英文文字分析", "研究樣本數估算", "Cohen's d 效果量計算"].map((name, index) => ({ "@type": "ListItem", position: index + 1, name })),
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        ["文獻矩陣是什麼？", "文獻矩陣把作者、年份、研究方法、主要發現與研究缺口放進同一套表格，方便比較多篇論文並整理文獻回顧。"],
        ["PICO 與 PECO 有什麼差別？", "PICO 適合介入或治療問題，I 代表介入；PECO 適合觀察性研究，E 代表暴露因子。兩者都能協助建立可搜尋的研究問題。"],
        ["引用產生器可以直接投稿嗎？", "工具可快速產生 APA 7、MLA 9 與 Chicago 基礎格式，但投稿前仍應依期刊指南核對作者姓名、大小寫、卷期與 DOI。"],
        ["樣本數與 Cohen's d 結果可以取代統計諮詢嗎？", "不可以。網站提供初步研究規劃與效果量估算，正式研究仍須考量檢定力、研究設計、失訪率與領域慣例。"],
      ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
    },
  ],
};

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <ResearchToolkit />
  </>;
}
