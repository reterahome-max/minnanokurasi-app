/**
 * RE:TERA HOME — 価格マスター（単一データソース）v2
 * ───────────────────────────────────────────────
 * 全画面（一覧 / 詳細 / シミュレーター / 予約 / 完了）はこのファイルだけを参照します。
 * 価格の二重管理を防ぐため、金額は必ずここで定義してください。
 *
 * 【v2の追加点】
 * - 各サービスに type を付与："ac"（種類×台数＋オプション）/ "flat"（1式の定額・数量のみ）
 * - serviceGroups() … シミュレーターのサービス選択用。エアコンは3種を1グループに束ね、
 *   定額系は各サービスを単独グループとして返す。
 *
 * 【表示はすべて税込】税抜・消費税は calcBill() が自動算出します。
 * 【Firestore 移行】SERVICES / OPTIONS を fetch して同じ形に整形すれば各画面は無修正で動きます。
 */

export const TAX_RATE = 0.1; // 消費税率

export type ServiceType = "ac" | "flat";

export interface Service {
  id: string;
  type: ServiceType;
  cat: string;
  rank: number;
  title: string;
  short: string;
  desc: string;
  price: number;
  unitLabel: string;
  img: string;
}

export interface Option {
  id: string;
  name: string;
  desc: string;
  price: number;
  applies: string[];
}

export interface BillLine {
  label: string;
  detail: string;
  amount: number;
}

export interface Bill {
  lines: BillLine[];
  totalIncl: number;
  net: number;
  tax: number;
  perUnit: number;
  unitLabel?: string;
}

export interface ServiceGroup {
  key: string;
  type: ServiceType;
  label: string;
  cat: string;
  variants?: Service[];
  service?: Service;
}

// ── サービス（基本料金・税込） ───────────────────────────────
// type: "ac"（種類×台数）/ "flat"（1式の定額）　unitLabel: 数量の単位
export const SERVICES: Service[] = [
  { id: "ac_wall",    type: "ac",   cat: "エアコン",     rank: 1, title: "エアコンクリーニング（壁掛け）",         short: "壁掛けエアコン",   desc: "カビ・ホコリを徹底洗浄",       price: 9900,  unitLabel: "台", img: "ac" },
  { id: "ac_auto",    type: "ac",   cat: "エアコン",     rank: 0, title: "エアコンクリーニング（お掃除機能付き）", short: "お掃除機能付き",   desc: "分解洗浄で内部までキレイに",   price: 16500, unitLabel: "台", img: "ac" },
  { id: "ac_ceiling", type: "ac",   cat: "エアコン",     rank: 0, title: "エアコンクリーニング（天井埋込）",       short: "天井埋込タイプ",   desc: "業務用・店舗にも対応",         price: 18700, unitLabel: "台", img: "ac" },
  { id: "bath",       type: "flat", cat: "浴室",         rank: 2, title: "浴室クリーニング",                       short: "浴室",             desc: "カビ・水アカを徹底除去",       price: 16000, unitLabel: "式", img: "bath" },
  { id: "hood",       type: "flat", cat: "レンジフード", rank: 3, title: "レンジフードクリーニング",               short: "レンジフード",     desc: "油汚れをスッキリ除去",         price: 13000, unitLabel: "式", img: "hood" },
  { id: "kitchen",    type: "flat", cat: "キッチン",     rank: 4, title: "キッチンクリーニング",                   short: "キッチン",         desc: "油汚れ・水アカを徹底除去",     price: 15000, unitLabel: "式", img: "kitchen" },
  { id: "toilet",     type: "flat", cat: "トイレ",       rank: 5, title: "トイレクリーニング",                     short: "トイレ",           desc: "尿石・黒ずみを徹底除去",       price: 9000,  unitLabel: "式", img: "toilet" },
  { id: "washroom",   type: "flat", cat: "洗面所",       rank: 6, title: "洗面所クリーニング",                     short: "洗面所",           desc: "水アカ・石けんカスを除去",     price: 9000,  unitLabel: "式", img: "washroom" },
  { id: "fan",        type: "flat", cat: "レンジフード", rank: 7, title: "換気扇（プロペラタイプ）クリーニング",   short: "換気扇",           desc: "ホコリ・油汚れを除去",         price: 8000,  unitLabel: "台", img: "fan" },
  { id: "vacancy",    type: "flat", cat: "空室",         rank: 8, title: "空室クリーニング（1R・1K）",            short: "空室1R・1K",       desc: "入居前・退去後の徹底清掃",     price: 18000, unitLabel: "件", img: "vacancy" },
];

// ── オプション（/台 加算・税込）。applies で対象サービスを限定（現状エアコン系のみ） ──
export const OPTIONS: Option[] = [
  { id: "anti_mold", name: "防カビ・抗菌コート", desc: "カビや菌の繁殖を抑制します", price: 3000, applies: ["ac_wall", "ac_auto", "ac_ceiling"] },
  { id: "outdoor",   name: "室外機洗浄",         desc: "室外機の熱効率を回復します", price: 6000, applies: ["ac_wall", "ac_auto", "ac_ceiling"] },
  { id: "drain",     name: "ドレンホース洗浄",   desc: "ホース内の詰まり・悪臭を予防", price: 2000, applies: ["ac_wall", "ac_auto", "ac_ceiling"] },
];

// エアコンの種類（種類セレクトの並び順）
export const AC_VARIANT_IDS = ["ac_wall", "ac_auto", "ac_ceiling"];

// ── カテゴリ（cat の一意リストを単一の正とする） ───────────────
// 並びは SERVICES の登場順。ホーム CATEGORIES / 一覧 FILTERS はこれを参照する。
export const CATEGORIES: string[] = Array.from(new Set(SERVICES.map((s) => s.cat)));

// ── ヘルパー ─────────────────────────────────────────────
export const yen = (n: number) => "¥" + Number(n).toLocaleString("ja-JP");
export const num = (n: number) => Number(n).toLocaleString("ja-JP"); // 記号なし

export const getService = (id: string) => SERVICES.find((s) => s.id === id);
export const optionsFor = (serviceId: string) =>
  OPTIONS.filter((o) => o.applies.includes(serviceId));
export const popularList = () =>
  SERVICES.filter((s) => s.rank > 0).sort((a, b) => a.rank - b.rank);

/**
 * シミュレーターのサービス選択用グループ。
 * - エアコン（type:"ac"）は3種を1グループに束ね、variants に種類を持つ。
 * - 定額系（type:"flat"）は各サービスを単独グループとして返す。
 */
export function serviceGroups(): ServiceGroup[] {
  const groups: ServiceGroup[] = [];
  const acVariants = AC_VARIANT_IDS.map(getService).filter((s): s is Service => Boolean(s));
  if (acVariants.length) {
    groups.push({ key: "ac", type: "ac", label: "エアコンクリーニング", cat: "エアコン", variants: acVariants });
  }
  SERVICES.filter((s) => s.type === "flat").forEach((s) => {
    groups.push({ key: s.id, type: "flat", label: s.title, cat: s.cat, service: s });
  });
  return groups;
}

/** serviceId（acは種類ID、flatはサービスID）から所属グループを求める */
export function groupForService(serviceId: string): ServiceGroup | undefined {
  const groups = serviceGroups();
  return groups.find((g) =>
    g.type === "ac"
      ? g.variants!.some((v) => v.id === serviceId)
      : g.service!.id === serviceId
  );
}

/**
 * 明細を計算（税込合計から税抜・消費税を逆算）。type に関わらず共通で使える。
 * - エアコン系：serviceId は選択中の種類ID（ac_wall 等）、optionIds 有効。
 * - 定額系：serviceId はそのサービスID、optionIds は通常空（applies対象外なら自動で無視）。
 */
export function calcBill(serviceId: string, qty = 1, optionIds: string[] = []): Bill {
  const svc = getService(serviceId);
  if (!svc) return { lines: [], totalIncl: 0, net: 0, tax: 0, perUnit: 0 };

  const opts = optionsFor(serviceId).filter((o) => optionIds.includes(o.id));
  const optPerUnit = opts.reduce((s, o) => s + o.price, 0);
  const perUnit = svc.price + optPerUnit;
  const totalIncl = perUnit * qty;
  const net = Math.round(totalIncl / (1 + TAX_RATE));
  const tax = totalIncl - net;

  const lines: BillLine[] = [
    { label: svc.title, detail: `${num(svc.price)}円 × ${qty}${svc.unitLabel}`, amount: svc.price * qty },
    ...opts.map((o) => ({
      label: o.name,
      detail: `${num(o.price)}円 × ${qty}${svc.unitLabel}`,
      amount: o.price * qty,
    })),
  ];

  return { lines, totalIncl, net, tax, perUnit, unitLabel: svc.unitLabel };
}
