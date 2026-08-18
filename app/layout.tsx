import type { Metadata } from "next";
import { Noto_Sans_TC, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const serif = Newsreader({ variable: "--font-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://research.sectools.tw"),
  title: "研知 Research Toolkit｜免費研究工具箱",
  description: "文獻矩陣、研究問題框架、引用格式、文字分析、樣本數與效果量計算。免登入，資料不離開瀏覽器。",
  keywords: ["研究工具", "文獻矩陣", "PICO", "引用格式", "樣本數計算", "Cohen's d"],
  alternates: { canonical: "/" },
  openGraph: { title: "研知 Research Toolkit", description: "把時間留給真正的問題。六個免費、隱私優先的研究工具。", type: "website", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "研知 Research Toolkit" }] },
  twitter: { card: "summary_large_image", title: "研知 Research Toolkit", description: "把時間留給真正的問題。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
