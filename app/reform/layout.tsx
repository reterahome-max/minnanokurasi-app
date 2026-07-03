import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "リフォーム｜越谷市・春日部市の内装リフォーム",
    template: "%s｜RE:TERA HOME",
  },
  description:
    "クロス張り替え980円/㎡〜、CF・フローリング・フロアタイル張り替え、トイレ交換、網戸張り替え、壁穴補修まで。越谷市・春日部市の内装リフォームは材料・施工費込みの明朗価格で対応します。",
  alternates: { canonical: "/reform" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
