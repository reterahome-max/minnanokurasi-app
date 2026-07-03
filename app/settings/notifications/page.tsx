"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MessageCircle, Mail, Bell, CalendarClock, CheckCircle2, Tag, Megaphone,
} from "lucide-react";

/**
 * RE:TERA HOME — 通知設定
 * RETERA_NotificationSettings.jsx を移植。チャネル × 種別ごとに ON/OFF。
 * 取引通知（予約確認・リマインド・完了）は原則 OFF 不可（disabled）。
 */
const CHANNELS = [
  { id: "line", label: "LINE", desc: "予約連絡をLINEで受け取る", icon: MessageCircle, on: true },
  { id: "push", label: "アプリ通知", desc: "プッシュ通知を受け取る", icon: Bell, on: true },
  { id: "email", label: "メール", desc: "予約確認メールを受け取る", icon: Mail, on: false },
];
const TYPES = [
  { id: "confirm", label: "予約確認", desc: "予約確定時のお知らせ", icon: CheckCircle2, on: true, locked: true },
  { id: "remind", label: "前日リマインド", desc: "訪問前日に時間をご連絡", icon: CalendarClock, on: true, locked: true },
  { id: "done", label: "作業完了・領収書", desc: "作業完了と領収書のご案内", icon: CheckCircle2, on: true, locked: true },
  { id: "coupon", label: "クーポン・お得情報", desc: "割引やキャンペーンのご案内", icon: Tag, on: true, locked: false },
  { id: "news", label: "お知らせ", desc: "新サービス・運営からのお知らせ", icon: Megaphone, on: false, locked: false },
];

export default function NotificationSettings() {
  const [ch, setCh] = useState<Record<string, boolean>>(Object.fromEntries(CHANNELS.map((c) => [c.id, c.on])));
  const [ty, setTy] = useState<Record<string, boolean>>(Object.fromEntries(TYPES.map((t) => [t.id, t.on])));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/mypage" className="rt-back"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">通知設定</div>
        </header>

        <div className="rt-sec-h">受け取り方法</div>
        <div className="rt-card">
          {CHANNELS.map((c) => { const Icon = c.icon; const on = ch[c.id]; return (
            <div className="rt-row" key={c.id}>
              <div className="rt-row-ico"><Icon size={20} strokeWidth={2.1} /></div>
              <div className="rt-row-body"><div className="rt-row-l">{c.label}</div><div className="rt-row-d">{c.desc}</div></div>
              <button className={"rt-toggle" + (on ? " on" : "")} onClick={() => setCh((p) => ({ ...p, [c.id]: !p[c.id] }))} aria-label={c.label}><span /></button>
            </div>
          ); })}
        </div>

        <div className="rt-sec-h">通知の種類</div>
        <div className="rt-card">
          {TYPES.map((t) => { const Icon = t.icon; const on = ty[t.id]; return (
            <div className="rt-row" key={t.id}>
              <div className="rt-row-ico"><Icon size={20} strokeWidth={2.1} /></div>
              <div className="rt-row-body">
                <div className="rt-row-l">{t.label}{t.locked && <span className="rt-lock">必須</span>}</div>
                <div className="rt-row-d">{t.desc}</div>
              </div>
              <button className={"rt-toggle" + (on ? " on" : "") + (t.locked ? " locked" : "")} onClick={() => !t.locked && setTy((p) => ({ ...p, [t.id]: !p[t.id] }))} disabled={t.locked} aria-label={t.label}><span /></button>
            </div>
          ); })}
        </div>
        <div className="rt-note">予約確認・リマインド・完了通知は、サービス提供に必要なためオフにできません。</div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-shell{min-height:100vh;}
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-sec-h{font-size:13px;font-weight:900;color:var(--ink-2);margin:18px 2px 10px;}
.rt-card{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--shadow);}
.rt-row{display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid var(--line);}
.rt-row:last-child{border-bottom:none;}
.rt-row-ico{flex:none;width:40px;height:40px;border-radius:11px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-row-body{flex:1;min-width:0;}
.rt-row-l{font-size:14px;font-weight:800;display:flex;align-items:center;gap:7px;}
.rt-lock{font-size:9.5px;font-weight:800;color:var(--ink-3);background:#EEF0F1;padding:2px 7px;border-radius:5px;}
.rt-row-d{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:2px;}
.rt-toggle{flex:none;width:48px;height:28px;border-radius:999px;border:none;background:#D7DADE;cursor:pointer;padding:0;position:relative;transition:background .2s;}
.rt-toggle.on{background:var(--red);}
.rt-toggle.locked{opacity:.55;cursor:not-allowed;}
.rt-toggle span{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.25);}
.rt-toggle.on span{transform:translateX(20px);}
.rt-note{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.6;margin:13px 2px 0;}
`;
