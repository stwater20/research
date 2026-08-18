import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "研知 Research Toolkit",
    short_name: "研知",
    description: "為中文研究者設計的免費、隱私優先研究工具箱。",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1e9",
    theme_color: "#183e30",
    lang: "zh-Hant-TW",
  };
}
