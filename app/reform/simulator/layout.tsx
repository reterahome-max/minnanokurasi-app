import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "リフォーム見積シミュレーター｜概算がすぐわかる",
  description:
    "クロス・床・建具・水回りのリフォーム費用を、広さや数量を選ぶだけで概算シミュレーション。越谷市・春日部市対応、材料・施工費込みの税抜価格で分かりやすくご案内します。",
  alternates: { canonical: "/reform/simulator" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
