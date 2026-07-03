"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X, Check, AlertCircle, Mail, Lock, Eye, EyeOff, ChevronRight, MessageCircle, Apple,
  ShieldCheck, Clock, Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * RE:TERA HOME — ログイン（アップロード画像のデザインに準拠）
 * RETERA_Login.jsx を移植。白背景・認証専用ヘッダー（CSS家型ロゴ）。メール＋パスワード＋保存チェック。
 * LINE/Apple はボタンのみ（実連携は後日）。デザイン・文言は不変。
 */
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const TRUST = [
  { icon: ShieldCheck, t: "安心・安全", d: "SSL暗号化通信で\n情報を保護しています" },
  { icon: Clock, t: "簡単予約", d: "ログインで次回からの\n入力がスムーズに" },
  { icon: Heart, t: "予約履歴", d: "過去のご利用履歴を\nいつでも確認できます" },
];

export default function Login() {
  const router = useRouter();
  const { signIn, configured, user } = useAuth();
  const [f, setF] = useState({ email: "", pw: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: "err" | "info"; text: string } | null>(null);
  const [redirect, setRedirect] = useState("/");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("redirect");
    if (p) setRedirect(p);
  }, []);
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  const set = (k: "email" | "pw") => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const emailErr = touched.email && !emailOk(f.email) ? "正しいメールアドレスを入力してください" : "";
  const pwErr = touched.pw && f.pw.length < 8 ? "パスワードは8文字以上で入力してください" : "";
  const ready = emailOk(f.email) && f.pw.length >= 8;

  const friendlyError = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
      return "メールアドレスまたはパスワードが正しくありません。";
    if (code.includes("too-many-requests")) return "試行回数が多すぎます。しばらくしてからお試しください。";
    if (code.includes("unauthorized-domain")) return "このドメインは認証を許可されていません（管理者設定）。";
    return (e as Error)?.message ?? "エラーが発生しました。";
  };

  const handleLogin = async () => {
    if (!ready || submitting) return;
    setAuthMsg(null);
    if (!configured) {
      setAuthMsg({ type: "info", text: "認証は未設定です。Firebase キーを設定すると有効になります。" });
      return;
    }
    setSubmitting(true);
    try {
      await signIn(f.email, f.pw, remember);
      router.replace(redirect);
    } catch (e) {
      setAuthMsg({ type: "err", text: friendlyError(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = () => setAuthMsg({ type: "info", text: "LINE・Apple ログインは準備中です。メールでのご利用をお願いします。" });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-head">
          <button className="rt-close" onClick={() => router.push("/")} aria-label="閉じる"><X size={22} strokeWidth={2.4} /></button>
          <div className="rt-brand">
            <div className="rt-brand-mark"><span className="rt-brand-roof" /></div>
            <div><div className="rt-brand-name">RE:TERA HOME</div><div className="rt-brand-tag">ハウスクリーニング</div></div>
          </div>
          <div style={{ width: 22 }} />
        </header>

        <h1 className="rt-title">ログイン</h1>
        <p className="rt-lead">ご登録のメールアドレスとパスワードで<br />ログインしてください</p>

        <div className="rt-card">
          <div className="rt-field">
            <label className="rt-label">メールアドレス <span className="rt-req">必須</span></label>
            <div className="rt-input-wrap">
              <Mail size={17} strokeWidth={2} className="rt-in-ico" />
              <input className={"rt-input pad" + (emailErr ? " err" : "")} type="email" inputMode="email" value={f.email} onChange={set("email")} onBlur={blur("email")} placeholder="例）taro.yamada@example.com" />
            </div>
            {emailErr && <Er m={emailErr} />}
          </div>
          <div className="rt-field">
            <label className="rt-label">パスワード <span className="rt-req">必須</span></label>
            <div className="rt-input-wrap">
              <Lock size={17} strokeWidth={2} className="rt-in-ico" />
              <input className={"rt-input pad pw" + (pwErr ? " err" : "")} type={showPw ? "text" : "password"} value={f.pw} onChange={set("pw")} onBlur={blur("pw")} placeholder="パスワードを入力" />
              <button className="rt-eye" onClick={() => setShowPw((s) => !s)} aria-label="表示切替">{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {pwErr && <Er m={pwErr} />}
          </div>

          <div className="rt-row-between">
            <button className="rt-remember" onClick={() => setRemember((r) => !r)}>
              <div className={"rt-check" + (remember ? " on" : "")}>{remember && <Check size={12} strokeWidth={3} color="#fff" />}</div>
              パスワードを保存する
            </button>
            <Link href="/login/reset" className="rt-forgot">パスワードをお忘れの方はこちら <ChevronRight size={13} strokeWidth={2.6} /></Link>
          </div>
        </div>

        {authMsg && (
          <div className={"rt-auth-msg" + (authMsg.type === "err" ? " err" : " info")}>
            <AlertCircle size={14} strokeWidth={2.4} />{authMsg.text}
          </div>
        )}

        <button className={"rt-primary" + (ready ? "" : " off")} disabled={!ready || submitting} onClick={handleLogin}>ログイン<ChevronRight size={18} strokeWidth={2.6} /></button>

        <div className="rt-or"><span>または</span></div>

        <button className="rt-social" onClick={handleSocial}><span className="rt-line-ico"><MessageCircle size={15} strokeWidth={2.4} color="#fff" /></span>LINEでログイン</button>
        <button className="rt-social" onClick={handleSocial}><Apple size={19} strokeWidth={0} fill="#1B1B1D" />Appleでログイン</button>

        <div className="rt-trust">
          {TRUST.map((t, i) => { const Icon = t.icon; return (
            <div className="rt-trust-item" key={i}>
              <div className="rt-trust-ico"><Icon size={22} strokeWidth={2} /></div>
              <div className="rt-trust-t">{t.t}</div>
              <div className="rt-trust-d">{t.d}</div>
            </div>
          ); })}
        </div>

        <div className="rt-foot">アカウントをお持ちでない方は <Link href="/signup" className="rt-foot-link">新規登録はこちら <ChevronRight size={13} strokeWidth={2.6} /></Link></div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

function Er({ m }: { m: string }) { return <div className="rt-err"><AlertCircle size={12} strokeWidth={2.4} />{m}</div>; }

const styles = `
.rt-shell{max-width:480px;margin:0 auto;background:#fff;padding:0 20px 24px;color:var(--ink);font-family:"Hiragino Sans","Noto Sans JP",system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
@media(min-width:480px){.rt-shell{border-left:1px solid var(--line);border-right:1px solid var(--line);}}
.rt-head{display:flex;align-items:center;gap:10px;padding:16px 0 18px;}
.rt-close{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-brand{display:flex;align-items:center;gap:8px;flex:1;}
.rt-brand-mark{width:32px;height:32px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex:none;position:relative;}
.rt-brand-roof{width:15px;height:15px;border:2.4px solid #fff;border-radius:3px 3px 0 0;position:relative;}
.rt-brand-roof::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:6px solid #fff;}
.rt-brand-name{font-size:16px;font-weight:900;letter-spacing:.04em;line-height:1.05;}
.rt-brand-tag{font-size:9.5px;color:var(--ink-2);font-weight:600;letter-spacing:.14em;margin-top:2px;}
.rt-title{font-size:26px;font-weight:900;margin:0 0 6px;text-align:center;}
.rt-lead{font-size:13px;color:var(--ink-2);font-weight:600;margin:0 0 22px;line-height:1.6;text-align:center;}
.rt-card{display:flex;flex-direction:column;gap:18px;}
.rt-field{display:flex;flex-direction:column;gap:8px;}
.rt-label{font-size:13px;font-weight:800;}
.rt-req{font-size:10px;font-weight:800;color:var(--red);margin-left:4px;}
.rt-input-wrap{position:relative;display:flex;align-items:center;}
.rt-in-ico{position:absolute;left:13px;color:var(--ink-3);pointer-events:none;}
.rt-input{width:100%;background:#fff;border:1px solid #DDE0E3;border-radius:11px;padding:14px 13px;font-size:14px;color:var(--ink);outline:none;font-family:inherit;}
.rt-input.pad{padding-left:40px;}
.rt-input.pw{padding-right:44px;}
.rt-input:focus{border-color:var(--red);}
.rt-input.err{border-color:var(--err);background:#FDF3F2;}
.rt-input::placeholder{color:var(--ink-3);}
.rt-eye{position:absolute;right:10px;background:none;border:none;color:var(--ink-3);cursor:pointer;display:flex;padding:4px;}
.rt-err{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--err);}
.rt-err svg{flex:none;}
.rt-row-between{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.rt-remember{display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;font-size:12.5px;font-weight:700;color:var(--ink-2);padding:0;}
.rt-check{width:20px;height:20px;border-radius:5px;border:1.5px solid #CFD3D7;background:#fff;display:flex;align-items:center;justify-content:center;flex:none;}
.rt-check.on{background:var(--red);border-color:var(--red);}
.rt-forgot{background:none;border:none;color:var(--red);font-size:12px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:2px;padding:0;text-decoration:none;}
.rt-auth-msg{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--err);background:#FDF3F2;border:1px solid #F3D3D1;border-radius:11px;padding:11px 12px;margin-top:16px;line-height:1.5;}
.rt-auth-msg svg{flex:none;}
.rt-auth-msg.info{color:var(--ink-2);background:var(--red-soft-2);border-color:var(--line);}
.rt-primary{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;margin-top:22px;}
.rt-primary:hover{background:var(--red-deep);}
.rt-primary.off{background:#C8CCD0;cursor:not-allowed;}
.rt-or{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--ink-3);}
.rt-or::before,.rt-or::after{content:"";flex:1;height:1px;background:var(--line);}
.rt-or span{font-size:12px;font-weight:700;}
.rt-social{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:#fff;border:1.5px solid #DDE0E3;border-radius:12px;padding:14px;font-size:15px;font-weight:800;color:var(--ink);cursor:pointer;margin-bottom:10px;}
.rt-line-ico{width:22px;height:22px;border-radius:6px;background:var(--line-green);display:flex;align-items:center;justify-content:center;}
.rt-trust{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;background:var(--red-soft-2);border-radius:14px;padding:18px 10px;margin:20px 0 16px;}
.rt-trust-item{text-align:center;}
.rt-trust-ico{color:var(--red);display:flex;justify-content:center;margin-bottom:7px;}
.rt-trust-t{font-size:12px;font-weight:900;margin-bottom:4px;}
.rt-trust-d{font-size:9.5px;color:var(--ink-2);font-weight:600;line-height:1.5;white-space:pre-line;}
.rt-foot{text-align:center;font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:6px;}
.rt-foot-link{background:none;border:none;color:var(--red);font-size:12.5px;font-weight:800;cursor:pointer;padding:0 2px;display:inline-flex;align-items:center;gap:2px;text-decoration:none;}
`;
