import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

/**
 * 法人 原状回復のサービス紹介（SEO用・indexable）。
 * 見積シミュレーター（/corporate/restoration/simulator）への集客導線。
 */
export const metadata: Metadata = {
  title: "原状回復・退去後清掃（法人向け）｜越谷市・春日部市",
  description:
    "越谷市・春日部市の賃貸物件の原状回復・退去後清掃は RE:TERA HOME へ。空室クリーニング・クロス張替え・床材補修・設備交換までまとめて対応。管理会社・オーナー様向けに、Webで概算がわかる見積シミュレーターをご用意しています。",
  alternates: { canonical: "/corporate/restoration" },
  openGraph: {
    title: `原状回復・退去後清掃（法人向け）｜${COMPANY.name}`,
    description:
      "空室クリーニングからクロス・床・設備までまとめて対応。Webで概算がわかる原状回復の見積シミュレーター。越谷市・春日部市の管理会社・オーナー様向け。",
    url: "/corporate/restoration",
    type: "website",
  },
};

function StructuredData() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${COMPANY.url}/` },
      { "@type": "ListItem", position: 2, name: "法人・管理会社の方へ", item: `${COMPANY.url}/corporate` },
      { "@type": "ListItem", position: 3, name: "原状回復・退去後清掃", item: `${COMPANY.url}/corporate/restoration` },
    ],
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "原状回復・退去後清掃（法人向け）",
    serviceType: "原状回復",
    provider: { "@type": "HomeAndConstructionBusiness", name: COMPANY.name, telephone: COMPANY.tel, address: COMPANY.address, url: COMPANY.url },
    areaServed: ["越谷市", "春日部市"],
    description:
      "賃貸物件の原状回復・退去後清掃。空室クリーニング、クロス（壁紙）張替え、床材補修、設備交換までまとめて対応します。",
    url: `${COMPANY.url}/corporate/restoration`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData />
      {children}
    </>
  );
}
