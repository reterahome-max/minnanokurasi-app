import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "法人・管理会社の方へ｜空室クリーニング・原状回復",
  description:
    "越谷市・春日部市の賃貸物件の空室クリーニング・原状回復・退去後清掃は RE:TERA HOME へ。管理会社・オーナー様向けに複数戸まとめてのご依頼や定期清掃のご相談を承ります。",
  alternates: { canonical: "/corporate" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
