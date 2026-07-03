import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "施工事例・ビフォーアフター｜越谷市・春日部市",
  description:
    "越谷市・春日部市エリアで対応したハウスクリーニング・リフォームの実際の施工写真を掲載。エアコン・浴室・キッチンの清掃から、クロス・床の張り替え、トイレ交換まで、施工前後をスライダーで比較できます。",
  alternates: { canonical: "/works" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
