import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { ReformProvider } from "@/context/ReformContext";

export const metadata: Metadata = {
  title: "RE:TERA HOME — ハウスクリーニング",
  description:
    "エアコン・水回りなどのハウスクリーニングは RE:TERA HOME におまかせください。越谷市・春日部市に迅速対応。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <BookingProvider>
            <ReformProvider>{children}</ReformProvider>
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
