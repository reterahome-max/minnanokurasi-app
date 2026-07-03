"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, AlertCircle, Check, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * RE:TERA HOME — パスワード再設定（/login/reset）
 * メール宛に Firebase の再設定リンクを送る簡易版。デザインはログイン画面に準拠（白背景）。
 */
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function PasswordReset() {
  const router = useRouter();
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: "err" | "info"; text: string } | null>(null);

  const emailErr = touched && !emailOk(email) ? "正しいメールアドレスを入力してください" : "";
  const ready = emailOk(email);

  const handleSend = async () => {
    if (!ready || submitting) return;
    setAuthMsg(null);
    if (!configured) { setAuthMsg({ type: "info", text: "認証は未設定です。Firebase キーを設定すると有効になります。" }); return; }
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      setAuthMsg({ type: "err", text: code.includes("user-not-found") ? "このメールアドレスの登録が見つかりません。" : "送信に失敗しました。時間をおいてお試しください。" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-head">
          <button className="rt-back" onClick={() => router.push("/login")} aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-brand">
            <div className="rt-brand-mark"><span className="rt-brand-roof" /></div>
            <div><div className="rt-brand-name">RE:TERA HOME</div><div className="rt-brand-tag">ハウスクリーニング</div></div>
          </div>
          <div style={{ width: 22 }} />
        </header>

        <h1 className="rt-title">パスワード再設定</h1>

        {sent ? (
          <>
            <div className="rt-sent">
              <div className="rt-sent-ico"><Check size={30} strokeWidth={3} /></div>
              <p className="rt-lead">再設定用のメールを送信しました。<br />メール内のリンクからパスワードを再設定してください。</p>
            </div>
            <Link href="/login" className="rt-primary">ログインへ戻る</Link>
          </>
        ) : (
          <>
            <p className="rt-lead">ご登録のメールアドレスを入力してください。<br />再設定用のリンクをお送りします。</p>
            <div className="rt-field">
              <label className="rt-label">メールアドレス <span className="rt-req">必須</span></label>
              <div className="rt-input-wrap">
                <Mail size={17} strokeWidth={2} className="rt-in-ico" />
                <input className={"rt-input pad" + (emailErr ? " err" : "")} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} placeholder="例）taro.yamada@example.com" />
              </div>
              {emailErr && <div className="rt-err"><AlertCircle size={12} strokeWidth={2.4} />{emailErr}</div>}
            </div>

            {authMsg && <div className={"rt-auth-msg" + (authMsg.type === "err" ? " err" : " info")}><AlertCircle size={14} strokeWidth={2.4} />{authMsg.text}</div>}

            <button className={"rt-primary" + (ready ? "" : " off")} disabled={!ready || submitting} onClick={handleSend}>再設定メールを送信<ChevronRight size={18} strokeWidth={2.6} /></button>
            <div className="rt-foot"><Link href="/login" className="rt-foot-link">ログインへ戻る</Link></div>
          </>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-shell{max-width:480px;margin:0 auto;background:#fff;padding:0 20px 24px;color:var(--ink);font-family:"Hiragino Sans","Noto Sans JP",system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
@media(min-width:480px){.rt-shell{border-left:1px solid var(--line);border-right:1px solid var(--line);}}
.rt-head{display:flex;align-items:center;gap:10px;padding:16px 0 18px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-brand{display:flex;align-items:center;gap:8px;flex:1;}
.rt-brand-mark{width:32px;height:32px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex:none;position:relative;}
.rt-brand-roof{width:15px;height:15px;border:2.4px solid #fff;border-radius:3px 3px 0 0;position:relative;}
.rt-brand-roof::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:6px solid #fff;}
.rt-brand-name{font-size:16px;font-weight:900;letter-spacing:.04em;line-height:1.05;}
.rt-brand-tag{font-size:9.5px;color:var(--ink-2);font-weight:600;letter-spacing:.14em;margin-top:2px;}
.rt-title{font-size:26px;font-weight:900;margin:0 0 6px;text-align:center;}
.rt-lead{font-size:13px;color:var(--ink-2);font-weight:600;margin:0 0 22px;line-height:1.6;text-align:center;}
.rt-field{display:flex;flex-direction:column;gap:8px;margin-bottom:8px;}
.rt-label{font-size:13px;font-weight:800;}
.rt-req{font-size:10px;font-weight:800;color:var(--red);margin-left:4px;}
.rt-input-wrap{position:relative;display:flex;align-items:center;}
.rt-in-ico{position:absolute;left:13px;color:var(--ink-3);pointer-events:none;}
.rt-input{width:100%;background:#fff;border:1px solid #DDE0E3;border-radius:11px;padding:14px 13px;font-size:14px;color:var(--ink);outline:none;font-family:inherit;}
.rt-input.pad{padding-left:40px;}
.rt-input:focus{border-color:var(--red);}
.rt-input.err{border-color:var(--err);background:#FDF3F2;}
.rt-input::placeholder{color:var(--ink-3);}
.rt-err{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--err);}
.rt-err svg{flex:none;}
.rt-auth-msg{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--err);background:#FDF3F2;border:1px solid #F3D3D1;border-radius:11px;padding:11px 12px;margin:16px 0 0;line-height:1.5;}
.rt-auth-msg svg{flex:none;}
.rt-auth-msg.info{color:var(--ink-2);background:var(--red-soft-2);border-color:var(--line);}
.rt-primary{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;margin-top:22px;text-decoration:none;}
.rt-primary:hover{background:var(--red-deep);}
.rt-primary.off{background:#C8CCD0;cursor:not-allowed;}
.rt-sent{text-align:center;padding:8px 0 4px;}
.rt-sent-ico{width:72px;height:72px;border-radius:50%;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
.rt-foot{text-align:center;font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:14px;}
.rt-foot-link{background:none;border:none;color:var(--red);font-size:12.5px;font-weight:800;cursor:pointer;padding:0 2px;text-decoration:none;}
`;
