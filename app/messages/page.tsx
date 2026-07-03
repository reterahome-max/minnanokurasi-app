"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Send, Plus, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useUnread } from "@/context/UnreadContext";
import { notifyAdmin } from "@/lib/notify";
import { fetchUserBookings, subscribeThread, sendMessage, type ChatMessage } from "@/lib/firestore";
import { getService } from "@/lib/pricing";

/**
 * RE:TERA HOME — メッセージ（スタッフとのチャット・Firestore接続）
 * 1スレッド=ログインユーザーの uid。送信は messages に保存、管理者の返信を購読して即時表示。
 * Firebase 未設定時はローカルのデモ（sessionStorage）で動作。
 */
type Msg = { from: "system" | "staff" | "me"; text: string; time: string; read?: boolean };

const INTRO: Msg = { from: "system", text: "RE:TERA HOME サポートです。ご予約の変更・ご相談など、ご用件をお送りください。担当が確認のうえご返信します。", time: "" };
const QUICK = ["日程を変更したい", "作業時間の目安は？", "追加オプションを相談", "領収書がほしい"];
const STORAGE_KEY = "retera_messages";

const hm = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function MessagesInner() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const { markSeen } = useUnread();
  const live = configured && !!user; // Firestore接続モード
  const [local, setLocal] = useState<Msg[]>([]); // 未設定時のデモ用
  const [remote, setRemote] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [banner, setBanner] = useState<{ title: string; date: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // 未設定（デモ）：送信履歴をセッション内で保持
  useEffect(() => {
    if (live) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setLocal(JSON.parse(raw));
    } catch { /* noop */ }
  }, [live]);

  // 接続モード：自分のスレッドを購読
  useEffect(() => {
    if (!live || !user) return;
    const unsub = subscribeThread(user.uid, setRemote);
    return () => unsub();
  }, [live, user]);

  // ログイン中は直近の予約をバナーに表示
  useEffect(() => {
    if (!configured || !user) return;
    fetchUserBookings(user.uid).then((rows) => {
      const b = rows?.[0];
      if (!b) return;
      const isReform = b.reform != null && b.reform.items.length > 0;
      const svc = getService(b.serviceId);
      setBanner({
        title: isReform
          ? `リフォーム工事 × ${b.reform!.items.length}件`
          : `${svc?.title ?? "ご予約"} × ${b.qty}${svc?.unitLabel ?? ""}`,
        date: `${b.dateLabel} ・ 予約確定`,
      });
    }).catch(() => {});
  }, [configured, user]);

  // 表示用リスト（先頭に案内文）
  const msgs: Msg[] = [
    INTRO,
    ...(live
      ? remote.map((m): Msg => ({ from: m.sender === "admin" ? "staff" : "me", text: m.text, time: hm(m.createdAtMs), read: true }))
      : local),
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [remote, local]);

  // この画面を開いている間は既読扱い（ボトムナビのバッジをクリア）
  useEffect(() => { markSeen(); }, [remote]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = (t?: string) => {
    const v = (t ?? text).trim();
    if (!v) return;
    setText("");
    if (live && user) {
      const name = user.displayName ?? "お客様";
      sendMessage({ threadId: user.uid, sender: "user", text: v, userName: name }).catch(() => {});
      notifyAdmin({ kind: "メッセージ", title: `${name} さんからメッセージ`, lines: [v] });
      return;
    }
    // 未設定：ローカルデモ
    const time = hm(Date.now());
    setLocal((m) => {
      const next = [...m, { from: "me" as const, text: v, time, read: false }];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-chat-header">
          <button className="rt-icon-btn" onClick={() => router.push("/")}><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-chat-peer">
            <div className="rt-chat-avatar">佐</div>
            <div>
              <div className="rt-chat-name">RE:TERA HOME サポート</div>
              <div className="rt-chat-status"><span className="rt-online" />オンライン・通常5分以内に返信</div>
            </div>
          </div>
          <button className="rt-icon-btn"><Phone size={21} strokeWidth={2.2} /></button>
        </header>

        {banner && (
          <div className="rt-chat-banner">
            <div className="rt-chat-banner-bar" />
            <div>
              <div className="rt-chat-banner-t">{banner.title}</div>
              <div className="rt-chat-banner-d">{banner.date}</div>
            </div>
          </div>
        )}

        <div className="rt-chat-body">
          {msgs.map((m, i) => {
            if (m.from === "system") return <div className="rt-chat-sys" key={i}>{m.text}</div>;
            const mine = m.from === "me";
            return (
              <div className={"rt-row " + (mine ? "mine" : "theirs")} key={i}>
                {!mine && <div className="rt-bub-avatar">佐</div>}
                <div className="rt-bub-wrap">
                  <div className={"rt-bub " + (mine ? "bub-me" : "bub-them")}>{m.text}</div>
                  <div className="rt-bub-meta">
                    {mine && <Check size={13} strokeWidth={2.4} className="rt-sent" />}
                    <span>{m.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="rt-quick">
          {QUICK.map((q, i) => <button key={i} className="rt-quick-chip" onClick={() => send(q)}>{q}</button>)}
        </div>

        <div className="rt-input-bar">
          <button className="rt-input-plus"><Plus size={22} strokeWidth={2.2} /></button>
          <input className="rt-input" placeholder="メッセージを入力" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className={"rt-send" + (text.trim() ? " on" : "")} onClick={() => send()} disabled={!text.trim()}><Send size={19} strokeWidth={2.2} /></button>
        </div>

        <BottomNav active="messages" />
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <AuthGuard>
      <MessagesInner />
    </AuthGuard>
  );
}

const styles = `
.rt-shell{padding:0;display:flex;flex-direction:column;height:100vh;height:100dvh;}
.rt-icon-btn{background:none;border:none;color:var(--ink);cursor:pointer;padding:4px;display:flex;flex:none;}
.rt-chat-header{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fff;border-bottom:1px solid var(--line);}
.rt-chat-peer{display:flex;align-items:center;gap:9px;flex:1;min-width:0;}
.rt-chat-avatar{width:40px;height:40px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;flex:none;}
.rt-chat-name{font-size:14.5px;font-weight:900;line-height:1.2;}
.rt-chat-status{display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--ink-2);font-weight:600;margin-top:2px;}
.rt-online{width:7px;height:7px;border-radius:50%;background:var(--green);}
.rt-chat-banner{display:flex;align-items:center;gap:10px;background:var(--red-soft);padding:10px 14px;}
.rt-chat-banner-bar{width:3px;align-self:stretch;background:var(--red);border-radius:2px;}
.rt-chat-banner-t{font-size:12.5px;font-weight:900;}
.rt-chat-banner-d{font-size:10.5px;color:var(--ink-2);font-weight:700;margin-top:2px;}
.rt-chat-body{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;}
.rt-chat-date{align-self:center;font-size:10.5px;font-weight:700;color:var(--ink-3);background:rgba(0,0,0,.05);padding:4px 12px;border-radius:999px;margin-bottom:4px;}
.rt-chat-sys{align-self:center;text-align:center;font-size:11px;color:var(--ink-2);font-weight:600;background:#fff;border:1px solid var(--line);border-radius:12px;padding:9px 13px;max-width:88%;line-height:1.5;}
.rt-row{display:flex;gap:7px;max-width:84%;}
.rt-row.mine{align-self:flex-end;flex-direction:row-reverse;}
.rt-row.theirs{align-self:flex-start;}
.rt-bub-avatar{width:28px;height:28px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex:none;align-self:flex-end;}
.rt-bub-wrap{display:flex;flex-direction:column;}
.rt-bub{font-size:13px;line-height:1.55;font-weight:500;padding:10px 13px;border-radius:15px;}
.bub-them{background:#fff;border:1px solid var(--line);border-bottom-left-radius:5px;color:var(--ink);}
.bub-me{background:var(--red);color:#fff;border-bottom-right-radius:5px;}
.rt-bub-meta{display:flex;align-items:center;gap:3px;font-size:9.5px;color:var(--ink-3);font-weight:600;margin-top:3px;}
.rt-row.mine .rt-bub-meta{justify-content:flex-end;}
.rt-read{color:var(--red);}.rt-sent{color:var(--ink-3);}
.rt-quick{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding:8px 14px;background:var(--bg);}
.rt-quick::-webkit-scrollbar{display:none;}
.rt-quick-chip{flex:none;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12px;font-weight:700;border-radius:999px;padding:8px 14px;cursor:pointer;white-space:nowrap;}
.rt-input-bar{display:flex;align-items:center;gap:8px;background:#fff;border-top:1px solid var(--line);padding:9px 12px;}
.rt-input-plus{width:36px;height:36px;border-radius:50%;background:var(--bg);border:none;color:var(--ink-2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;}
.rt-input{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:11px 16px;font-size:13.5px;color:var(--ink);outline:none;font-family:inherit;}
.rt-input::placeholder{color:var(--ink-3);}
.rt-send{width:40px;height:40px;border-radius:50%;background:#D7DADE;color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:background .15s;}
.rt-send.on{background:var(--red);}
`;
