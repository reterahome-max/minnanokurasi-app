"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getReformItem, quote, type ReformItem, type QuoteResult } from "@/lib/reformPricing";

/**
 * リフォーム見積カートの状態を画面間で受け渡す Context。
 * /reform/[id] → /reform/simulator → （予約 or /reform/survey）
 * 金額の出所は必ず lib/reformPricing の quote()（税抜）。
 * クリーニングの BookingContext / pricing.ts とは独立（混ぜない）。
 */

export interface ReformCartItem {
  uid: number;
  id: string;   // REFORM_ITEMS の id
  val: number;  // area工事=㎡ / それ以外=数量
}

export interface ReformRow extends ReformCartItem {
  item: ReformItem;
  q: QuoteResult;
  total: number; // 税抜（null は 0 扱い）
}

const TAX = 1.1; // 税込参考表示用

export const defaultVal = (it: ReformItem) => (it.method === "area" ? 20 : 1);
export const needsInput = (it: ReformItem) =>
  it.method === "area" || it.method === "unit" || it.method === "tiered";
export const valLabel = (it: ReformItem) => (it.method === "area" ? "㎡" : it.unitLabel);

export const quoteFor = (it: ReformItem, val: number): QuoteResult =>
  it.method === "area" ? quote(it.id, { area: val }) : quote(it.id, { qty: val });

interface ReformCtx {
  cart: ReformCartItem[];
  rows: ReformRow[];
  net: number;        // 合計（税抜）
  incl: number;       // 税込参考（×1.1）
  hasSurvey: boolean; // 概算（現地調査）工事を含むか
  allBookable: boolean;
  addItem: (id: string, val?: number) => void;
  removeItem: (uid: number) => void;
  setVal: (uid: number, val: number) => void;
  clear: () => void;
}

const Ctx = createContext<ReformCtx | null>(null);
const STORAGE_KEY = "retera_reform_cart";

export function ReformProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ReformCartItem[]>([]);

  // 復元・保存
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch { /* noop */ }
  }, [cart]);

  const addItem = useCallback((id: string, val?: number) => {
    const it = getReformItem(id);
    if (!it) return;
    setCart((c) => [...c, { uid: Date.now() + Math.random(), id, val: val ?? defaultVal(it) }]);
  }, []);
  const removeItem = useCallback(
    (uid: number) => setCart((c) => c.filter((x) => x.uid !== uid)),
    []
  );
  const setVal = useCallback(
    (uid: number, val: number) =>
      setCart((c) => c.map((x) => (x.uid === uid ? { ...x, val: Math.max(0, val) } : x))),
    []
  );
  const clear = useCallback(() => setCart([]), []);

  const rows: ReformRow[] = cart
    .map((ci) => {
      const item = getReformItem(ci.id);
      if (!item) return null;
      const q = quoteFor(item, ci.val);
      return { ...ci, item, q, total: q.total ?? 0 };
    })
    .filter((r): r is ReformRow => r !== null);

  const net = rows.reduce((s, r) => s + r.total, 0);
  const incl = Math.round(net * TAX);
  const hasSurvey = rows.some((r) => !r.item.bookable);
  const allBookable = rows.length > 0 && !hasSurvey;

  return (
    <Ctx.Provider value={{ cart, rows, net, incl, hasSurvey, allBookable, addItem, removeItem, setVal, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useReform() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useReform must be used within ReformProvider");
  return c;
}
