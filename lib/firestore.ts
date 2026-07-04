/**
 * RE:TERA HOME — Firestore データ層
 * ───────────────────────────────────────────────
 * コレクション設計：
 *   services      … 価格マスター（lib/pricing の初期データを seed）
 *   availability  … 日付→空き枠。doc id = "YYYY-MM-DD"、{ month, day, remaining, mark }
 *   bookings      … 予約。確定時にトランザクションで空き枠を検証・減算して作成
 *   surveys       … リフォーム現地調査の申し込み
 *   users         … 会員プロフィール（本人のみ読み書き）
 *
 * Firebase 未設定時は既定パターン（lib/booking の defaultAvail）へフォールバックし、
 * フローはそのまま動作（書き込みはスキップ）。
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { bookingNumber } from "./booking";
import type { Customer } from "@/context/BookingContext";

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;
export const monthKey = (year: number, month: number) => `${year}-${pad(month)}`;

/** 残り枠数 → 空き状況マーク */
export const markFromRemaining = (remaining: number) =>
  remaining <= 0 ? "×" : remaining <= 2 ? "△" : "○";

/**
 * 指定月の空き状況（day→mark）を取得。
 * - Firebase 未設定 → null（呼び出し側が既定パターンを使用）
 * - 設定済みだが未登録月 → null（同上：既定パターンで受付）
 * - 取得エラー → throw（呼び出し側でエラー表示）
 */
export async function fetchMonthAvailability(
  year: number,
  month: number
): Promise<Record<number, string> | null> {
  const db = getDb();
  if (!db) return null;

  const q = query(
    collection(db, "availability"),
    where("month", "==", monthKey(year, month))
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const result: Record<number, string> = {};
  snap.forEach((d) => {
    const data = d.data() as { day: number; remaining?: number; mark?: string };
    result[data.day] = data.mark ?? markFromRemaining(data.remaining ?? 0);
  });
  return result;
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
  year: number;
  month: number;
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

/** 予約枠が満員のときに投げるエラー */
export class SlotFullError extends Error {
  constructor() {
    super("この時間帯は満員になりました。別の日時をお選びください。");
    this.name = "SlotFullError";
  }
}

/**
 * 予約を1件作成する。
 * availability ドキュメントが存在する日は、同一トランザクション内で
 * 残数を検証（0なら SlotFullError）してから予約を作成し、枠を1減算する。
 * 未設定時は書き込みせず、決定的な予約番号だけを返す（フローは継続）。
 */
export async function createBooking(
  payload: BookingPayload
): Promise<{ id: string; bookingNo: string }> {
  const bookingNo = bookingNumber(payload.year, payload.month, payload.day, payload.slot);
  const db = getDb();
  if (!db) return { id: "local-" + bookingNo, bookingNo };

  const availRef = doc(db, "availability", dateKey(payload.year, payload.month, payload.day));
  const bookingRef = doc(collection(db, "bookings"));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(availRef);
    if (snap.exists()) {
      const remaining = (snap.data().remaining as number) ?? 0;
      if (remaining <= 0) throw new SlotFullError();
      const next = remaining - 1;
      tx.update(availRef, { remaining: next, mark: markFromRemaining(next) });
    }
    // availability 未登録日は既定パターンでの受付（減算対象なし）
    tx.set(bookingRef, {
      ...payload,
      bookingNo,
      status: "confirmed",
      // 前日リマインド(cron)が日付で抽出するためのキー。二重送信防止フラグは送信時に付与。
      dateKey: dateKey(payload.year, payload.month, payload.day),
      reminderSent: false,
      createdAt: serverTimestamp(),
    });
  });

  return { id: bookingRef.id, bookingNo };
}

/**
 * ログイン中ユーザーの予約一覧を取得（新しい順）。
 * 未設定時は null を返し、画面側はサンプル表示にフォールバックする。
 */
export async function fetchUserBookings(userId: string): Promise<BookingDoc[] | null> {
  const db = getDb();
  if (!db) return null;
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

/**
 * 【管理者用】全予約を取得（新しい順）。読み取り可否は firestore.rules の isAdmin() が判定。
 * 未設定時は null（画面側はサンプル/空表示にフォールバック）。
 */
export async function fetchAllBookings(): Promise<BookingDoc[] | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDocs(collection(db, "bookings"));
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

/** Firestore の surveys ドキュメント（読み取り用） */
export interface SurveyDoc extends SurveyRequestPayload {
  id: string;
  status: string;
  createdAtMs: number;
}

/**
 * 【管理者用】全見積依頼（現地調査）を取得（新しい順）。読み取り可否は firestore.rules の isAdmin() が判定。
 */
export async function fetchAllSurveys(): Promise<SurveyDoc[] | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await getDocs(collection(db, "surveys"));
  const rows: SurveyDoc[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    rows.push({
      id: d.id,
      ...(data as unknown as SurveyRequestPayload),
      status: (data.status as string) ?? "requested",
      createdAtMs: ts?.toMillis?.() ?? 0,
    });
  });
  rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return rows;
}

/** 会員プロフィール（新規登録時に保存したもの） */
export interface UserProfile {
  sei: string;
  mei: string;
  seiKana: string;
  meiKana: string;
  tel: string;
  email: string;
}

/** 本人プロフィールを取得（未設定・未保存なら null） */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch {
    return null;
  }
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

/* ───────── メッセージ（顧客↔管理者チャット） ─────────
 * 1スレッド = 顧客の uid（threadId）。sender は 'user' | 'admin'。
 * 読み書き可否は firestore.rules（本人スレッド or 管理者）が最終判定。 */
export interface ChatMessage {
  id: string;
  threadId: string;
  sender: "user" | "admin";
  text: string;
  userName: string;
  createdAtMs: number;
}

const toMsg = (id: string, data: Record<string, unknown>): ChatMessage => {
  const ts = data.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    threadId: (data.threadId as string) ?? "",
    sender: (data.sender as "user" | "admin") ?? "user",
    text: (data.text as string) ?? "",
    userName: (data.userName as string) ?? "",
    createdAtMs: ts?.toMillis?.() ?? Date.now(),
  };
};

/** メッセージを1件送信。未設定時は何もしない（呼び出し側でローカル処理）。 */
export async function sendMessage(m: {
  threadId: string; sender: "user" | "admin"; text: string; userName?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  await addDoc(collection(db, "messages"), {
    threadId: m.threadId,
    sender: m.sender,
    text: m.text,
    userName: m.userName ?? "",
    createdAt: serverTimestamp(),
  });
}

/** 1スレッド（threadId=顧客uid）を購読。返り値は購読解除関数。 */
export function subscribeThread(threadId: string, cb: (msgs: ChatMessage[]) => void): () => void {
  const db = getDb();
  if (!db) { cb([]); return () => {}; }
  const q = query(collection(db, "messages"), where("threadId", "==", threadId));
  return onSnapshot(q, (snap) => {
    const rows: ChatMessage[] = [];
    snap.forEach((d) => rows.push(toMsg(d.id, d.data() as Record<string, unknown>)));
    rows.sort((a, b) => a.createdAtMs - b.createdAtMs);
    cb(rows);
  }, () => cb([]));
}

/** 【管理者用】全メッセージを購読（スレッド一覧・会話表示に使用）。 */
export function subscribeAllMessages(cb: (msgs: ChatMessage[]) => void): () => void {
  const db = getDb();
  if (!db) { cb([]); return () => {}; }
  return onSnapshot(collection(db, "messages"), (snap) => {
    const rows: ChatMessage[] = [];
    snap.forEach((d) => rows.push(toMsg(d.id, d.data() as Record<string, unknown>)));
    rows.sort((a, b) => a.createdAtMs - b.createdAtMs);
    cb(rows);
  }, () => cb([]));
}
