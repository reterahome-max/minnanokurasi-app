import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "予約・注文一覧",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
