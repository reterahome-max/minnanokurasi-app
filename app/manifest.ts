import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/company";

/** PWA マニフェスト（ホーム画面に追加・スタンドアロン表示） */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${COMPANY.name}｜越谷・春日部のハウスクリーニング・リフォーム`,
    short_name: COMPANY.name,
    description:
      "エアコン・水回りのハウスクリーニングからリフォームまで。越谷市・春日部市に地域密着で対応。Webから最短で予約できます。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#C9352E",
    lang: "ja",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
