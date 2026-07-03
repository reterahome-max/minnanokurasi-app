"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Send, Plus, Check, CheckCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";

/**
 * RE:TERA HOME — メッセージ（スタッフとのチャット）
 * RETERA_Messages.jsx を移植。送信はローカル state のみ（Phase1：人対応想定）。
 */
type Msg = { from: "system" | "staff" | "me"; text: string; time: string; read?: boolean };

const INITIAL: Msg[] = [
  { from: "system", text: "壁掛けエアコンクリーニングのご予約ありがとうございます。担当の佐藤です。", time: "10:02" },
  { from: "staff", text: "7月3日（木）13:00〜15:00で承りました。当日はよろしくお願いいたします。", time: "10:02", read: true },
  { from: "me", text: "ありがとうございます。当日は駐車場がないのですが大丈夫でしょうか？", time: "10:15", read: true },
  { from: "staff", text: "ご安心ください。近隣のコインパーキングを利用します。料金は事前に想定額をご案内しますね。", time: "10:18", read: true },
];
const QUICK = ["日程を変更したい", "作業時間の目安は？", "追加オプションを相談", "領収書がほしい"];

export default function Messages() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = (t?: string) => {
    const v = (t ?? text).trim();
    if (!v) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMsgs((m) => [...m, { from: "me", text: v, time, read: false }]);
    setText("");
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

        <div className="rt-chat-banner">
          <div className="rt-chat-banner-bar" />
          <div>
            <div className="rt-chat-banner-t">壁掛けエアコンクリーニング × 2台</div>
            <div className="rt-chat-banner-d">7月3日（木）13:00〜15:00 ・ 予約確定</div>
          </div>
        </div>

        <div className="rt-chat-body">
          <div className="rt-chat-date">2026年6月29日</div>
          {msgs.map((m, i) => {
            if (m.from === "system") return <div className="rt-chat-sys" key={i}>{m.text}</div>;
            const mine = m.from === "me";
            return (
              <div className={"rt-row " + (mine ? "mine" : "theirs")} key={i}>
                {!mine && <div className="rt-bub-avatar">佐</div>}
                <div className="rt-bub-wrap">
                  <div className={"rt-bub " + (mine ? "bub-me" : "bub-them")}>{m.text}</div>
                  <div className="rt-bub-meta">
                    {mine && (m.read ? <CheckCheck size={13} strokeWidth={2.4} className="rt-read" /> : <Check size={13} strokeWidth={2.4} className="rt-sent" />)}
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

const styles = `
.rt-shell{padding:0;display:flex;flex-direction:column;height:100vh;}
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
