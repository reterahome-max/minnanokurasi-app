/**
 * RE:TERA HOME — 画像URL集約（単一データソース）
 * ───────────────────────────────────────────────
 * 各画面の Photo は srcKey でここを参照します。
 * URL を入れるだけで全 <img> が差し替わります（空文字はプレースホルダー表示）。
 * 将来 Firestore / CMS / public 画像に移す場合も、このマップの値だけ差し替えれば全画面に反映されます。
 * ※すべて自社施工の実写真（AI生成は不使用）。
 */

export const IMAGES: Record<string, string> = {
  hero: "/images/hero.jpg", // トップのイメージ写真
  // 人気・カテゴリ サムネ（実写真の「After（仕上がり）」を流用）
  ac: "/images/ba_ac_after.jpg",
  bath: "/images/ba_bath_after.jpg",
  hood: "/images/ba_hood_after.jpg",
  kitchen: "/images/ba_kitchen_after.jpg",
  toilet: "/images/ba_toilet_after.jpg",
  washroom: "/images/ba_water_after.jpg",
  fan: "/images/ba_fan_after.jpg",
  vacancy: "/images/ba_vacancy_after.jpg",
  // リフォーム サムネ
  cloth: "/images/ba_cloth_after.jpg",
  floor: "/images/ba_floor_after.jpg", // フローリング
  cf: "/images/ba_cf_after.jpg", // CF（クッションフロア）
  ftile: "/images/ba_ftile_after.jpg", // フロアタイル
  door: "/images/ba_door_after.jpg",
  net: "/images/ba_net_after.jpg",
  patch: "/images/ba_patch_after.jpg",
  // ── ビフォーアフター（実写真）──
  // クリーニング
  ba_ac_before: "/images/ba_ac_before.jpg",
  ba_ac_after: "/images/ba_ac_after.jpg",
  ba_bath_before: "/images/ba_bath_before.jpg",
  ba_bath_after: "/images/ba_bath_after.jpg",
  ba_hood_before: "/images/ba_hood_before.jpg",
  ba_hood_after: "/images/ba_hood_after.jpg",
  ba_kitchen_before: "/images/ba_kitchen_before.jpg",
  ba_kitchen_after: "/images/ba_kitchen_after.jpg",
  ba_water_before: "/images/ba_water_before.jpg",
  ba_water_after: "/images/ba_water_after.jpg",
  ba_vacancy_before: "/images/ba_vacancy_before.jpg",
  ba_vacancy_after: "/images/ba_vacancy_after.jpg",
  ba_fan_before: "/images/ba_fan_before.jpg",
  ba_fan_after: "/images/ba_fan_after.jpg",
  // リフォーム
  ba_cloth_before: "/images/ba_cloth_before.jpg",
  ba_cloth_after: "/images/ba_cloth_after.jpg",
  ba_floor_before: "/images/ba_floor_before.jpg",
  ba_floor_after: "/images/ba_floor_after.jpg",
  ba_cf_before: "/images/ba_cf_before.jpg",
  ba_cf_after: "/images/ba_cf_after.jpg",
  ba_ftile_before: "/images/ba_ftile_before.jpg",
  ba_ftile_after: "/images/ba_ftile_after.jpg",
  ba_net_before: "/images/ba_net_before.jpg",
  ba_net_after: "/images/ba_net_after.jpg",
  ba_toilet_before: "/images/ba_toilet_before.jpg",
  ba_toilet_after: "/images/ba_toilet_after.jpg",
  ba_door_before: "/images/ba_door_before.jpg",
  ba_door_after: "/images/ba_door_after.jpg",
  ba_patch_before: "/images/ba_patch_before.jpg",
  ba_patch_after: "/images/ba_patch_after.jpg",
  // 予備（汎用リフォームBA。現在は各アイテム個別キーを使用）
  ba_before: "",
  ba_after: "",
};

export type ImageKey = keyof typeof IMAGES;
