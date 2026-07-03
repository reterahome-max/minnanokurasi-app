import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 個人情報・フロー中間・会員ページはインデックスさせない
      disallow: [
        "/booking/",
        "/login",
        "/signup",
        "/mypage",
        "/orders",
        "/reorder",
        "/messages",
        "/settings/",
        "/reform/survey",
      ],
    },
    sitemap: `${COMPANY.url}/sitemap.xml`,
  };
}
