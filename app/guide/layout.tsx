import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "初めての方へ｜ご利用ガイド（越谷市・春日部市）",
  description:
    "RE:TERA HOMEの初めての方向けご利用ガイド。サービスの選び方・Web予約の流れ・料金の仕組み（税込・追加料金なし）・当日までの準備・お支払い・キャンセルまで、初めてでも安心してご利用いただけるよう分かりやすくご案内します。越谷市・春日部市対応。",
  alternates: { canonical: "/guide" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
