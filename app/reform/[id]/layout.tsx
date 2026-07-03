import type { Metadata } from "next";
import { REFORM_ITEMS, getReformItem, type ReformItem } from "@/lib/reformPricing";
import { COMPANY } from "@/lib/company";

/**
 * リフォーム工事詳細のメタ情報（SEO）。
 * title / description / canonical / OGP を lib/reformPricing から自動生成する。
 * 価格計算ロジックには一切触れない（表示用の代表価格文字列のみ組み立て）。
 */

const num = (n: number) => n.toLocaleString("ja-JP");

// 代表価格の表示文字列（method 別・税抜）
const priceLabel = (it: ReformItem): string => {
  switch (it.method) {
    case "area":
    case "unit":
      return `税抜${num(it.unitPrice ?? 0)}円/${it.unitLabel}〜`;
    case "tiered":
      return `税抜${num(it.tiers?.[0].price ?? 0)}円〜`;
    case "set":
      return `税抜${num(it.setPrice ?? 0)}円〜（材料・標準施工込み）`;
    case "small":
      return `小空間一式 税抜${num(35000)}円`;
  }
};

export function generateStaticParams() {
  return REFORM_ITEMS.map((i) => ({ id: i.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const it = getReformItem(decodeURIComponent(id));
  if (!it) return { title: "ページが見つかりません", robots: { index: false, follow: false } };

  const title = `${it.title}｜越谷・春日部のリフォーム`;
  const description = `越谷市・春日部市の${it.title}は${priceLabel(it)}。${it.note ?? "現地の状況に合わせてお見積りします。"}地域密着で丁寧に施工、Webからかんたんに概算・ご相談いただけます。`;
  const path = `/reform/${it.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${it.title}｜${COMPANY.name}`,
      description,
      url: path,
      type: "website",
    },
  };
}

// パンくず構造化データ
async function Breadcrumb({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = getReformItem(decodeURIComponent(id));
  if (!it) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${COMPANY.url}/` },
      { "@type": "ListItem", position: 2, name: "リフォーム", item: `${COMPANY.url}/reform` },
      { "@type": "ListItem", position: 3, name: it.title, item: `${COMPANY.url}/reform/${it.id}` },
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
