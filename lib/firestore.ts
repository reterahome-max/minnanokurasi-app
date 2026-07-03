/**
 * RE:TERA HOME — Firestore データ層
 * ───────────────────────────────────────────────
 * コレクション設計：
 *   services      … 価格マスター（lib/pricing の初期データを seed）
 *   availability  … 日付→空き枠。doc id = "YYYY-MM-DD"、{ month, day, remaining, mark }
 *   bookings      … 予約。確認画面の確定で作成し、availability を1減算
 *   users / messages … （STEP6 以降）
 *
 * Firebase 未設定時はサンプル（lib/booking の AVAIL）へフォールバックし、フローはそのまま動作。
 */
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { AVAIL, CAL_YEAR, CAL_MONTH, bookingNumber } from "./booking";
import type { Customer } from "@/context/BookingContext";

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;
export const monthKey = (year: number, month: number) => `${year}-${pad(month)}`;

/** 残り枠数 → 空き状況マーク */
export const markFromRemaining = (remaining: number) =>
  remaining <= 0 ? "×" : remaining <= 2 ? "△" : "○";

/**
 * 指定月の空き状況（day→mark）を取得。未設定時はサンプル AVAIL を返す。
 */
export async function fetchMonthAvailability(
  year = CAL_YEAR,
  month = CAL_MONTH
): Promise<Record<number, string>> {
  const db = getDb();
  if (!db) return AVAIL; // フォールバック

  const q = query(
    collection(db, "availability"),
    where("month", "==", monthKey(year, month))
  );
  const snap = await getDocs(q);
  const result: Record<number, string> = {};
  snap.forEach((d) => {
    const data = d.data() as { day: number; remaining?: number; mark?: string };
    result[data.day] =
      data.mark ?? markFromRemaining(data.remaining ?? 0);
  });
  return Object.keys(result).length ? result : AVAIL;
}

export interface ReformSummary {
  items: { id: string; val: number; title: string; total: number }[];
  net: number;  // 税抜合計
  incl: number; // 税込参考
}

export interface BookingPayload {
  serviceId: string;
  qty: number;
  optionIds: string[];
  day: number;
  slot: number;
  dateLabel: string;
  customer: Customer;
  payment: string;
  totalIncl: number;
  /** ログイン中のユーザーID（ゲストは null）。/orders の本人予約フィルタに使用 */
  userId?: string | null;
  /** リフォーム予約時のみ。金額の出所は lib/reformPricing（税抜）。 */
  reform?: ReformSummary | null;
}

/** Firestore の bookings ドキュメント（読み取り用） */
export interface BookingDoc extends BookingPayload {
  id: string;
  bookingNo: string;
  status: string;
  createdAtMs: number;
}

/**
 * 予約を1件作成し、対象日の空き枠を1減算する。
 * 未設定時は書き込みせず、決定的な予約番号だけを返す（フローは継続）。
 */
export async function createBooking(
  payload: BookingPayload
): Promise<{ id: string; bookingNo: string }> {
  const bookingNo = bookingNumber(payload.day, payload.slot);
  const db = getDb();
  if (!db) return { id: "local-" + bookingNo, bookingNo };

  // 予約ドキュメント作成
  const ref = await addDoc(collection(db, "bookings"), {
    ...payload,
    bookingNo,
    status: "confirmed",
    createdAt: serverTimestamp(),
  });

  // 空き枠を1減算（トランザクション）
  const availRef = doc(db, "availability", dateKey(CAL_YEAR, CAL_MONTH, payload.day));
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(availRef);
      if (!snap.exists()) return;
      const remaining = Math.max(0, ((snap.data().remaining as number) ?? 0) - 1);
      tx.update(availRef, { remaining, mark: markFromRemaining(remaining) });
    });
  } catch {
    // 空き枠ドキュメントが無い等は無視（予約自体は作成済み）
  }

  return { id: ref.id, bookingNo };
}

/**
 * ログイン中ユーザーの予約一覧を取得（新しい順）。
 * 未設定時は null を返し、画面側はサンプル表示にフォールバックする。
 * where(userId==) のみで取得し、並べ替えはクライアント側（複合インデックス不要）。
 */
export async function fetchUserBookings(userId: string): Promise<BookingDoc[] | null> {
  const db = getDb();
  if (!db) return null; // 未設定 → 画面はサンプルへ
  const q = query(collection(db, "bookings"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const rows: BookingDoc[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    rows.push({
      id: d.id,
      ...(data as unknown as BookingPayload),
      bookingNo: (data.bookingNo as string) ?? "",
      status: (data.status as string) ?? "confirmed",
      createdAtMs: ts?.toMillis?.() ?? 0,
    });
  });
  rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return rows;
}

export interface SurveyRequestPayload {
  items: string[];   // 工事リスト（表示文字列）
  net: number;       // 概算合計（税抜）
  customer: { name: string; tel: string; email: string; zip: string; addr: string; building: string; note: string };
  prefs: { date: string; time: string }[]; // 希望日程（最大3）
  photoCount: number;
  userId?: string | null;
}

/**
 * 現地調査の申し込みを1件作成する。未設定時は書き込みせずフロー継続。
 */
export async function createSurveyRequest(payload: SurveyRequestPayload): Promise<{ id: string }> {
  const db = getDb();
  if (!db) return { id: "local-survey" };
  const ref = await addDoc(collection(db, "surveys"), {
    ...payload,
    status: "requested",
    createdAt: serverTimestamp(),
  });
  return { id: ref.id };
}
