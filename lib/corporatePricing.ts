/**
 * RE:TERA HOME — 法人向け 原状回復シミュレーター：単価マスター＆積算エンジン（独立）
 * ───────────────────────────────────────────────
 * 仕様書 §15〜§20 準拠。**消費者向け lib/pricing / lib/reformPricing とは絶対に混ぜない**。
 * 価格は税抜・材料標準施工込み。UIから分離した純関数として estimate() を提供する。
 *
 * 計算区分(tier)：
 *   auto     … 数量×単価で自動算出（概算にそのまま計上）
 *   photo    … 写真・型番確認後に確定（概算に「参考」として別掲。合計本体には入れない）
 *   site     … 現場確認後に正式見積（金額に入れず件数のみ）
 *   excluded … 対象外
 *   contract … 法人契約条件で個別設定
 * 単位(unit) から計算方法を導出：一式/込み=固定、%/加算=特殊、その他=数量×単価。
 */

export type CorpTier = "auto" | "photo" | "site" | "excluded" | "contract";
export type CorpUnit =
  | "㎡" | "m" | "箇所" | "枚" | "台" | "室" | "組" | "袋" | "点" | "時間" | "案件"
  | "一式" | "％" | "加算" | "㎡加算" | "込み" | "別途" | "対象外" | "契約条件" | "距離加算" | "標準量込み";

// UIのカテゴリ（仕様§7・§8の6分類）
export type CorpCatKey = "clean" | "wall" | "floor" | "fixture" | "water" | "electric" | "other";
export const CORP_CATEGORIES: { key: CorpCatKey; label: string }[] = [
  { key: "clean", label: "空室クリーニング・エアコン" },
  { key: "wall", label: "クロス・壁・天井" },
  { key: "floor", label: "床・巾木" },
  { key: "fixture", label: "建具・窓まわり" },
  { key: "water", label: "水回り・設備" },
  { key: "electric", label: "電気・換気" },
  { key: "other", label: "その他・法人対応" },
];

export interface CorpMenu {
  id: string;
  cat: CorpCatKey;
  name: string;
  unit: CorpUnit;
  price: number | null;   // 標準単価（税抜）
  tier: CorpTier;
  minExempt: boolean;     // 最低施工料金の対象外か（仕様§16）
  note?: string;
}

// [cat, name, unit, price, tier, minExempt?]
type Row = [CorpCatKey, string, CorpUnit, number | null, CorpTier, boolean?];

const ROWS: Row[] = [
  // ── 空室クリーニング（一式・間取り別） ──
  ["clean", "空室クリーニング 1R・1K（25㎡まで）", "一式", 25000, "auto"],
  ["clean", "空室クリーニング 1DK・2K（35㎡まで）", "一式", 32000, "auto"],
  ["clean", "空室クリーニング 1LDK・2DK（45㎡まで）", "一式", 40000, "auto"],
  ["clean", "空室クリーニング 2LDK・3DK（65㎡まで）", "一式", 52000, "auto"],
  ["clean", "空室クリーニング 3LDK・4DK（80㎡まで）", "一式", 65000, "auto"],
  ["clean", "空室クリーニング 4LDK（100㎡まで）", "一式", 80000, "auto"],
  ["clean", "空室クリーニング マンション100㎡超", "㎡", 800, "auto"],
  ["clean", "空室クリーニング 戸建て（50㎡まで）", "一式", 55000, "auto"],
  ["clean", "空室クリーニング 戸建て（65㎡まで）", "一式", 70000, "auto"],
  ["clean", "空室クリーニング 戸建て（80㎡まで）", "一式", 85000, "auto"],
  ["clean", "空室クリーニング 戸建て（100㎡まで）", "一式", 105000, "auto"],
  ["clean", "空室クリーニング 戸建て100㎡超", "㎡", 1000, "auto"],
  ["clean", "ワックス塗布", "㎡", 500, "auto"],
  ["clean", "ワックス剥離", "㎡", 1500, "auto"],
  ["clean", "ロフト", "加算", 5000, "auto"],
  ["clean", "2階以上・EVなし", "加算", 3000, "auto"],
  // ── エアコン（最低料金対象外） ──
  ["clean", "エアコン 壁掛け通常・1台目", "台", 9000, "auto", true],
  ["clean", "エアコン 壁掛け通常・2台目以降", "台", 8000, "auto", true],
  ["clean", "エアコン お掃除機能付き・1台目", "台", 15000, "auto", true],
  ["clean", "エアコン お掃除機能付き・2台目以降", "台", 13000, "auto", true],
  ["clean", "エアコン 天井埋込1方向", "台", 22000, "auto", true],
  ["clean", "エアコン 天井埋込2方向", "台", 25000, "auto", true],
  ["clean", "エアコン 天井埋込4方向", "台", 28000, "auto", true],
  ["clean", "エアコン 天吊りタイプ", "台", 30000, "photo", true],
  ["clean", "エアコン 室外機洗浄", "台", 6000, "auto", true],
  ["clean", "エアコン 防カビ・抗菌仕上げ", "台", 3000, "auto", true],
  ["clean", "エアコン ドレンホース洗浄", "台", 3000, "auto", true],
  // ── 単品クリーニング（最低料金対象外） ──
  ["clean", "浴室クリーニング", "室", 16000, "auto", true],
  ["clean", "レンジフードクリーニング", "台", 13000, "auto", true],
  ["clean", "キッチンクリーニング", "室", 15000, "auto", true],
  ["clean", "トイレクリーニング", "室", 9000, "auto", true],
  ["clean", "洗面所クリーニング", "室", 8000, "auto", true],
  ["clean", "プロペラ換気扇クリーニング", "台", 8000, "auto", true],
  ["clean", "ベランダ清掃", "箇所", 10000, "auto", true],
  ["clean", "窓・サッシ清掃", "組", 3000, "auto", true],
  ["clean", "浴室エプロン内部", "室", 5000, "auto", true],
  ["clean", "浴室鏡ウロコ除去", "枚", 5000, "auto", true],
  ["clean", "浴室防カビ", "室", 3000, "auto", true],
  ["clean", "排水口分解洗浄", "箇所", 3000, "auto", true],
  ["clean", "冷蔵庫内部", "台", 10000, "auto", true],
  ["clean", "洗濯機パン・排水口", "箇所", 8000, "auto", true],
  // ── クロス・壁・天井 ──
  ["wall", "量産クロス（数量で自動判定 980/1,200円）", "㎡", 980, "auto"],
  ["wall", "ハイグレードクロス", "㎡", 1500, "photo"],
  ["wall", "アクセントクロス", "㎡", 1500, "photo"],
  ["wall", "天井クロス（壁単価へ+200/㎡）", "㎡加算", 200, "auto"],
  ["wall", "クロス剥がしのみ", "㎡", 300, "auto"],
  ["wall", "新規PB面クロス施工", "㎡", 1100, "auto"],
  ["wall", "下地パテ 重度", "㎡", 500, "photo"],
  ["wall", "シーラー処理", "㎡", 500, "auto"],
  ["wall", "ヤニ止めシーラー", "㎡", 800, "auto"],
  ["wall", "防カビ処理", "㎡", 800, "photo"],
  ["wall", "クロスめくれ補修", "一式", 8000, "photo"],
  ["wall", "クロス部分貼り替え", "一式", 15000, "photo"],
  ["wall", "クロス一面貼り替え", "一式", 20000, "photo"],
  // ── 壁穴・下地補修（最低料金対象外） ──
  ["wall", "壁穴 小さな凹み（直径2cm程度）", "箇所", 8000, "photo", true],
  ["wall", "壁穴 小穴（直径5cm未満）", "箇所", 12000, "photo", true],
  ["wall", "壁穴 中穴（直径15cm未満）", "箇所", 15000, "photo", true],
  ["wall", "壁穴 大穴（直径30cm未満）", "箇所", 25000, "photo", true],
  ["wall", "壁穴 30cm超", "箇所", 35000, "photo", true],
  ["wall", "石膏ボード部分交換", "箇所", 25000, "photo", true],
  ["wall", "壁一面ボード交換", "箇所", 45000, "photo", true],
  ["wall", "天井ボード部分補修", "箇所", 30000, "photo", true],
  ["wall", "下地木材腐食", "別途", null, "site"],
  ["wall", "漏水・カビを伴う補修", "別途", null, "site"],
  // ── 床・巾木 ──
  ["floor", "CF重ね張り（10㎡以上）", "㎡", 3000, "auto"],
  ["floor", "CF張り替え（既存撤去込み）", "㎡", 3500, "auto"],
  ["floor", "トイレCF張り替え", "室", 25000, "photo"],
  ["floor", "洗面所CF張り替え", "室", 28000, "photo"],
  ["floor", "キッチンCF張り替え", "一式", 35000, "photo"],
  ["floor", "フロアタイル重ね張り", "㎡", 5000, "auto"],
  ["floor", "フロアタイル 既存床撤去あり", "㎡", 6500, "photo"],
  ["floor", "フローリング重ね張り", "㎡", 10000, "photo"],
  ["floor", "フローリング張り替え", "㎡", 15000, "site"],
  ["floor", "防音フローリング", "㎡", 16000, "site"],
  ["floor", "無垢フローリング", "㎡", 18000, "site"],
  ["floor", "既存床撤去", "㎡", 3000, "photo"],
  ["floor", "床下地合板交換", "㎡", 6000, "site"],
  ["floor", "床鳴り部分補修", "一式", 20000, "site"],
  ["floor", "フローリング部分補修", "一式", 15000, "photo"],
  ["floor", "ソフト巾木交換", "m", 1200, "auto"],
  ["floor", "木巾木交換", "m", 2500, "photo"],
  // ── 建具・室内ドア（ハンドル系は最低料金対象外） ──
  ["fixture", "室内ドアハンドル交換", "箇所", 9000, "auto", true],
  ["fixture", "鍵付き室内ハンドル", "箇所", 12000, "auto", true],
  ["fixture", "握り玉交換", "箇所", 9000, "auto", true],
  ["fixture", "ラッチ交換", "箇所", 8000, "auto", true],
  ["fixture", "丁番調整", "枚", 6000, "photo"],
  ["fixture", "丁番交換", "枚", 8000, "photo"],
  ["fixture", "建具調整", "箇所", 8000, "photo"],
  ["fixture", "戸当たり交換", "箇所", 5000, "auto"],
  ["fixture", "ドアクローザー交換", "箇所", 18000, "photo"],
  ["fixture", "建具表面シート補修", "箇所", 20000, "photo"],
  ["fixture", "ダイノックシート施工", "㎡", 12000, "photo"],
  ["fixture", "室内ドア交換", "枚", 80000, "site"],
  ["fixture", "引き戸交換", "枚", 100000, "site"],
  ["fixture", "収納扉調整", "箇所", 8000, "photo"],
  ["fixture", "棚板交換", "枚", 10000, "photo"],
  // ── 網戸・窓まわり（網戸張替は最低料金対象外） ──
  ["fixture", "網戸張り替え 小窓用", "枚", 3000, "auto", true],
  ["fixture", "網戸張り替え 腰窓用", "枚", 4000, "auto", true],
  ["fixture", "網戸張り替え 掃き出し窓用", "枚", 5000, "auto", true],
  ["fixture", "網戸張り替え ワイド・大型", "枚", 7000, "photo", true],
  ["fixture", "ペット用強化網", "箇所", 3000, "auto", true],
  ["fixture", "防虫高機能網", "箇所", 2000, "auto", true],
  ["fixture", "網戸戸車交換", "枚", 5000, "auto", true],
  ["fixture", "網戸新規作製", "枚", 15000, "photo", true],
  ["fixture", "クレセント交換", "箇所", 8000, "auto"],
  ["fixture", "カーテンレール交換", "箇所", 8000, "auto"],
  // ── 水栓・給排水（単品設備は最低料金対象外） ──
  ["water", "キッチン水栓交換・一般", "一式", 25000, "photo", true],
  ["water", "浄水器付き水栓", "一式", 35000, "photo", true],
  ["water", "浴室水栓交換", "一式", 30000, "photo", true],
  ["water", "洗面水栓交換", "一式", 25000, "photo", true],
  ["water", "洗濯水栓交換", "一式", 15000, "photo", true],
  ["water", "単水栓交換", "一式", 12000, "photo", true],
  ["water", "排水トラップ交換", "一式", 15000, "photo", true],
  ["water", "洗面排水管交換", "一式", 12000, "photo", true],
  ["water", "キッチン排水管交換", "一式", 15000, "photo", true],
  ["water", "シャワーホース・ヘッド交換", "一式", 8000, "auto", true],
  ["water", "キッチンコーキング", "一式", 15000, "photo"],
  ["water", "洗面台コーキング", "一式", 10000, "photo"],
  ["water", "浴室部分コーキング", "一式", 15000, "photo"],
  ["water", "浴室全面コーキング", "一式", 30000, "photo"],
  ["water", "排水詰まり軽作業", "一式", 12000, "photo"],
  ["water", "高圧洗浄", "一式", 30000, "site"],
  ["water", "漏水調査", "一式", 15000, "site"],
  // ── トイレ・洗面設備 ──
  ["water", "標準トイレ交換", "一式", 130000, "photo"],
  ["water", "推奨トイレセット", "一式", 150000, "photo"],
  ["water", "温水洗浄便座交換", "一式", 35000, "photo"],
  ["water", "普通便座交換", "一式", 15000, "auto", true],
  ["water", "紙巻器交換", "一式", 8000, "auto", true],
  ["water", "タオルリング交換", "一式", 7000, "auto", true],
  ["water", "止水栓交換", "一式", 12000, "photo", true],
  ["water", "洗面化粧台交換 W600", "一式", 100000, "site"],
  ["water", "洗面化粧台交換 W750", "一式", 130000, "site"],
  ["water", "洗面鏡交換", "一式", 20000, "photo"],
  ["water", "防水パン交換", "一式", 45000, "site"],
  ["water", "洗濯排水トラップ交換", "一式", 20000, "photo", true],
  // ── 電気・換気（有資格者/協力業者施工） ──
  ["electric", "シーリング照明交換", "台", 8000, "auto", true],
  ["electric", "照明器具交換", "台", 12000, "photo", true],
  ["electric", "ダウンライト交換", "台", 12000, "photo", true],
  ["electric", "引掛シーリング交換", "箇所", 8000, "photo", true],
  ["electric", "スイッチ交換", "箇所", 8000, "photo", true],
  ["electric", "コンセント交換", "箇所", 8000, "photo", true],
  ["electric", "スイッチ・コンセント 2箇所目以降", "箇所", 5000, "auto", true],
  ["electric", "換気扇プロペラ交換", "台", 20000, "photo", true],
  ["electric", "パイプファン交換", "台", 18000, "photo", true],
  ["electric", "浴室換気扇交換", "台", 35000, "photo", true],
  ["electric", "レンジフード交換", "台", 100000, "site"],
  ["electric", "インターホン交換", "台", 25000, "photo", true],
  ["electric", "火災報知器交換", "台", 8000, "auto", true],
  ["electric", "ブレーカー・回路工事", "別途", null, "site"],
  // ── 残置物・廃材 ──
  ["other", "軽微な残置物処分", "一式", 5000, "photo", true],
  ["other", "残置物 45L袋", "袋", 1500, "auto", true],
  ["other", "残置物 軽トラック相当", "台", 30000, "site", true],
  ["other", "残置物 2t車相当", "台", 80000, "site", true],
  ["other", "家具搬出", "点", 5000, "photo", true],
  ["other", "家電搬出", "点", 5000, "photo", true],
  ["other", "リサイクル家電", "別途", null, "site", true],
  ["other", "大量廃材", "別途", null, "site", true],
  // ── 法人対応・管理費 ──
  ["other", "写真付き完了報告", "案件", 0, "auto", true],
  ["other", "簡易現地調査報告", "案件", 5000, "auto", true],
  ["other", "詳細写真報告書", "案件", 10000, "auto", true],
  ["other", "採寸・数量拾い", "案件", 10000, "photo", true],
  ["other", "見積書作成", "案件", 0, "auto", true],
  ["other", "オーナー提出用3案作成", "案件", 10000, "auto", true],
  ["other", "鍵受け取り・返却", "案件", 3000, "photo", true],
  ["other", "工事立会い", "時間", 5000, "auto", true],
  ["other", "指定時間入室", "案件", 3000, "auto", true],
];

export const CORP_MENUS: CorpMenu[] = ROWS.map(([cat, name, unit, price, tier, minExempt], i) => ({
  id: `c${i}`,
  cat,
  name,
  unit: unit as CorpUnit,
  price,
  tier,
  minExempt: !!minExempt,
}));

export const getCorpMenu = (id: string) => CORP_MENUS.find((m) => m.id === id);
export const corpMenusByCat = (cat: CorpCatKey) => CORP_MENUS.filter((m) => m.cat === cat);

// ── 計算 ─────────────────────────────────────────
export const CORP_MIN_CHARGE = 30000;   // 最低施工料金（税抜）§16
export const CORP_OVERHEAD_RATE = 0.05; // 諸経費 §16

// 単位から「数量×単価か固定か」を判定
const isFixedUnit = (u: CorpUnit) => u === "一式" || u === "込み" || u === "標準量込み";
const isQuoteUnit = (u: CorpUnit) => u === "別途" || u === "対象外" || u === "契約条件" || u === "距離加算";

// 量産クロスの数量別単価（§17）。50㎡以上=980 / 10〜49㎡=1,200 / 10㎡未満=別途
export function wallpaperUnitPrice(qty: number): number | null {
  if (qty >= 50) return 980;
  if (qty >= 10) return 1200;
  return null;
}

/** 1明細の小計（税抜）。算出不可（要別途/数量未満）は null。 */
export function lineSubtotal(menu: CorpMenu, qty: number): number | null {
  if (menu.tier === "excluded" || menu.tier === "contract" || isQuoteUnit(menu.unit) || menu.price == null) return null;
  if (menu.name.startsWith("量産クロス")) {
    const u = wallpaperUnitPrice(qty);
    return u == null ? null : u * qty;
  }
  if (isFixedUnit(menu.unit)) return menu.price; // 一式は数量に依らず固定
  return menu.price * Math.max(0, qty);
}

export type CorpAdjType = "fixed" | "percent";
export interface CorpAdjustment { code: string; name: string; type: CorpAdjType; value: number; }

// 追加条件マスター（§18）
export const CORP_ADJUSTMENTS: CorpAdjustment[] = [
  { code: "no_parking", name: "駐車場なし（実費）", type: "fixed", value: 0 },
  { code: "no_ev", name: "2階以上・エレベーターなし", type: "fixed", value: 3000 },
  { code: "night", name: "夜間・早朝作業", type: "percent", value: 20 },
  { code: "rush", name: "緊急・短納期", type: "percent", value: 15 },
  { code: "furniture", name: "家具移動あり", type: "percent", value: 20 },
  { code: "keys", name: "鍵の受け取り・返却あり", type: "fixed", value: 3000 },
  { code: "attend", name: "管理人立会い・時間制限あり", type: "fixed", value: 5000 },
  { code: "coordination", name: "複数業者の工程管理あり", type: "percent", value: 5 },
];

export interface CorpEstimateInput {
  lines: { menuId: string; qty: number; location?: string }[];
  adjustmentCodes: string[];
  overheadRate?: number; // 既定 0.05（管理画面で変更可）
}
export interface CorpEstimateResult {
  autoSubtotal: number;        // 概算本体（auto項目の合計）
  photoSubtotal: number;       // 写真確認項目の概算（参考・本体外）
  photoCount: number;
  siteCount: number;           // 別途見積の件数
  minAdjustment: number;       // 最低施工料金の調整
  overhead: number;            // 諸経費
  optionTotal: number;         // 追加条件の加算
  preTax: number;              // 税抜合計
  tax: number;                 // 消費税
  total: number;               // 税込合計
}

/**
 * 概算（税抜）を積算する。§16 の順序に準拠。
 *   本体 = auto項目の合計
 *   最低施工料金：本体 < 30,000 かつ 対象品を含む場合に補填
 *   諸経費 = 本体 × 5%
 *   税抜合計 = 本体 + 最低調整 + 諸経費 + 追加条件
 *   消費税 = floor(税抜合計 × 10%)
 * 写真確認は参考額として別掲（本体には入れない）／現地調査は件数のみ。
 */
export function estimate(input: CorpEstimateInput): CorpEstimateResult {
  const rate = input.overheadRate ?? CORP_OVERHEAD_RATE;
  let autoSubtotal = 0, photoSubtotal = 0, photoCount = 0, siteCount = 0;
  let hasMinApplicable = false;

  for (const l of input.lines) {
    const m = getCorpMenu(l.menuId);
    if (!m) continue;
    if (m.tier === "site" || m.tier === "excluded" || m.tier === "contract") { siteCount++; continue; }
    const sub = lineSubtotal(m, l.qty);
    if (sub == null) { siteCount++; continue; } // 算出不可（例：量産クロス10㎡未満）は別途扱い
    if (m.tier === "photo") { photoSubtotal += sub; photoCount++; continue; }
    autoSubtotal += sub;
    if (!m.minExempt) hasMinApplicable = true;
  }

  const minAdjustment = autoSubtotal > 0 && autoSubtotal < CORP_MIN_CHARGE && hasMinApplicable
    ? CORP_MIN_CHARGE - autoSubtotal
    : 0;
  const overhead = Math.round(autoSubtotal * rate);
  const baseForOptions = autoSubtotal + minAdjustment;

  let optionTotal = 0;
  for (const code of input.adjustmentCodes) {
    const a = CORP_ADJUSTMENTS.find((x) => x.code === code);
    if (!a) continue;
    optionTotal += a.type === "percent" ? Math.round(baseForOptions * (a.value / 100)) : a.value;
  }

  const preTax = autoSubtotal + minAdjustment + overhead + optionTotal;
  const tax = Math.floor(preTax * 0.1);
  return { autoSubtotal, photoSubtotal, photoCount, siteCount, minAdjustment, overhead, optionTotal, preTax, tax, total: preTax + tax };
}
