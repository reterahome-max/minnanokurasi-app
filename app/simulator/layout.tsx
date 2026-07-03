import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金シミュレーター｜30秒でわかるクリーニング料金",
  description:
    "エアコンクリーニングやハウスクリーニングの料金を30秒でシミュレーション。台数・オプションを選ぶだけで税込総額を確認できます。越谷市・春日部市対応、追加料金なし。",
  alternates: { canonical: "/simulator" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
