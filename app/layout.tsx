import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { ReformProvider } from "@/context/ReformContext";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  metadataBase: new URL(COMPANY.url),
  title: {
    default: "RE:TERA HOME｜越谷・春日部のハウスクリーニング・リフォーム",
    template: "%s｜RE:TERA HOME",
  },
  description:
    "エアコン・水回りのハウスクリーニングからリフォームまで。越谷市・春日部市に地域密着で対応。料金は税込表示・追加料金なし、Webから最短で予約できます。",
  openGraph: {
    type: "website",
    siteName: "RE:TERA HOME",
    title: "RE:TERA HOME｜越谷・春日部のハウスクリーニング・リフォーム",
    description:
      "エアコン・水回りのハウスクリーニングからリフォームまで。越谷市・春日部市に地域密着で対応。Webから最短で予約できます。",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary",
    title: "RE:TERA HOME｜越谷・春日部のハウスクリーニング",
    description: "エアコン・水回りのクリーニングからリフォームまで、Webでかんたん予約。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 拡大操作を妨げない（アクセシビリティ配慮のため maximumScale は指定しない）
};

// ローカルビジネスの構造化データ（検索エンジン向け）
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: COMPANY.name,
  url: COMPANY.url,
  email: COMPANY.email,
  areaServed: ["越谷市", "春日部市"],
  description:
    "エアコン・水回りのハウスクリーニングとリフォームを提供する地域密着サービス。",
  priceRange: "¥8,000〜",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <BookingProvider>
            <ReformProvider>{children}</ReformProvider>
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
