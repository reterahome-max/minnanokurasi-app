/**
 * RE:TERA HOME — 予約フロー共通定数・ヘルパー
 * カレンダー（サンプルの2026年7月）・時間帯・空き状況・支払い方法。
 * 実装時に availability を Firestore 値へ差し替える前提（値はデザイン準拠のサンプル）。
 */

export const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export const SLOTS = [
  "9:00〜11:00",
  "11:00〜13:00",
  "13:00〜15:00",
  "15:00〜17:00",
  "17:00〜19:00",
];

// 2026年7月（1日=水曜と仮定）
export const CAL_YEAR = 2026;
export const CAL_MONTH = 7;
export const CAL_FIRST_WEEKDAY = 3; // 水
export const CAL_DAYS_IN_MONTH = 31;
export const CAL_MONTH_LABEL = "2026年 7月";

// サンプル：7月の一部に空き状況（○=空き多 △=残少 ×=満）
export const AVAIL: Record<number, string> = {
  3: "○", 4: "△", 5: "×", 6: "○", 7: "○", 8: "△", 9: "○", 10: "○", 11: "×",
  12: "○", 13: "△", 14: "○", 15: "○", 16: "○", 17: "△", 18: "○",
};

export const dowOf = (day: number) => WEEK[(CAL_FIRST_WEEKDAY + day - 1) % 7];

// "7月3日（木）"
export const shortDateLabel = (day: number) => `${CAL_MONTH}月${day}日（${dowOf(day)}）`;

// "2026年7月3日（木）13:00〜15:00"
export const fullDateLabel = (day: number, slot: number) =>
  `${CAL_YEAR}年${CAL_MONTH}月${day}日（${dowOf(day)}）${SLOTS[slot]}`;

// 予約番号（日付から決定的に生成：ハイドレーション不一致を避ける）
export const bookingNumber = (day: number, slot: number) => {
  const mm = String(CAL_MONTH).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const suffix = String((day * 100 + slot * 7) % 10000).padStart(4, "0");
  return `RT-${CAL_YEAR}${mm}${dd}-${suffix}`;
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
