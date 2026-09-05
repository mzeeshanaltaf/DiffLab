import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/compare/text", priority: 0.9, changeFrequency: "monthly" },
    { path: "/compare/json", priority: 0.9, changeFrequency: "monthly" },
    { path: "/compare/excel", priority: 0.9, changeFrequency: "monthly" },
    { path: "/compare/image", priority: 0.9, changeFrequency: "monthly" },
    { path: "/compare/document", priority: 0.9, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
