"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { subscribeThread, type ChatMessage } from "@/lib/firestore";

/**
 * ログイン中ユーザーの未読メッセージ数を管理（ボトムナビのバッジ用）。
 * 「既読時刻」を localStorage に保持し、それ以降に届いた管理者メッセージを未読とみなす。
 * サーバ側の read フラグは持たない軽量方式（端末ごと）。
 */
const SEEN_KEY = "retera_msg_seen";

interface UnreadCtx {
  messages: ChatMessage[];
  unread: number;
  markSeen: () => void;
}
const Ctx = createContext<UnreadCtx>({ messages: [], unread: 0, markSeen: () => {} });

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seenMs, setSeenMs] = useState(0);

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(SEEN_KEY));
      setSeenMs(Number.isFinite(v) ? v : 0);
    } catch { /* noop */ }
  }, [user?.uid]);

  useEffect(() => {
    if (!configured || !user) { setMessages([]); return; }
    const unsub = subscribeThread(user.uid, setMessages);
    return () => unsub();
  }, [configured, user]);

  const unread = messages.filter((m) => m.sender === "admin" && m.createdAtMs > seenMs).length;

  const markSeen = useCallback(() => {
    const latest = messages.reduce((mx, m) => Math.max(mx, m.createdAtMs), Date.now());
    setSeenMs(latest);
    try { localStorage.setItem(SEEN_KEY, String(latest)); } catch { /* noop */ }
  }, [messages]);

  return <Ctx.Provider value={{ messages, unread, markSeen }}>{children}</Ctx.Provider>;
}

export const useUnread = () => useContext(Ctx);
