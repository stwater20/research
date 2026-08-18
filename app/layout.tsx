import type { Metadata } from "next";
import { Noto_Sans_TC, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://research.sectools.tw"),
  title: { default: "研知 Research Toolkit｜免費中文研究工具箱", template: "%s｜研知 Research Toolkit" },
  description: "免費中文研究工具箱：線上整理文獻矩陣、建立 PICO／PECO 研究問題、產生 APA 7 引用格式，並計算樣本數與 Cohen's d 效果量。免登入，資料不離開瀏覽器。",
  keywords: ["研究工具", "免費研究工具", "中文研究工具", "文獻矩陣", "文獻回顧", "PICO", "PECO", "APA 7 引用格式", "引用產生器", "樣本數計算", "效果量計算", "Cohen's d", "論文工具"],
  authors: [{ name: "SecTools.tw", url: "https://sectools.tw/" }],
  creator: "SecTools.tw",
  publisher: "SecTools.tw",
  category: "Education",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { title: "研知 Research Toolkit｜免費中文研究工具箱", description: "文獻矩陣、PICO／PECO、APA 引用、文字分析、樣本數與效果量計算，一站完成。", type: "website", url: "/", siteName: "研知 Research Toolkit", locale: "zh_TW", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "研知 Research Toolkit 免費中文研究工具箱" }] },
  twitter: { card: "summary_large_image", title: "研知 Research Toolkit｜免費中文研究工具箱", description: "把時間留給真正的問題。六個免費、隱私優先的中文研究工具。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
