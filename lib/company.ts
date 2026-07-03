/**
 * RE:TERA HOME — 事業者情報（単一データソース）
 * 特商法表記・フッター・構造化データはここだけを参照する。
 * 開業情報が変わったら、このファイルの値を差し替えるだけで全画面に反映される。
 */

export const COMPANY = {
  name: "RE:TERA HOME",
  /** 屋号・法人名（特商法「販売事業者」）。正式な登記名があれば差し替え。 */
  legalName: "RE:TERA HOME",
  /** 代表者氏名 */
  representative: "栗原 真奈",
  /** 所在地 */
  address: "埼玉県越谷市蒲生 4-6-33",
  /** 電話番号（tel: リンクにも使用。未記入時は空文字のまま） */
  tel: "090-4630-4140",
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
