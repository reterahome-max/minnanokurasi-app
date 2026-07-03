"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, MessageCircle, Mail, Eye, EyeOff, ChevronRight, AlertCircle, Check, User, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * RE:TERA HOME — ログイン / 新規登録
 * RETERA_Auth.jsx を移植。メール＋パスワードを Firebase Auth に接続。
 * LINE ログインは遷移プレースホルダー（OIDC 実連携は後日）。ゲスト予約は許可。
 */
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Auth() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, configured, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ name: "", email: "", pw: "", agree: false });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: "err" | "info"; text: string } | null>(null);
  const [redirect, setRedirect] = useState("/");

  // ?redirect= を取得（ガードからの遷移先）。ログイン済みなら自動遷移。
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("redirect");
    if (p) setRedirect(p);
  }, []);
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  const set = (k: "name" | "email" | "pw") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const emailErr = touched.email && !emailOk(f.email) ? "正しいメールアドレスを入力してください" : "";
  const pwErr = touched.pw && f.pw.length < 8 ? "パスワードは8文字以上で入力してください" : "";
  const nameErr = mode === "signup" && touched.name && !f.name.trim() ? "お名前を入力してください" : "";

  const ready = mode === "login"
    ? emailOk(f.email) && f.pw.length >= 8
    : Boolean(f.name.trim()) && emailOk(f.email) && f.pw.length >= 8 && f.agree;

  const friendlyError = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
      return "メールアドレスまたはパスワードが正しくありません。";
    if (code.includes("email-already-in-use")) return "このメールアドレスは既に登録されています。";
    if (code.includes("weak-password")) return "パスワードは8文字以上で設定してください。";
    if (code.includes("too-many-requests")) return "試行回数が多すぎます。しばらくしてからお試しください。";
    return (e as Error)?.message ?? "エラーが発生しました。";
  };

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setAuthMsg(null);
    if (!configured) {
      setAuthMsg({ type: "info", text: "認証は未設定です。Firebase キーを設定すると有効になります。" });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") await signIn(f.email, f.pw);
      else await signUp(f.name, f.email, f.pw);
      router.replace(redirect);
    } catch (e) {
      setAuthMsg({ type: "err", text: friendlyError(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLine = () => {
    // OIDC 実連携は後日。今は遷移プレースホルダー。
    setAuthMsg({ type: "info", text: "LINEログインは準備中です。メールでのご利用をお願いします。" });
  };

  const handleForgot = async () => {
    setAuthMsg(null);
    if (!emailOk(f.email)) {
      setTouched((t) => ({ ...t, email: true }));
      setAuthMsg({ type: "err", text: "先にメールアドレスを入力してください。" });
      return;
    }
    if (!configured) {
      setAuthMsg({ type: "info", text: "認証は未設定です。Firebase キーを設定すると有効になります。" });
      return;
    }
    try {
      await resetPassword(f.email);
      setAuthMsg({ type: "info", text: "パスワード再設定メールを送信しました。" });
    } catch (e) {
      setAuthMsg({ type: "err", text: friendlyError(e) });
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        {/* ブランド */}
        <div className="rt-brand-head">
          <div className="rt-logo"><Home size={26} strokeWidth={2.5} /></div>
          <div className="rt-logo-name">RE:TERA HOME</div>
          <div className="rt-logo-tag">越谷・春日部のハウスクリーニング</div>
        </div>

        {/* タブ */}
        <div className="rt-tabs">
          <button className={"rt-tab" + (mode === "login" ? " on" : "")} onClick={() => { setMode("login"); setTouched({}); setAuthMsg(null); }}>ログイン</button>
          <button className={"rt-tab" + (mode === "signup" ? " on" : "")} onClick={() => { setMode("signup"); setTouched({}); setAuthMsg(null); }}>新規登録</button>
        </div>

        {/* LINE（主役） */}
        <button className="rt-line-btn" onClick={handleLine}><MessageCircle size={20} strokeWidth={2.3} />LINEで{mode === "login" ? "ログイン" : "登録"}</button>
        <div className="rt-line-note">いつもの予約・連絡をLINEでまとめて受け取れます</div>

        <div className="rt-divider"><span>または{mode === "login" ? "メールでログイン" : "メールで登録"}</span></div>

        {/* フォーム */}
        <div className="rt-fields">
          {mode === "signup" && (
            <div className="rt-field">
              <label className="rt-field-l">お名前</label>
              <div className="rt-input-wrap">
                <User size={18} strokeWidth={2} className="rt-input-ico" />
                <input className={"rt-input" + (nameErr ? " err" : "")} value={f.name} onChange={set("name")} onBlur={blur("name")} placeholder="山田 花子" />
              </div>
              {nameErr && <Err msg={nameErr} />}
            </div>
          )}
          <div className="rt-field">
            <label className="rt-field-l">メールアドレス</label>
            <div className="rt-input-wrap">
              <Mail size={18} strokeWidth={2} className="rt-input-ico" />
              <input className={"rt-input" + (emailErr ? " err" : "")} type="email" inputMode="email" value={f.email} onChange={set("email")} onBlur={blur("email")} placeholder="example@email.com" />
            </div>
            {emailErr && <Err msg={emailErr} />}
          </div>
          <div className="rt-field">
            <label className="rt-field-l">パスワード</label>
            <div className="rt-input-wrap">
              <input className={"rt-input pw" + (pwErr ? " err" : "")} type={showPw ? "text" : "password"} value={f.pw} onChange={set("pw")} onBlur={blur("pw")} placeholder="8文字以上" />
              <button className="rt-eye" onClick={() => setShowPw((s) => !s)} aria-label="パスワード表示切替">{showPw ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}</button>
            </div>
            {pwErr && <Err msg={pwErr} />}
          </div>
        </div>

        {mode === "login" && <button className="rt-forgot" onClick={handleForgot}>パスワードをお忘れですか？</button>}

        {mode === "signup" && (
          <button className="rt-agree" onClick={() => setF((p) => ({ ...p, agree: !p.agree }))}>
            <div className={"rt-check" + (f.agree ? " on" : "")}>{f.agree && <Check size={13} strokeWidth={3} />}</div>
            <div className="rt-agree-t"><b>利用規約</b>・<b>プライバシーポリシー</b>に同意します。</div>
          </button>
        )}

        {authMsg && (
          <div className={"rt-auth-msg" + (authMsg.type === "err" ? " err" : "")}>
            <AlertCircle size={14} strokeWidth={2.4} />{authMsg.text}
          </div>
        )}

        <button className={"rt-submit" + (ready ? "" : " off")} disabled={!ready || submitting} onClick={handleSubmit}>
          {mode === "login" ? "ログイン" : "登録して始める"}<ChevronRight size={18} strokeWidth={2.6} />
        </button>

        {/* ゲスト */}
        <button className="rt-guest" onClick={() => router.push("/simulator")}>登録せずに予約する（ゲスト）<ArrowRight size={15} strokeWidth={2.4} /></button>

        <div className="rt-foot">
          {mode === "login" ? (
            <>アカウントをお持ちでない方は <button className="rt-foot-link" onClick={() => { setMode("signup"); setAuthMsg(null); }}>新規登録</button></>
          ) : (
            <>すでにアカウントをお持ちの方は <button className="rt-foot-link" onClick={() => { setMode("login"); setAuthMsg(null); }}>ログイン</button></>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return <div className="rt-err"><AlertCircle size={13} strokeWidth={2.4} />{msg}</div>;
}

const styles = `
.rt-shell{padding:0 22px 28px;min-height:100vh;}
.rt-brand-head{text-align:center;padding:46px 0 28px;}
.rt-logo{width:60px;height:60px;border-radius:16px;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 6px 16px rgba(201,53,46,.25);}
.rt-logo-name{font-size:22px;font-weight:900;letter-spacing:.04em;}
.rt-logo-tag{font-size:12px;color:var(--ink-2);font-weight:600;margin-top:5px;}
.rt-tabs{display:flex;background:#fff;border:1px solid var(--line);border-radius:13px;padding:5px;margin-bottom:22px;}
.rt-tab{flex:1;background:none;border:none;border-radius:9px;padding:12px;font-size:14px;font-weight:800;color:var(--ink-3);cursor:pointer;transition:all .15s;}
.rt-tab.on{background:var(--red);color:#fff;}
.rt-line-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--line-green);color:#fff;border:none;border-radius:13px;padding:15px;font-size:16px;font-weight:900;cursor:pointer;box-shadow:var(--shadow);}
.rt-line-note{font-size:11px;color:var(--ink-2);font-weight:600;text-align:center;margin-top:9px;}
.rt-divider{display:flex;align-items:center;gap:12px;margin:22px 0;color:var(--ink-3);}
.rt-divider::before,.rt-divider::after{content:"";flex:1;height:1px;background:var(--line);}
.rt-divider span{font-size:11.5px;font-weight:700;white-space:nowrap;}
.rt-fields{display:flex;flex-direction:column;gap:15px;}
.rt-field{display:flex;flex-direction:column;gap:6px;}
.rt-field-l{font-size:12.5px;font-weight:800;color:var(--ink-2);}
.rt-input-wrap{position:relative;display:flex;align-items:center;}
.rt-input-ico{position:absolute;left:13px;color:var(--ink-3);pointer-events:none;}
.rt-input{width:100%;background:#fff;border:1px solid var(--line);border-radius:11px;padding:14px 14px 14px 42px;font-size:14px;color:var(--ink);outline:none;font-family:inherit;}
.rt-input.pw{padding-left:14px;padding-right:46px;}
.rt-input:focus{border-color:var(--red);}
.rt-input.err{border-color:var(--err);background:#FDF3F2;}
.rt-input::placeholder{color:var(--ink-3);}
.rt-eye{position:absolute;right:8px;width:34px;height:34px;border:none;background:none;color:var(--ink-3);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-err{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--err);}
.rt-err svg{flex:none;}
.rt-forgot{display:block;margin:13px 0 0 auto;background:none;border:none;color:var(--red);font-size:12.5px;font-weight:700;cursor:pointer;padding:2px;}
.rt-agree{width:100%;display:flex;align-items:flex-start;gap:9px;background:none;border:none;cursor:pointer;text-align:left;margin-top:16px;}
.rt-check{flex:none;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:center;color:#fff;}
.rt-check.on{background:var(--red);border-color:var(--red);}
.rt-agree-t{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-agree-t b{color:var(--red);}
.rt-auth-msg{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--ink-2);background:var(--red-soft-2);border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin-top:16px;line-height:1.5;}
.rt-auth-msg svg{flex:none;color:var(--ink-3);}
.rt-auth-msg.err{color:var(--err);background:#FDF3F2;border-color:#F3D3D1;}
.rt-auth-msg.err svg{color:var(--err);}
.rt-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;margin-top:20px;box-shadow:var(--shadow);}
.rt-submit:hover{background:var(--red-deep);}
.rt-submit.off{background:#C8CCD0;cursor:not-allowed;box-shadow:none;}
.rt-guest{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;background:none;border:none;color:var(--ink-2);font-size:13.5px;font-weight:800;cursor:pointer;padding:16px;margin-top:6px;}
.rt-foot{text-align:center;font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:8px;}
.rt-foot-link{background:none;border:none;color:var(--red);font-size:12.5px;font-weight:800;cursor:pointer;padding:0 2px;}
`;
