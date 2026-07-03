/**
 * RE:TERA HOME — 画像URL集約（単一データソース）
 * ───────────────────────────────────────────────
 * 各画面の Photo は srcKey でここを参照します。
 * URL を入れるだけで全 <img> が差し替わります（空文字はプレースホルダー表示）。
 * 将来 Firestore / CMS / public 画像に移す場合も、このマップの値だけ差し替えれば全画面に反映されます。
 */

export const IMAGES: Record<string, string> = {
  hero: "",
  // 人気・カテゴリ サムネ
  ac: "",
  bath: "",
  hood: "",
  kitchen: "",
  toilet: "",
  washroom: "",
  fan: "",
  vacancy: "",
  // リフォーム サムネ
  cloth: "",
  floor: "",
  door: "",
  net: "",
  patch: "",
  // ビフォーアフター
  ba_ac_before: "",
  ba_ac_after: "",
  ba_bath_before: "",
  ba_bath_after: "",
  ba_hood_before: "",
  ba_hood_after: "",
  ba_water_before: "",
  ba_water_after: "",
  // リフォーム ビフォーアフター
  ba_before: "",
  ba_after: "",
};

export type ImageKey = keyof typeof IMAGES;
