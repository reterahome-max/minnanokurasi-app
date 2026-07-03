/**
 * RE:TERA HOME — リフォーム価格エンジン
 * ───────────────────────────────────────────────
 * 仕様書「RETERA_HOME_reform_pricing_spec.md」を実装。
 * クリーニングの pricing.ts とは別管理（税抜/税込・計算方式が異なるため混ぜない）。
 *
 * 【重要な前提】
 * - すべて税抜表示。
 * - 諸経費15%は基準単価に内部で上乗せし、画面には「+15%」を出さない。
 * - 面積単価は原則10㎡以上。10㎡未満は最低施工料金30,000円 or 小空間一式35,000円。
 * - 端数は100円単位で切り上げに統一。
 * - 確定できない工事（下地補修・階段・アスベスト等）は estimate:false（現地調査へ）。
 */

export const OVERHEAD_RATE = 1.15;        // 諸経費（内部上乗せ・非表示）
export const MINIMUM_AREA = 10;           // 面積単価の最低適用面積（㎡）
export const MINIMUM_CONSTRUCTION_PRICE = 30000; // 最低施工料金
export const SMALL_SPACE_FIXED_PRICE = 35000;    // 小空間一式

export const roundUp = (value: number, unit = 100): number =>
  Math.ceil(value / unit) * unit;

// ── 課金方式 ───────────────────────────────
// area   : 面積単価（10㎡ルール・最低料金あり）
// small  : 小空間一式（35,000円）
// unit   : 単品（枚/箇所、最低料金対象外）
// tiered : 箇所数で段階価格（クロス穴補修）
// set    : 固定セット価格（トイレ交換）
export type PricingMethod = "area" | "small" | "unit" | "tiered" | "set";

export interface ReformItem {
  id: string;
  cat: string;              // カテゴリ（クロス/床/建具/水回り/補修）
  title: string;
  method: PricingMethod;
  unitLabel: string;        // ㎡ / 枚 / 箇所 / 台
  bookable: boolean;        // true=即予約可（金額確定）/ false=概算→現地調査
  // 単価・価格（税抜・諸経費上乗せ前）
  unitPrice?: number;       // area / unit 用
  smallSpace?: boolean;     // area工事で小空間一式が使えるか
  tiers?: { qty: number; price: number }[]; // tiered 用（上乗せ前）
  setPrice?: number;        // set 用（※セットは仕様上すでに込み。上乗せしない）
  note?: string;
}

// ── マスター（仕様書 4〜11章） ───────────────────────────────
export const REFORM_ITEMS: ReformItem[] = [
  // クロス
  { id: "cloth_std",  cat: "クロス", title: "量産クロス貼り替え",        method: "area", unitLabel: "㎡", bookable: false, unitPrice: 980,  smallSpace: false, note: "10㎡以上から。10㎡未満は最低施工料金。" },
  { id: "cloth_high", cat: "クロス", title: "ハイグレードクロス貼り替え", method: "area", unitLabel: "㎡", bookable: false, unitPrice: 1200, smallSpace: false, note: "1,200円/㎡〜。グレードにより変動。" },
  { id: "cloth_patch", cat: "補修", title: "クロス壁穴・凹み補修",        method: "tiered", unitLabel: "箇所", bookable: true,
    tiers: [{ qty: 1, price: 15000 }, { qty: 2, price: 23000 }, { qty: 3, price: 30000 }], note: "1箇所から受付。最低料金対象外。" },

  // CF（クッションフロア）
  { id: "cf_room",    cat: "床", title: "CF貼り替え（居室）",       method: "area",  unitLabel: "㎡", bookable: false, unitPrice: 2000, smallSpace: false },
  { id: "cf_hall",    cat: "床", title: "CF貼り替え（廊下・玄関）", method: "area",  unitLabel: "㎡", bookable: false, unitPrice: 3000, smallSpace: false },
  { id: "cf_kitchen", cat: "床", title: "CF貼り替え（キッチン）",   method: "area",  unitLabel: "㎡", bookable: false, unitPrice: 2000, smallSpace: false },
  { id: "cf_washroom",cat: "床", title: "CF貼り替え（洗面所）",     method: "small", unitLabel: "式", bookable: false, note: "小空間一式 35,000円。" },
  { id: "cf_toilet",  cat: "床", title: "CF貼り替え（トイレ）",     method: "small", unitLabel: "式", bookable: false, note: "小空間一式 35,000円。" },

  // フローリング
  { id: "fl_room",    cat: "床", title: "フローリング貼り替え（居室）",   method: "area", unitLabel: "㎡", bookable: false, unitPrice: 10000, smallSpace: false, note: "実質 10,000円/㎡。下地補修は別途。" },
  { id: "fl_hall",    cat: "床", title: "フローリング貼り替え（廊下）",   method: "area", unitLabel: "㎡", bookable: false, unitPrice: 10000, smallSpace: false },
  { id: "fl_kitchen", cat: "床", title: "フローリング貼り替え（キッチン）", method: "area", unitLabel: "㎡", bookable: false, unitPrice: 10000, smallSpace: false },
  { id: "fl_washroom",cat: "床", title: "フローリング貼り替え（洗面所）", method: "area", unitLabel: "㎡", bookable: false, unitPrice: 10000, smallSpace: false },

  // フロアタイル（重ね貼り）
  { id: "ft_room",    cat: "床", title: "フロアタイル貼り替え（居室）",   method: "area",  unitLabel: "㎡", bookable: false, unitPrice: 4000,  smallSpace: false },
  { id: "ft_hall",    cat: "床", title: "フロアタイル貼り替え（廊下・玄関）", method: "area", unitLabel: "㎡", bookable: false, unitPrice: 8000, smallSpace: false },
  { id: "ft_kitchen", cat: "床", title: "フロアタイル貼り替え（キッチン）", method: "area", unitLabel: "㎡", bookable: false, unitPrice: 8000, smallSpace: false },
  { id: "ft_washroom",cat: "床", title: "フロアタイル貼り替え（洗面所）", method: "small", unitLabel: "式", bookable: false, note: "小空間一式 35,000円。" },
  { id: "ft_toilet",  cat: "床", title: "フロアタイル貼り替え（トイレ）", method: "small", unitLabel: "式", bookable: false, note: "小空間一式 35,000円。" },

  // 建具
  { id: "door_knob",  cat: "建具", title: "室内ドアハンドル交換（握り玉）",     method: "unit", unitLabel: "箇所", bookable: true, unitPrice: 9000, note: "1箇所から。最低料金対象外。" },
  { id: "door_lever", cat: "建具", title: "室内ドアハンドル交換（レバー）",     method: "unit", unitLabel: "箇所", bookable: true, unitPrice: 9000, note: "鍵あり/なし・浴室用も同額。" },

  // 網戸
  { id: "net_window", cat: "建具", title: "網戸張り替え（窓用）",       method: "unit", unitLabel: "枚", bookable: true, unitPrice: 3000, note: "高さ150cm・幅95cmまで。1枚から。" },
  { id: "net_veranda",cat: "建具", title: "網戸張り替え（ベランダ用）", method: "unit", unitLabel: "枚", bookable: true, unitPrice: 5000, note: "高さ190cm・幅95cmまで。1枚から。" },

  // 水回り（セット）
  { id: "toilet_toto_qr", cat: "水回り", title: "トイレ交換（TOTO ピュアレストQR SSセット）", method: "set", unitLabel: "台", bookable: false, setPrice: 130000, note: "材料・標準施工込み。排水芯変更・床補修は別途。" },
];

// ── 計算 ───────────────────────────────
export interface QuoteResult {
  total: number | null;      // 税抜。null=金額算出不可（要現地調査）
  method: PricingMethod;
  isMinimum: boolean;        // 最低施工料金が適用されたか
  isSmallSpace: boolean;     // 小空間一式が適用されたか
  bookable: boolean;         // 即予約可か
  needsSurvey: boolean;      // 現地調査が必要か
  breakdown: string;         // 内訳の説明文（内部15%は出さない）
  notes: string[];
}

const yen = (n: number) => n.toLocaleString("ja-JP");

/**
 * 概算見積を計算。
 * @param itemId 工事ID
 * @param input  { area?:㎡, qty?:枚/箇所/台 }
 */
export function quote(itemId: string, input: { area?: number; qty?: number } = {}): QuoteResult {
  const it = REFORM_ITEMS.find((x) => x.id === itemId);
  const notes = [
    "価格は税抜・材料費・施工費込みです。",
    "駐車場代は別途実費となります。",
    "現地状況により追加費用が発生する場合があります。",
  ];
  if (!it) {
    return { total: null, method: "area", isMinimum: false, isSmallSpace: false, bookable: false, needsSurvey: true, breakdown: "", notes };
  }

  const base = (method: PricingMethod): QuoteResult => ({
    total: null, method, isMinimum: false, isSmallSpace: false,
    bookable: it.bookable, needsSurvey: !it.bookable, breakdown: "", notes: [...notes, ...(it.note ? [it.note] : [])],
  });

  switch (it.method) {
    case "unit": {
      const qty = Math.max(1, input.qty ?? 1);
      const total = roundUp((it.unitPrice ?? 0) * qty * OVERHEAD_RATE, 100);
      return { ...base("unit"), total, breakdown: `${it.title} ${qty}${it.unitLabel}` };
    }
    case "tiered": {
      const qty = Math.max(1, input.qty ?? 1);
      const tier = [...(it.tiers ?? [])].reverse().find((t) => qty >= t.qty) ?? it.tiers?.[0];
      // 段階価格はすでに提示価格（仕様表の金額）。100円切り上げのみ適用。
      const total = tier ? roundUp(tier.price, 100) : null;
      return { ...base("tiered"), total, breakdown: `${it.title} ${qty}${it.unitLabel}` };
    }
    case "set": {
      const total = it.setPrice ?? null; // セットは込み価格。上乗せしない。
      return { ...base("set"), total, breakdown: it.title };
    }
    case "small": {
      const total = roundUp(SMALL_SPACE_FIXED_PRICE, 100);
      return { ...base("small"), total, isSmallSpace: true, breakdown: `${it.title}（小空間一式）` };
    }
    case "area": {
      const area = input.area ?? 0;
      if (area <= 0) return { ...base("area"), total: null, breakdown: "施工面積を入力してください" };
      // 10㎡未満：最低施工料金（小空間一式が使えるなら安い方）
      if (area < MINIMUM_AREA) {
        const min = MINIMUM_CONSTRUCTION_PRICE;
        const total = it.smallSpace ? Math.min(min, SMALL_SPACE_FIXED_PRICE) : min;
        return {
          ...base("area"), total: roundUp(total, 100), isMinimum: !it.smallSpace, isSmallSpace: !!it.smallSpace,
          breakdown: `${it.title}（10㎡未満のため最低施工料金）`,
        };
      }
      const raw = (it.unitPrice ?? 0) * area * OVERHEAD_RATE;
      const total = roundUp(raw, 100);
      return { ...base("area"), total, breakdown: `${it.title}　施工面積 ${area}㎡` };
    }
    default:
      return base(it.method);
  }
}

// カテゴリ一覧（画面のフィルタ用）
export const reformCategories = (): string[] =>
  Array.from(new Set(REFORM_ITEMS.map((i) => i.cat)));

export const reformItemsByCat = (cat: string): ReformItem[] =>
  cat === "すべて" ? REFORM_ITEMS : REFORM_ITEMS.filter((i) => i.cat === cat);

export const getReformItem = (id: string) => REFORM_ITEMS.find((i) => i.id === id);
