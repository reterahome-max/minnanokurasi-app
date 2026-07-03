/**
 * RE:TERA HOME — 画像URL集約（単一データソース）
 * ───────────────────────────────────────────────
 * 各画面の Photo は srcKey でここを参照します。
 * URL を入れるだけで全 <img> が差し替わります（空文字はプレースホルダー表示）。
 * 将来 Firestore / CMS / public 画像に移す場合も、このマップの値だけ差し替えれば全画面に反映されます。
 */

export const IMAGES: Record<string, string> = {
  hero: "",
  // 人気・カテゴリ サムネ（実写真の「After（仕上がり）」を流用）
  ac: "/images/ba_ac_after.jpg",
  bath: "/images/ba_bath_after.jpg",
  hood: "",
  kitchen: "",
  toilet: "",
  washroom: "/images/ba_water_after.jpg",
  fan: "",
  vacancy: "",
  // リフォーム サムネ
  cloth: "",
  floor: "",
  door: "",
  net: "",
  patch: "",
  // ビフォーアフター（実写真）
  ba_ac_before: "/images/ba_ac_before.jpg",
  ba_ac_after: "/images/ba_ac_after.jpg",
  ba_bath_before: "/images/ba_bath_before.jpg",
  ba_bath_after: "/images/ba_bath_after.jpg",
  ba_hood_before: "",
  ba_hood_after: "",
  ba_water_before: "/images/ba_water_before.jpg",
  ba_water_after: "/images/ba_water_after.jpg",
  // リフォーム ビフォーアフター
  ba_before: "",
  ba_after: "",
};

export type ImageKey = keyof typeof IMAGES;
