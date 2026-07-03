import type { Metadata } from "next";
import { SERVICES, getService, num } from "@/lib/pricing";
import { COMPANY } from "@/lib/company";

/**
 * サービス詳細のメタ情報（SEO）。
 * title / description / canonical / OGP を lib/pricing から自動生成する。
 * 全サービスIDを静的生成（generateStaticParams）して TTFB とクロール効率を改善。
 */

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const s = getService(decodeURIComponent(id));
  if (!s) return { title: "ページが見つかりません", robots: { index: false, follow: false } };

  const title = `${s.title}｜越谷市・春日部市`;
  const description = `越谷市・春日部市の${s.title}は税込${num(s.price)}円〜（1${s.unitLabel}）。${s.desc}。追加料金なしの明朗会計、Webから最短で予約できます。ビフォーアフター写真掲載。`;
  const path = `/services/${s.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${s.title}｜${COMPANY.name}`,
      description,
      url: path,
      type: "website",
    },
  };
}

// パンくず構造化データ（画面のヘッダー戻り導線に対応）
async function Breadcrumb({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getService(decodeURIComponent(id));
  if (!s) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${COMPANY.url}/` },
      { "@type": "ListItem", position: 2, name: "サービス一覧", item: `${COMPANY.url}/services` },
      { "@type": "ListItem", position: 3, name: s.title, item: `${COMPANY.url}/services/${s.id}` },
    ],
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export default async function Layout(
  { children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }
) {
  return (
    <>
      <Breadcrumb params={params} />
      {children}
    </>
  );
}
