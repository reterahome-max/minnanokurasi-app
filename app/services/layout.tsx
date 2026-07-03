import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "サービス一覧・料金｜越谷市・春日部市のハウスクリーニング",
    template: "%s｜RE:TERA HOME",
  },
  description:
    "エアコン・浴室・キッチン・レンジフード・トイレ・洗面所・空室クリーニングの料金一覧。越谷市・春日部市に地域密着、税込表示・追加料金なし。人気順・価格順で比較してWebから予約できます。",
  alternates: { canonical: "/services" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
