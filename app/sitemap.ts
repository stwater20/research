import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: "https://research.sectools.tw/",
    lastModified: new Date("2026-08-18T00:00:00+08:00"),
    changeFrequency: "weekly",
    priority: 1,
  }];
}
