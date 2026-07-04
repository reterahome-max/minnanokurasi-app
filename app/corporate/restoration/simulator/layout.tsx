import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "法人 原状回復シミュレーター",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
