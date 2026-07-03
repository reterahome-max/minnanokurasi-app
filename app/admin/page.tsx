"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar, MapPin, Phone, User, Mail, CreditCard, Wrench,
  MessageSquare, ShieldAlert, ClipboardList, CalendarClock, Home, Camera,
  ArrowLeft, Send,
} from "lucide-react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { SkeletonList, ErrorState } from "@/components/states";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/admin";
import {
  fetchAllBookings, fetchAllSurveys, subscribeAllMessages, sendMessage,
  type BookingDoc, type SurveyDoc, type ChatMessage,
} from "@/lib/firestore";
import { getService } from "@/lib/pricing";
import { COMPANY } from "@/lib/company";

/**
 * RE:TERA HOME — 管理ダッシュボード（管理者専用）
 * 予約(bookings)・見積依頼(surveys)を新しい順で確認。
 * 閲覧可否は firestore.rules の isAdmin() が最終判定（クライアント判定は表示制御用）。
 * デザインは /orders 等のトンマナに準拠。
 */

const yen = (n: number) => (n ?? 0).toLocaleString("ja-JP");
const recvLabel = (ms: number) => {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const statusJa = (s: string) =>
  s === "completed" ? "完了" : s === "cancelled" ? "キャンセル" : "予約中";
const hm = (ms: number) => {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 未設定（ローカル開発）時のプレビュー用サンプル
const SAMPLE_BK: BookingDoc[] = [
  {
    id: "s1", bookingNo: "RT-20260710-1300", status: "confirmed", createdAtMs: Date.now() - 3600_000,
    serviceId: "ac_wall", qty: 2, optionIds: ["anti_mold"], year: 2026, month: 7, day: 10, slot: 1,
    dateLabel: "2026年7月10日（金）13:00〜15:00", totalIncl: 25800, payment: "現金", userId: "u1", reform: null,
    customer: { name: "越谷 太郎", kana: "こしがや たろう", tel: "090-1234-5678", email: "taro@example.com", zip: "343-0845", addr: "埼玉県越谷市南越谷1-26", building: "サンハイツ203", subtel: "", note: "駐車場あります" },
  },
  {
    id: "s2", bookingNo: "RT-20260705-1000", status: "confirmed", createdAtMs: Date.now() - 8600_000,
    serviceId: "reform", qty: 1, optionIds: [], year: 2026, month: 7, day: 5, slot: 0,
    dateLabel: "2026年7月5日（土）10:00〜", totalIncl: 37290, payment: "銀行振込", userId: "u2",
    reform: { items: [{ id: "cloth_std", val: 30, title: "量産クロス貼り替え", total: 33900 }], net: 33900, incl: 37290 },
    customer: { name: "春日部 花子", kana: "かすかべ はなこ", tel: "080-2222-3333", email: "hanako@example.com", zip: "344-0067", addr: "埼玉県春日部市中央2-10", building: "", subtel: "", note: "" },
  },
];
const SAMPLE_MSGS: ChatMessage[] = [
  { id: "m1", threadId: "u1", sender: "user", text: "エアコンの予約日を1日ずらせますか？", userName: "越谷 太郎", createdAtMs: Date.now() - 7200_000 },
  { id: "m2", threadId: "u1", sender: "admin", text: "ご連絡ありがとうございます。翌日13:00〜で空きがございます。", userName: "RE:TERA HOME", createdAtMs: Date.now() - 7000_000 },
  { id: "m3", threadId: "u1", sender: "user", text: "ではその時間でお願いします！", userName: "越谷 太郎", createdAtMs: Date.now() - 6800_000 },
  { id: "m4", threadId: "u2", sender: "user", text: "クロスの見積もりの件、写真を追加で送ります。", userName: "春日部 花子", createdAtMs: Date.now() - 3600_000 },
];
const SAMPLE_SV: SurveyDoc[] = [
  {
    id: "sv1", status: "requested", createdAtMs: Date.now() - 5600_000,
    items: ["フローリング貼り替え（居室）", "室内ドアハンドル交換（レバー）"], net: 245000, photoCount: 3,
    prefs: [{ date: "2026-07-12", time: "午前" }, { date: "2026-07-13", time: "午後" }], userId: "u3",
    customer: { name: "松伏 次郎", tel: "090-9999-0000", email: "jiro@example.com", zip: "343-0114", addr: "埼玉県北葛飾郡松伏町", building: "", note: "築25年戸建て" },
  },
];

function Row({ icon: Icon, children, href }: { icon: typeof User; children: React.ReactNode; href?: string }) {
  const inner = (<><Icon size={14} strokeWidth={2.2} />{children}</>);
  return href ? <a className="rt-adm-row rt-adm-link" href={href}>{inner}</a> : <div className="rt-adm-row">{inner}</div>;
}

function AdminInner() {
  const { user, configured } = useAuth();
  const admin = !configured || isAdminEmail(user?.email);

  const [tab, setTab] = useState<"bookings" | "surveys" | "messages">("bookings");
  const [bk, setBk] = useState<BookingDoc[] | null>(null);
  const [sv, setSv] = useState<SurveyDoc[] | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [selThread, setSelThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(false);

  // メッセージはリアルタイム購読（管理者のみ）。未設定時はサンプル表示。
  useEffect(() => {
    if (!configured) { setMsgs(SAMPLE_MSGS); return; }
    if (!admin) return;
    const unsub = subscribeAllMessages(setMsgs);
    return () => unsub();
  }, [configured, admin]);

  // スレッド一覧（threadId 単位に集約、新しい順）
  const threads = useMemo(() => {
    const map = new Map<string, { threadId: string; userName: string; last: string; lastMs: number; count: number }>();
    for (const m of msgs) {
      const cur = map.get(m.threadId);
      const userName = m.sender === "user" && m.userName ? m.userName : cur?.userName ?? "";
      map.set(m.threadId, { threadId: m.threadId, userName, last: m.text, lastMs: m.createdAtMs, count: (cur?.count ?? 0) + 1 });
    }
    return [...map.values()].sort((a, b) => b.lastMs - a.lastMs);
  }, [msgs]);
  const conv = selThread ? msgs.filter((m) => m.threadId === selThread) : [];
  const selName = threads.find((t) => t.threadId === selThread)?.userName || "お客様";

  // 既読管理（threadId → 最終閲覧時刻、localStorage・端末ごと）
  const [adminSeen, setAdminSeen] = useState<Record<string, number>>({});
  useEffect(() => {
    try { const raw = localStorage.getItem("retera_admin_msg_seen"); if (raw) setAdminSeen(JSON.parse(raw)); } catch { /* noop */ }
  }, []);
  const markThreadSeen = (threadId: string) => {
    setAdminSeen((prev) => {
      const next = { ...prev, [threadId]: Date.now() };
      try { localStorage.setItem("retera_admin_msg_seen", JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };
  const threadUnread = (threadId: string) =>
    msgs.filter((m) => m.threadId === threadId && m.sender === "user" && m.createdAtMs > (adminSeen[threadId] ?? 0)).length;
  const unreadThreads = threads.reduce((n, t) => n + (threadUnread(t.threadId) > 0 ? 1 : 0), 0);
  // 開いているスレッドは既読に（新着が来ても閲覧中なら消す）
  useEffect(() => { if (selThread) markThreadSeen(selThread); }, [selThread, msgs]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendReply = () => {
    const v = reply.trim();
    if (!v || !selThread) return;
    setReply("");
    sendMessage({ threadId: selThread, sender: "admin", text: v, userName: COMPANY.name }).catch(() => {});
  };

  const load = () => {
    if (!configured) { setBk(SAMPLE_BK); setSv(SAMPLE_SV); setLoading(false); return; }
    if (!admin) { setLoading(false); return; }
    setLoading(true); setError(false);
    Promise.all([fetchAllBookings(), fetchAllSurveys()])
      .then(([b, s]) => { setBk(b ?? []); setSv(s ?? []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };
  useEffect(load, [configured, user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-page-head">
          <h1 className="rt-page-title">管理ダッシュボード</h1>
          <p className="rt-page-sub">ご予約・お見積り依頼を確認できます（{COMPANY.name} 管理者専用）。</p>
        </div>

        {configured && !admin ? (
          <div className="rt-adm-deny">
            <div className="rt-adm-deny-ico"><ShieldAlert size={30} strokeWidth={2} /></div>
            <div className="rt-adm-deny-t">閲覧権限がありません</div>
            <div className="rt-adm-deny-d">この画面は管理者専用です。管理者アカウントでログインしてください。</div>
            <Link href="/" className="rt-adm-deny-btn"><Home size={15} strokeWidth={2.4} />ホームへ戻る</Link>
          </div>
        ) : (
          <>
            <div className="rt-adm-stats">
              <button className={"rt-adm-stat" + (tab === "bookings" ? " on" : "")} onClick={() => { setTab("bookings"); setSelThread(null); }}>
                <div className="rt-adm-stat-ico"><Calendar size={18} strokeWidth={2.2} /></div>
                <div><div className="rt-adm-stat-n">{bk?.length ?? "—"}</div><div className="rt-adm-stat-l">予約</div></div>
              </button>
              <button className={"rt-adm-stat" + (tab === "surveys" ? " on" : "")} onClick={() => { setTab("surveys"); setSelThread(null); }}>
                <div className="rt-adm-stat-ico"><ClipboardList size={18} strokeWidth={2.2} /></div>
                <div><div className="rt-adm-stat-n">{sv?.length ?? "—"}</div><div className="rt-adm-stat-l">見積依頼</div></div>
              </button>
              <button className={"rt-adm-stat" + (tab === "messages" ? " on" : "")} onClick={() => { setTab("messages"); setSelThread(null); }}>
                <div className="rt-adm-stat-ico"><MessageSquare size={18} strokeWidth={2.2} />{unreadThreads > 0 && <span className="rt-adm-dot" />}</div>
                <div><div className="rt-adm-stat-n">{threads.length}</div><div className="rt-adm-stat-l">メッセージ</div></div>
              </button>
            </div>

            {tab === "messages" ? (
              selThread === null ? (
                threads.length > 0 ? (
                  <div className="rt-adm-threads">
                    {threads.map((t) => (
                      <button key={t.threadId} className="rt-adm-thread" onClick={() => setSelThread(t.threadId)}>
                        <div className="rt-adm-th-av">{(t.userName || "客").slice(0, 1)}</div>
                        <div className="rt-adm-th-body">
                          <div className="rt-adm-th-top"><span className="rt-adm-th-name">{t.userName || "お客様"}</span><span className="rt-adm-th-time">{hm(t.lastMs)}</span></div>
                          <div className={"rt-adm-th-last" + (threadUnread(t.threadId) > 0 ? " unread" : "")}>{t.last}</div>
                        </div>
                        {threadUnread(t.threadId) > 0 && <span className="rt-adm-th-dot">{threadUnread(t.threadId)}</span>}
                      </button>
                    ))}
                  </div>
                ) : <div className="rt-adm-empty"><MessageSquare size={26} strokeWidth={1.8} />まだメッセージはありません</div>
              ) : (
                <div className="rt-adm-conv">
                  <div className="rt-adm-conv-head">
                    <button className="rt-adm-conv-back" onClick={() => setSelThread(null)} aria-label="一覧へ戻る"><ArrowLeft size={18} strokeWidth={2.4} /></button>
                    <div className="rt-adm-conv-name">{selName}</div>
                  </div>
                  <div className="rt-adm-conv-body">
                    {conv.map((m) => {
                      const mine = m.sender === "admin";
                      return (
                        <div className={"rt-adm-bwrap " + (mine ? "mine" : "theirs")} key={m.id}>
                          <div className={"rt-adm-bub " + (mine ? "b-me" : "b-them")}>{m.text}</div>
                          <div className="rt-adm-btime">{hm(m.createdAtMs)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rt-adm-reply">
                    <input className="rt-adm-reply-in" placeholder="返信を入力" value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} />
                    <button className={"rt-adm-reply-btn" + (reply.trim() ? " on" : "")} onClick={sendReply} disabled={!reply.trim()} aria-label="送信"><Send size={18} strokeWidth={2.2} /></button>
                  </div>
                </div>
              )
            ) : loading ? (
              <SkeletonList count={3} />
            ) : error ? (
              <ErrorState onRetry={load} />
            ) : tab === "bookings" ? (
              (bk && bk.length > 0) ? (
                <div className="rt-adm-list">
                  {bk.map((b) => {
                    const isReform = b.reform != null && b.reform.items.length > 0;
                    const title = isReform ? `リフォーム工事 × ${b.reform!.items.length}件` : (getService(b.serviceId)?.title ?? b.serviceId);
                    const st = statusJa(b.status);
                    const c = b.customer;
                    return (
                      <div className="rt-adm-card" key={b.id}>
                        <div className="rt-adm-head">
                          <span className={"rt-adm-tag " + (st === "予約中" ? "t-book" : st === "完了" ? "t-done" : "t-cancel")}>{st}</span>
                          <span className="rt-adm-no">{b.bookingNo}</span>
                          <span className="rt-adm-recv">受付 {recvLabel(b.createdAtMs)}</span>
                        </div>
                        <div className="rt-adm-title">{title}{!isReform && b.qty > 1 ? ` × ${b.qty}` : ""}</div>
                        {isReform && <div className="rt-adm-sub">{b.reform!.items.map((it) => it.title).join("、")}</div>}
                        <div className="rt-adm-rows">
                          <Row icon={Calendar}>{b.dateLabel}</Row>
                          <Row icon={User}>{c.name}{c.kana ? `（${c.kana}）` : ""}</Row>
                          <Row icon={Phone} href={`tel:${c.tel}`}>{c.tel}{c.subtel ? ` / ${c.subtel}` : ""}</Row>
                          {c.email && <Row icon={Mail} href={`mailto:${c.email}`}>{c.email}</Row>}
                          <Row icon={MapPin}>{[c.zip && `〒${c.zip}`, c.addr, c.building].filter(Boolean).join(" ")}</Row>
                          <Row icon={CreditCard}>{b.payment || "—"}</Row>
                          {c.note && <Row icon={MessageSquare}>{c.note}</Row>}
                        </div>
                        <div className="rt-adm-foot">
                          <span>{isReform ? "お支払い（税込参考）" : "お支払い（税込）"}</span>
                          <span className="rt-adm-price">{yen(b.totalIncl)}<b>円</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="rt-adm-empty"><Calendar size={26} strokeWidth={1.8} />まだ予約はありません</div>
            ) : (
              (sv && sv.length > 0) ? (
                <div className="rt-adm-list">
                  {sv.map((s) => {
                    const c = s.customer;
                    return (
                      <div className="rt-adm-card" key={s.id}>
                        <div className="rt-adm-head">
                          <span className="rt-adm-tag t-survey">見積依頼</span>
                          <span className="rt-adm-recv">受付 {recvLabel(s.createdAtMs)}</span>
                        </div>
                        <div className="rt-adm-title">リフォーム見積依頼</div>
                        <div className="rt-adm-sub">{s.items.join("、")}</div>
                        <div className="rt-adm-rows">
                          <Row icon={User}>{c.name}</Row>
                          <Row icon={Phone} href={`tel:${c.tel}`}>{c.tel}</Row>
                          {c.email && <Row icon={Mail} href={`mailto:${c.email}`}>{c.email}</Row>}
                          <Row icon={MapPin}>{[c.zip && `〒${c.zip}`, c.addr, c.building].filter(Boolean).join(" ")}</Row>
                          {s.prefs?.length > 0 && <Row icon={CalendarClock}>希望日程：{s.prefs.map((p) => `${p.date} ${p.time}`).join(" / ")}</Row>}
                          <Row icon={Camera}>現地写真 {s.photoCount ?? 0} 枚</Row>
                          {c.note && <Row icon={MessageSquare}>{c.note}</Row>}
                        </div>
                        <div className="rt-adm-foot">
                          <span>概算（税抜）</span>
                          <span className="rt-adm-price">{yen(s.net)}<b>円</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="rt-adm-empty"><Wrench size={26} strokeWidth={1.8} />まだ見積依頼はありません</div>
            )}
          </>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminInner />
    </AuthGuard>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-page-head{padding:16px 2px 14px;}
.rt-page-title{font-size:24px;font-weight:900;margin:0 0 4px;}
.rt-page-sub{font-size:12.5px;color:var(--ink-2);font-weight:600;margin:0;}
.rt-adm-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;}
.rt-adm-stat{display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 6px;cursor:pointer;text-align:center;}
.rt-adm-stat.on{border-color:var(--red);background:var(--red-soft-2);}
.rt-adm-stat-ico{position:relative;flex:none;width:36px;height:36px;border-radius:10px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-adm-dot{position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;background:var(--red);box-shadow:0 0 0 2px #fff;}
.rt-adm-th-dot{flex:none;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--red);color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;}
.rt-adm-th-last.unread{color:var(--ink);font-weight:800;}
.rt-adm-stat-n{font-size:20px;font-weight:900;line-height:1;}
.rt-adm-stat-l{font-size:11px;font-weight:700;color:var(--ink-2);margin-top:2px;}
/* メッセージ：スレッド一覧 */
.rt-adm-threads{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow);}
.rt-adm-thread{display:flex;align-items:center;gap:11px;padding:13px 14px;background:none;border:none;border-bottom:1px solid var(--line);cursor:pointer;text-align:left;width:100%;}
.rt-adm-thread:last-child{border-bottom:none;}
.rt-adm-th-av{flex:none;width:40px;height:40px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;}
.rt-adm-th-body{flex:1;min-width:0;}
.rt-adm-th-top{display:flex;justify-content:space-between;gap:8px;}
.rt-adm-th-name{font-size:13.5px;font-weight:800;}
.rt-adm-th-time{font-size:10.5px;color:var(--ink-3);font-weight:700;flex:none;}
.rt-adm-th-last{font-size:12px;color:var(--ink-2);font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* メッセージ：会話 */
.rt-adm-conv{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow);display:flex;flex-direction:column;}
.rt-adm-conv-head{display:flex;align-items:center;gap:9px;padding:11px 12px;border-bottom:1px solid var(--line);}
.rt-adm-conv-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-adm-conv-name{font-size:14px;font-weight:900;}
.rt-adm-conv-body{display:flex;flex-direction:column;gap:8px;padding:14px;max-height:52vh;overflow-y:auto;background:var(--bg);}
.rt-adm-bwrap{display:flex;flex-direction:column;max-width:82%;}
.rt-adm-bwrap.mine{align-self:flex-end;align-items:flex-end;}
.rt-adm-bwrap.theirs{align-self:flex-start;align-items:flex-start;}
.rt-adm-bub{font-size:13px;line-height:1.55;font-weight:500;padding:10px 13px;border-radius:15px;}
.b-them{background:#fff;border:1px solid var(--line);border-bottom-left-radius:5px;color:var(--ink);}
.b-me{background:var(--red);color:#fff;border-bottom-right-radius:5px;}
.rt-adm-btime{font-size:9.5px;color:var(--ink-3);font-weight:600;margin-top:3px;}
.rt-adm-reply{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid var(--line);}
.rt-adm-reply-in{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:11px 16px;font-size:13.5px;color:var(--ink);outline:none;font-family:inherit;}
.rt-adm-reply-btn{width:40px;height:40px;border-radius:50%;background:#D7DADE;color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;}
.rt-adm-reply-btn.on{background:var(--red);}
.rt-adm-list{display:flex;flex-direction:column;gap:13px;}
.rt-adm-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--shadow);}
.rt-adm-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.rt-adm-tag{font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:7px;white-space:nowrap;}
.t-book{background:var(--blue);}
.t-done{background:var(--green);}
.t-cancel{background:var(--ink-3);}
.t-survey{background:var(--gold);}
.rt-adm-no{font-size:11.5px;font-weight:800;color:var(--ink-2);letter-spacing:.02em;}
.rt-adm-recv{margin-left:auto;font-size:10.5px;font-weight:700;color:var(--ink-3);}
.rt-adm-title{font-size:16px;font-weight:900;line-height:1.3;}
.rt-adm-sub{font-size:11.5px;font-weight:700;color:var(--ink-2);margin-top:3px;line-height:1.5;}
.rt-adm-rows{display:flex;flex-direction:column;gap:7px;margin-top:11px;padding-top:11px;border-top:1px solid var(--line);}
.rt-adm-row{display:flex;align-items:flex-start;gap:7px;font-size:12.5px;font-weight:600;color:var(--ink);line-height:1.45;}
.rt-adm-row svg{color:var(--red);flex:none;margin-top:1px;}
.rt-adm-link{color:var(--blue);text-decoration:none;font-weight:700;}
.rt-adm-foot{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:11px;border-top:1px solid var(--line);}
.rt-adm-foot span:first-child{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-adm-price{font-size:20px;font-weight:900;color:var(--red);line-height:1;}
.rt-adm-price b{font-size:12px;margin-left:1px;}
.rt-adm-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:48px 24px;color:var(--ink-3);font-size:13px;font-weight:700;}
.rt-adm-empty svg{color:var(--ink-3);}
.rt-adm-deny{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:40px 24px;box-shadow:var(--shadow);}
.rt-adm-deny-ico{width:60px;height:60px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
.rt-adm-deny-t{font-size:17px;font-weight:900;}
.rt-adm-deny-d{font-size:12.5px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-adm-deny-btn{display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:var(--red);color:#fff;border-radius:11px;padding:12px 20px;font-size:14px;font-weight:800;text-decoration:none;}
`;
