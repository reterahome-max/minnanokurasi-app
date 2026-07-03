/**
 * RE:TERA HOME — 予約フロー共通定数・ヘルパー
 * カレンダーは「今日」を基準に動的生成（過去日は選択不可・月送り対応）。
 * 空き状況は Firestore availability を参照し、未登録月は既定パターン
 * （日曜=×・その他=○）で受付する。Firebase 未設定時も同じ既定を使用。
 */

export const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export const SLOTS = [
  "9:00〜11:00",
  "11:00〜13:00",
  "13:00〜15:00",
  "15:00〜17:00",
  "17:00〜19:00",
];

/** 予約を受け付ける先の月数（今月＋2ヶ月） */
export const BOOKING_HORIZON_MONTHS = 2;

export const today = () => {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
};

export const monthLabel = (year: number, month: number) => `${year}年 ${month}月`;
export const firstWeekdayOf = (year: number, month: number) =>
  new Date(year, month - 1, 1).getDay();
export const daysInMonthOf = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

/** 月を n 進めた {year, month} を返す */
export const addMonths = (year: number, month: number, n: number) => {
  const d = new Date(year, month - 1 + n, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

/** (y1,m1) が (y2,m2) より過去か */
export const isBeforeMonth = (y1: number, m1: number, y2: number, m2: number) =>
  y1 * 12 + m1 < y2 * 12 + m2;

/**
 * 既定の空き状況（availability 未登録月・Firebase 未設定時）。
 * 日曜=×、その他=○。今日以前（当日含む）は受付外のため除外。
 */
export function defaultAvail(year: number, month: number): Record<number, string> {
  const t = today();
  const days = daysInMonthOf(year, month);
  const result: Record<number, string> = {};
  for (let d = 1; d <= days; d++) {
    // 過去日・当日は除外（最短は翌日から）
    if (year === t.year && month === t.month && d <= t.day) continue;
    if (isBeforeMonth(year, month, t.year, t.month)) continue;
    const dow = new Date(year, month - 1, d).getDay();
    result[d] = dow === 0 ? "×" : "○";
  }
  return result;
}

export const dowLabel = (year: number, month: number, day: number) =>
  WEEK[new Date(year, month - 1, day).getDay()];

// "7月3日（木）"
export const shortDateLabel = (year: number, month: number, day: number) =>
  `${month}月${day}日（${dowLabel(year, month, day)}）`;

// "2026年7月3日（木）13:00〜15:00"
export const fullDateLabel = (year: number, month: number, day: number, slot: number) =>
  `${year}年${month}月${day}日（${dowLabel(year, month, day)}）${SLOTS[slot]}`;

// 予約番号（日付から決定的に生成：ハイドレーション不一致を避ける）
export const bookingNumber = (year: number, month: number, day: number, slot: number) => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const suffix = String((day * 100 + slot * 7) % 10000).padStart(4, "0");
  return `RT-${year}${mm}${dd}-${suffix}`;
};

export interface PaymentMethod {
  id: string;
  label: string;
  desc: string;
  confirmLabel: string;
}

export const PAYMENTS: PaymentMethod[] = [
  { id: "cash", label: "現金", desc: "当日に現金でお支払い", confirmLabel: "現金（当日お支払い）" },
  { id: "card", label: "クレジットカード", desc: "Visa / Master / JCB ほか", confirmLabel: "クレジットカード" },
  { id: "qr", label: "QR・電子決済", desc: "PayPay / 各種QR決済", confirmLabel: "QR・電子決済" },
];

export const paymentConfirmLabel = (id: string) =>
  PAYMENTS.find((p) => p.id === id)?.confirmLabel ?? "";
