import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金シミュレーター",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
