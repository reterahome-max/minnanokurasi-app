import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";
import { popularList } from "@/lib/pricing";
import { REFORM_ITEMS } from "@/lib/reformPricing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = COMPANY.url;
  const now = new Date();

  const staticPages = [
    { url: `${base}/`, priority: 1.0 },
    { url: `${base}/services`, priority: 0.9 },
    { url: `${base}/simulator`, priority: 0.9 },
    { url: `${base}/reform`, priority: 0.9 },
    { url: `${base}/reform/simulator`, priority: 0.8 },
    { url: `${base}/corporate`, priority: 0.6 },
    { url: `${base}/legal`, priority: 0.4 },
  ];

  const servicePages = popularList().map((s) => ({
    url: `${base}/services/${s.id}`,
    priority: 0.8,
  }));

  const reformPages = REFORM_ITEMS.map((i) => ({
    url: `${base}/reform/${i.id}`,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...reformPages].map((p) => ({
    ...p,
    lastModified: now,
    changeFrequency: "weekly" as const,
  }));
}
