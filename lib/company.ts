/**
 * RE:TERA HOME — 事業者情報（単一データソース）
 * 特商法表記・フッター・構造化データはここだけを参照する。
 * 【要記入】の項目は開業情報が確定し次第、この1ファイルの差し替えで全画面に反映される。
 */

export const COMPANY = {
  name: "RE:TERA HOME",
  /** 屋号・法人名（特商法「販売事業者」） */
  legalName: "RE:TERA HOME【要記入：正式屋号】",
  /** 代表者氏名 */
  representative: "【要記入：代表者氏名】",
  /** 所在地 */
  address: "【要記入：〒・住所】",
  /** 電話番号（tel: リンクにも使用。未記入時は空文字のまま） */
  tel: "",
  /** 連絡先メール */
  email: "reterahome@gmail.com",
  /** 対応エリア */
  area: "埼玉県越谷市・春日部市 ほか近隣エリア",
  /** 対応エリアの郵便番号プレフィックス（343=越谷, 344=春日部） */
  zipPrefixes: ["343", "344"],
  url: "https://minnanokurasi-app.vercel.app",
} as const;

export const isServiceArea = (zip: string) => {
  const d = zip.replace(/[-\s]/g, "");
  return COMPANY.zipPrefixes.some((p) => d.startsWith(p));
};
