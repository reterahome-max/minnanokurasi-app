"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, AlertCircle, Phone, Mail, Lock, Eye, EyeOff, ChevronRight, MessageCircle, Apple, Home, User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * RE:TERA HOME — 新規登録（アップロード画像のデザインに準拠）
 * RETERA_Signup.jsx を移植。姓名・ふりがな分割＋電話＋メール＋パスワード。
 * ステップ：情報入力(1) → 確認(2) → 完了(3)。ステップ2で Firebase 登録＋Firestore users 保存。
 * ソーシャルは LINE/Apple（ボタンのみ）。デザイン・文言は不変。
 */
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const telOk = (v: string) => /^0\d{9,10}$/.test(v.replace(/[-\s]/g, ""));
const pwOk = (v: string) => v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v);

export default function Signup() {
  const router = useRouter();
  const { register, configured } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState({ sei: "", mei: "", seiKana: "", meiKana: "", tel: "", email: "", pw: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: "err" | "info"; text: string } | null>(null);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const err = {
    sei: touched.sei && !f.sei.trim() ? "姓を入力してください" : "",
    mei: touched.mei && !f.mei.trim() ? "名を入力してください" : "",
    seiKana: touched.seiKana && !f.seiKana.trim() ? "せいを入力してください" : "",
    meiKana: touched.meiKana && !f.meiKana.trim() ? "めいを入力してください" : "",
    tel: touched.tel && !telOk(f.tel) ? "正しい電話番号を入力してください" : "",
    email: touched.email && !emailOk(f.email) ? "正しいメールアドレスを入力してください" : "",
    pw: touched.pw && !pwOk(f.pw) ? "半角英数字を含む8文字以上で入力してください" : "",
  };
  const ready = Boolean(f.sei.trim() && f.mei.trim() && f.seiKana.trim() && f.meiKana.trim() && telOk(f.tel) && emailOk(f.email) && pwOk(f.pw));

  const friendlyError = (e: unknown) => {
    const code = (e as { code?: string })?.code ?? "";
    if (code.includes("email-already-in-use")) return "このメールアドレスは既に登録されています。";
    if (code.includes("weak-password")) return "パスワードは半角英数字を含む8文字以上で設定してください。";
    if (code.includes("invalid-email")) return "メールアドレスの形式が正しくありません。";
    if (code.includes("unauthorized-domain")) return "このドメインは認証を許可されていません（管理者設定）。";
    return (e as Error)?.message ?? "登録に失敗しました。";
  };

  const toConfirm = () => {
    setTouched({ sei: true, mei: true, seiKana: true, meiKana: true, tel: true, email: true, pw: true });
    if (ready) { setAuthMsg(null); setStep(2); }
  };

  const handleRegister = async () => {
    if (submitting) return;
    setAuthMsg(null);
    if (!configured) { setAuthMsg({ type: "info", text: "認証は未設定です。Firebase キーを設定すると有効になります。" }); return; }
    setSubmitting(true);
    try {
      await register(f);
      setStep(3);
    } catch (e) {
      setAuthMsg({ type: "err", text: friendlyError(e) });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = () => setAuthMsg({ type: "info", text: "LINE・Apple 登録は準備中です。メールでのご登録をお願いします。" });

  const stepClass = (n: number) => (step > n ? " done" : step === n ? " on" : "");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-head">
          <button className="rt-back" onClick={() => (step === 2 ? setStep(1) : router.push("/login"))} aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-brand">
            <div className="rt-brand-mark"><span className="rt-brand-roof" /></div>
            <div><div className="rt-brand-name">RE:TERA HOME</div><div className="rt-brand-tag">ハウスクリーニング</div></div>
          </div>
          <div style={{ width: 22 }} />
        </header>

        <h1 className="rt-title">新規登録</h1>
        <p className="rt-lead">{step === 3 ? "ご登録ありがとうございます" : "はじめにお客様情報をご登録ください"}</p>

        {/* ステップ */}
        <div className="rt-steps">
          <div className="rt-step"><div className={"rt-step-n" + stepClass(1)}>{step > 1 ? <Check size={13} strokeWidth={3} /> : 1}</div><div className={"rt-step-l" + stepClass(1)}>情報入力</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className={"rt-step-n" + stepClass(2)}>{step > 2 ? <Check size={13} strokeWidth={3} /> : 2}</div><div className={"rt-step-l" + stepClass(2)}>確認</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className={"rt-step-n" + stepClass(3)}>3</div><div className={"rt-step-l" + stepClass(3)}>完了</div></div>
        </div>

        {step === 1 && (
          <>
            <div className="rt-card">
              <div className="rt-field">
                <label className="rt-label">お名前 <span className="rt-req">必須</span></label>
                <div className="rt-row2">
                  <div className="rt-half">
                    <input className={"rt-input" + (err.sei ? " err" : "")} value={f.sei} onChange={set("sei")} onBlur={blur("sei")} placeholder="姓（例：山田）" />
                    {err.sei && <Er m={err.sei} />}
                  </div>
                  <div className="rt-half">
                    <input className={"rt-input" + (err.mei ? " err" : "")} value={f.mei} onChange={set("mei")} onBlur={blur("mei")} placeholder="名（例：太郎）" />
                    {err.mei && <Er m={err.mei} />}
                  </div>
                </div>
              </div>
              <div className="rt-field">
                <label className="rt-label">ふりがな <span className="rt-req">必須</span></label>
                <div className="rt-row2">
                  <div className="rt-half">
                    <input className={"rt-input" + (err.seiKana ? " err" : "")} value={f.seiKana} onChange={set("seiKana")} onBlur={blur("seiKana")} placeholder="せい（例：やまだ）" />
                    {err.seiKana && <Er m={err.seiKana} />}
                  </div>
                  <div className="rt-half">
                    <input className={"rt-input" + (err.meiKana ? " err" : "")} value={f.meiKana} onChange={set("meiKana")} onBlur={blur("meiKana")} placeholder="めい（例：たろう）" />
                    {err.meiKana && <Er m={err.meiKana} />}
                  </div>
                </div>
              </div>
              <div className="rt-field">
                <label className="rt-label">電話番号 <span className="rt-req">必須</span></label>
                <div className="rt-input-wrap">
                  <Phone size={17} strokeWidth={2} className="rt-in-ico" />
                  <input className={"rt-input pad" + (err.tel ? " err" : "")} type="tel" inputMode="tel" value={f.tel} onChange={set("tel")} onBlur={blur("tel")} placeholder="例）090-1234-5678" />
                </div>
                {err.tel && <Er m={err.tel} />}
              </div>
              <div className="rt-field">
                <label className="rt-label">メールアドレス <span className="rt-req">必須</span></label>
                <div className="rt-input-wrap">
                  <Mail size={17} strokeWidth={2} className="rt-in-ico" />
                  <input className={"rt-input pad" + (err.email ? " err" : "")} type="email" inputMode="email" value={f.email} onChange={set("email")} onBlur={blur("email")} placeholder="例）taro.yamada@example.com" />
                </div>
                {err.email && <Er m={err.email} />}
              </div>
              <div className="rt-field">
                <label className="rt-label">パスワード <span className="rt-req">必須</span></label>
                <div className="rt-input-wrap">
                  <Lock size={17} strokeWidth={2} className="rt-in-ico" />
                  <input className={"rt-input pad pw" + (err.pw ? " err" : "")} type={showPw ? "text" : "password"} value={f.pw} onChange={set("pw")} onBlur={blur("pw")} placeholder="8文字以上の半角英数字" />
                  <button className="rt-eye" onClick={() => setShowPw((s) => !s)} aria-label="表示切替">{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                {err.pw ? <Er m={err.pw} /> : <div className="rt-ok-note"><Check size={12} strokeWidth={3} />半角英数字を含む8文字以上で入力してください</div>}
              </div>
            </div>

            <p className="rt-agree-txt">「登録する」をタップすることで、<b>利用規約</b>と<b>プライバシーポリシー</b>に同意したものとみなします。</p>

            {authMsg && <div className={"rt-auth-msg" + (authMsg.type === "err" ? " err" : " info")}><AlertCircle size={14} strokeWidth={2.4} />{authMsg.text}</div>}

            <button className={"rt-primary" + (ready ? "" : " off")} disabled={!ready} onClick={toConfirm}>確認画面へ進む<ChevronRight size={18} strokeWidth={2.6} /></button>

            <div className="rt-or"><span>または</span></div>

            <button className="rt-social" onClick={handleSocial}><span className="rt-line-ico"><MessageCircle size={15} strokeWidth={2.4} color="#fff" /></span>LINEで登録する</button>
            <button className="rt-social" onClick={handleSocial}><Apple size={19} strokeWidth={0} fill="#1B1B1D" />Appleで登録する</button>

            <div className="rt-foot">すでにアカウントをお持ちの方は <Link href="/login" className="rt-foot-link">ログインはこちら</Link></div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rt-card">
              <div className="rt-confirm">
                <div className="rt-confirm-row"><div className="rt-confirm-k">お名前</div><div className="rt-confirm-v">{f.sei} {f.mei}</div></div>
                <div className="rt-confirm-row"><div className="rt-confirm-k">ふりがな</div><div className="rt-confirm-v">{f.seiKana} {f.meiKana}</div></div>
                <div className="rt-confirm-row"><div className="rt-confirm-k">電話番号</div><div className="rt-confirm-v">{f.tel}</div></div>
                <div className="rt-confirm-row"><div className="rt-confirm-k">メールアドレス</div><div className="rt-confirm-v">{f.email}</div></div>
                <div className="rt-confirm-row"><div className="rt-confirm-k">パスワード</div><div className="rt-confirm-v">{"•".repeat(Math.min(f.pw.length, 12))}</div></div>
              </div>
            </div>

            {authMsg && <div className={"rt-auth-msg" + (authMsg.type === "err" ? " err" : " info")}><AlertCircle size={14} strokeWidth={2.4} />{authMsg.text}</div>}

            <button className="rt-primary" disabled={submitting} onClick={handleRegister}>この内容で登録する<ChevronRight size={18} strokeWidth={2.6} /></button>
            <button className="rt-secondary" onClick={() => setStep(1)}>修正する</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="rt-done-wrap">
              <div className="rt-done-ring"><div className="rt-done-circle"><Check size={34} strokeWidth={3} /></div></div>
              <h2 className="rt-done-t">登録が完了しました</h2>
              <p className="rt-done-d">ようこそ、{f.sei} {f.mei} さん<br />ご登録ありがとうございます。</p>
            </div>
            <Link href="/" className="rt-primary as-link"><Home size={18} strokeWidth={2.3} />ホームへ</Link>
            <Link href="/mypage" className="rt-secondary as-link"><User size={17} strokeWidth={2.2} />マイページへ</Link>
          </>
        )}

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
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-brand{display:flex;align-items:center;gap:8px;flex:1;}
.rt-brand-mark{width:32px;height:32px;border-radius:8px;background:var(--red);display:flex;align-items:center;justify-content:center;flex:none;position:relative;}
.rt-brand-roof{width:15px;height:15px;border:2.4px solid #fff;border-radius:3px 3px 0 0;position:relative;}
.rt-brand-roof::after{content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:6px solid #fff;}
.rt-brand-name{font-size:16px;font-weight:900;letter-spacing:.04em;line-height:1.05;}
.rt-brand-tag{font-size:9.5px;color:var(--ink-2);font-weight:600;letter-spacing:.14em;margin-top:2px;}
.rt-title{font-size:26px;font-weight:900;margin:0 0 6px;text-align:center;}
.rt-lead{font-size:13px;color:var(--ink-2);font-weight:600;margin:0 0 22px;text-align:center;}
.rt-steps{display:flex;align-items:center;padding:0 8px 24px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:28px;height:28px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-n.done{background:var(--red);color:#fff;}
.rt-step-l{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--red);}
.rt-step-l.done{color:var(--red);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 6px 22px;border-top:2px dashed #D7DADE;height:0;background:none;}
.rt-card{border-top:1px solid var(--line);padding-top:20px;display:flex;flex-direction:column;gap:18px;}
.rt-field{display:flex;flex-direction:column;gap:8px;}
.rt-label{font-size:13px;font-weight:800;}
.rt-req{font-size:10px;font-weight:800;color:var(--red);margin-left:4px;}
.rt-row2{display:flex;gap:10px;}
.rt-half{flex:1;display:flex;flex-direction:column;gap:5px;}
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
.rt-ok-note{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-ok-note svg{color:var(--red);flex:none;}
.rt-agree-txt{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.7;margin:18px 0;}
.rt-agree-txt b{color:var(--red);}
.rt-auth-msg{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--err);background:#FDF3F2;border:1px solid #F3D3D1;border-radius:11px;padding:11px 12px;margin:0 0 16px;line-height:1.5;}
.rt-auth-msg svg{flex:none;}
.rt-auth-msg.info{color:var(--ink-2);background:var(--red-soft-2);border-color:var(--line);}
.rt-primary{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;text-decoration:none;}
.rt-primary:hover{background:var(--red-deep);}
.rt-primary.off{background:#C8CCD0;cursor:not-allowed;}
.rt-primary.as-link{margin-bottom:10px;}
.rt-secondary{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border:1.5px solid #DDE0E3;color:var(--ink);border-radius:12px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;margin-top:10px;text-decoration:none;}
.rt-secondary.as-link{margin-top:0;}
.rt-or{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--ink-3);}
.rt-or::before,.rt-or::after{content:"";flex:1;height:1px;background:var(--line);}
.rt-or span{font-size:12px;font-weight:700;}
.rt-social{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:#fff;border:1.5px solid #DDE0E3;border-radius:12px;padding:14px;font-size:15px;font-weight:800;color:var(--ink);cursor:pointer;margin-bottom:10px;}
.rt-line-ico{width:22px;height:22px;border-radius:6px;background:var(--line-green);display:flex;align-items:center;justify-content:center;}
.rt-foot{text-align:center;font-size:12.5px;color:var(--ink-2);font-weight:600;margin-top:10px;}
.rt-foot-link{background:none;border:none;color:var(--red);font-size:12.5px;font-weight:800;cursor:pointer;padding:0 2px;text-decoration:none;}
.rt-confirm{display:flex;flex-direction:column;}
.rt-confirm-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);}
.rt-confirm-row:last-child{border-bottom:none;}
.rt-confirm-k{font-size:12.5px;font-weight:800;color:var(--ink-2);flex:none;}
.rt-confirm-v{font-size:13.5px;font-weight:700;text-align:right;line-height:1.5;word-break:break-all;}
.rt-done-wrap{text-align:center;padding:20px 0 8px;}
.rt-done-ring{width:88px;height:88px;border-radius:50%;background:var(--green-soft);margin:0 auto 18px;display:flex;align-items:center;justify-content:center;}
.rt-done-circle{width:58px;height:58px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-done-t{font-size:22px;font-weight:900;margin:0 0 10px;}
.rt-done-d{font-size:13px;color:var(--ink-2);font-weight:600;line-height:1.7;margin:0 0 24px;}
`;
