import type { Metadata } from "next";
import { CITIES, getCity } from "../cities";
import { COMPANY } from "@/lib/company";

/**
 * エリア別LPのメタ情報＋構造化データ（地域SEOの受け皿）。
 * 全市を静的生成。canonical・OG・BreadcrumbList・Service・FAQPage を出力する。
 */

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "ページが見つかりません", robots: { index: false, follow: false } };
  const path = `/area/${c.slug}`;
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: path },
    openGraph: { title: `${c.title}｜${COMPANY.name}`, description: c.description, url: path, type: "website" },
  };
}

async function StructuredData({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return null;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${COMPANY.url}/` },
      { "@type": "ListItem", position: 2, name: `${c.name}のハウスクリーニング`, item: `${COMPANY.url}/area/${c.slug}` },
    ],
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${c.name}のハウスクリーニング・リフォーム`,
    serviceType: "ハウスクリーニング",
    provider: { "@type": "HomeAndConstructionBusiness", name: COMPANY.name, telephone: COMPANY.tel, address: COMPANY.address, url: COMPANY.url },
    areaServed: c.name,
    description: c.description,
    url: `${COMPANY.url}/area/${c.slug}`,
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ city: string }> }
) {
  return (
    <>
      <StructuredData params={params} />
      {children}
    </>
  );
}
