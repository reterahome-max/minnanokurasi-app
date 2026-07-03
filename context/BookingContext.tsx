"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * 予約フローの状態を画面間で受け渡す Context。
 * /simulator → /booking/date → /booking/info → /booking/confirm → /booking/complete
 * sessionStorage に保持し、リロードでも維持。
 */

export interface Customer {
  name: string;
  kana: string;
  tel: string;
  email: string;
  zip: string;
  addr: string;
  building: string;
  subtel: string;
  note: string;
}

/** リフォーム予約の内容（金額の出所は lib/reformPricing・税抜）。クリーニングの pricing とは混ぜない。 */
export interface ReformOrder {
  items: { id: string; val: number }[];
  net: number;  // 税抜合計
  incl: number; // 税込参考
}

export interface BookingState {
  serviceId: string;
  qty: number;
  optionIds: string[];
  day: number | null;
  slot: number | null;
  customer: Customer;
  payment: string;
  /** 確定後にサーバー（または決定的生成）から受け取る予約番号 */
  bookingNo: string | null;
  /** リフォーム予約時のみセット（null=クリーニング予約） */
  reform: ReformOrder | null;
}

const emptyCustomer: Customer = {
  name: "",
  kana: "",
  tel: "",
  email: "",
  zip: "",
  addr: "",
  building: "",
  subtel: "",
  note: "",
};

// 既定値はシミュレーター初期表示（壁掛け・2台）に合わせる
const defaultState: BookingState = {
  serviceId: "ac_wall",
  qty: 2,
  optionIds: [],
  day: null,
  slot: null,
  customer: emptyCustomer,
  payment: "cash",
  bookingNo: null,
  reform: null,
};

interface BookingCtx extends BookingState {
  set: (patch: Partial<BookingState>) => void;
  setCustomer: (patch: Partial<Customer>) => void;
  toggleOption: (id: string) => void;
  reset: () => void;
  /** date と slot が揃っている（フロー経由）か */
  hasSchedule: boolean;
}

const Ctx = createContext<BookingCtx | null>(null);
const STORAGE_KEY = "retera_booking";

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(defaultState);

  // 復元
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  // 保存
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  const set = useCallback(
    (patch: Partial<BookingState>) => setState((s) => ({ ...s, ...patch })),
    []
  );
  const setCustomer = useCallback(
    (patch: Partial<Customer>) =>
      setState((s) => ({ ...s, customer: { ...s.customer, ...patch } })),
    []
  );
  const toggleOption = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        optionIds: s.optionIds.includes(id)
          ? s.optionIds.filter((o) => o !== id)
          : [...s.optionIds, id],
      })),
    []
  );
  const reset = useCallback(() => setState(defaultState), []);

  const value: BookingCtx = {
    ...state,
    set,
    setCustomer,
    toggleOption,
    reset,
    hasSchedule: state.day != null && state.slot != null,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking must be used within BookingProvider");
  return c;
}
