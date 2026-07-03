"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, AlertCircle, Banknote, CreditCard, QrCode, Search, ChevronRight,
} from "lucide-react";
import { useBooking, type Customer } from "@/context/BookingContext";

/**
 * RE:TERA HOME — お客様情報の入力（バリデーション強化版）
 * RETERA_CustomerInfo_Validated.jsx を移植。入力は BookingContext に保持し、確認画面へ。
 * touched（一度フォーカスを外した項目）だけエラー表示。
 */
const PAY_DEFS = [
  { id: "cash", label: "現金", desc: "当日に現金でお支払い", icon: Banknote },
  { id: "card", label: "クレジットカード", desc: "Visa / Master / JCB ほか", icon: CreditCard },
  { id: "qr", label: "QR・電子決済", desc: "PayPay / 各種QR決済", icon: QrCode },
];

// ── バリデーションルール ──────────────────────────────
const RULES: Record<string, (v: string) => string> = {
  name: (v) => (!v.trim() ? "お名前を入力してください" : ""),
  tel: (v) => {
    const d = v.replace(/[-\s]/g, "");
    if (!d) return "電話番号を入力してください";
    if (!/^0\d{9,10}$/.test(d)) return "正しい電話番号を入力してください（例：090-1234-5678）";
    return "";
  },
  email: (v) => {
    if (!v) return ""; // 任意
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "正しいメールアドレスを入力してください";
    return "";
  },
  zip: (v) => {
    if (!v) return ""; // 任意
    if (!/^\d{3}-?\d{4}$/.test(v)) return "郵便番号は7桁で入力してください（例：343-0845）";
    return "";
  },
  addr: (v) => (!v.trim() ? "ご住所を入力してください" : ""),
};

export default function CustomerInfoValidated() {
  const router = useRouter();
  const { customer, payment, setCustomer, set } = useBooking();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const f = customer;
  const pay = payment;

  const setField = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCustomer({ [k]: e.target.value } as Partial<Customer>);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const errOf = (k: string) => (RULES[k] ? RULES[k](f[k as keyof Customer]) : "");
  const showErr = (k: string) => Boolean(touched[k] && errOf(k));

  const requiredKeys = ["name", "tel", "addr"] as const;
  const allValid =
    Object.keys(RULES).every((k) => !errOf(k)) &&
    requiredKeys.every((k) => f[k].trim());

  const handleNext = () => {
    // 押下時：全必須＋形式対象を touched にしてエラーを可視化
    setTouched((t) => ({ ...t, name: true, tel: true, email: true, zip: true, addr: true }));
    if (allValid) router.push("/booking/confirm");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <button className="rt-back" onClick={() => router.push("/booking/date")}><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-mini-title">お客様情報の入力</div>
        </header>

        <div className="rt-steps">
          <div className="rt-step"><div className="rt-step-n done"><Check size={13} strokeWidth={3} /></div><div className="rt-step-l">条件</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n done"><Check size={13} strokeWidth={3} /></div><div className="rt-step-l">日時</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n on">3</div><div className="rt-step-l on">情報</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className="rt-step-n">4</div><div className="rt-step-l">確認</div></div>
        </div>

        <div className="rt-block">
          <div className="rt-block-h">ご連絡先</div>
          <div className="rt-fields">
            <Field label="お名前" req value={f.name} onChange={setField("name")} onBlur={blur("name")} err={showErr("name") ? errOf("name") : ""} placeholder="山田 花子" />
            <Field label="フリガナ" value={f.kana} onChange={setField("kana")} placeholder="ヤマダ ハナコ" />
            <Field label="電話番号" req type="tel" inputMode="tel" value={f.tel} onChange={setField("tel")} onBlur={blur("tel")} err={showErr("tel") ? errOf("tel") : ""} placeholder="090-1234-5678" note="当日の連絡に使用します" />
            <Field label="メールアドレス" type="email" inputMode="email" value={f.email} onChange={setField("email")} onBlur={blur("email")} err={showErr("email") ? errOf("email") : ""} placeholder="example@email.com" note="予約確認メールをお送りします" />
          </div>
        </div>

        <div className="rt-block">
          <div className="rt-block-h">訪問先のご住所</div>
          <div className="rt-fields">
            <div className="rt-field">
              <label className="rt-field-l">郵便番号</label>
              <div className="rt-zip-row">
                <input className={"rt-input" + (showErr("zip") ? " err" : "")} inputMode="numeric" value={f.zip} onChange={setField("zip")} onBlur={blur("zip")} placeholder="343-0845" />
                <button className="rt-zip-btn"><Search size={15} strokeWidth={2.4} />住所を検索</button>
              </div>
              {showErr("zip") && <Err msg={errOf("zip")} />}
            </div>
            <Field label="ご住所" req value={f.addr} onChange={setField("addr")} onBlur={blur("addr")} err={showErr("addr") ? errOf("addr") : ""} placeholder="埼玉県越谷市南越谷 1-26-12" />
            <Field label="建物名・部屋番号" value={f.building} onChange={setField("building")} placeholder="◯◯マンション 101" />
            <Field label="当日連絡先（任意）" type="tel" inputMode="tel" value={f.subtel} onChange={setField("subtel")} placeholder="当日つながる番号があれば" />
            <div className="rt-field">
              <label className="rt-field-l">ご要望・備考</label>
              <textarea className="rt-textarea" rows={3} value={f.note} onChange={setField("note")} placeholder="駐車場の有無、エレベーターの有無、当日の連絡事項など" />
            </div>
          </div>
        </div>

        <div className="rt-block">
          <div className="rt-block-h">お支払い方法</div>
          <div className="rt-pays">
            {PAY_DEFS.map((p) => { const Icon = p.icon; const on = pay === p.id; return (
              <button key={p.id} className={"rt-pay" + (on ? " on" : "")} onClick={() => set({ payment: p.id })}>
                <div className="rt-pay-ico"><Icon size={20} strokeWidth={2.1} /></div>
                <div className="rt-pay-body"><div className="rt-pay-l">{p.label}</div><div className="rt-pay-d">{p.desc}</div></div>
                <div className={"rt-radio" + (on ? " on" : "")}>{on && <span />}</div>
              </button>
            ); })}
          </div>
        </div>

        {!allValid && Object.keys(touched).length > 0 && (
          <div className="rt-form-alert"><AlertCircle size={15} strokeWidth={2.4} />未入力または誤りのある項目があります。ご確認ください。</div>
        )}
        <div className="rt-hint">入力内容は次の画面で確認できます。まだ予約は確定しません。</div>

        <div style={{ height: 100 }} />
      </div>

      <div className="rt-bottom">
        <div className="rt-bar">
          <button className={"rt-next-btn" + (allValid ? "" : " off")} onClick={handleNext} disabled={!allValid}>確認へ進む<ChevronRight size={18} strokeWidth={2.6} /></button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, req, type = "text", inputMode, value, onChange, onBlur, err, placeholder, note,
}: {
  label: string;
  req?: boolean;
  type?: string;
  inputMode?: "tel" | "email" | "numeric" | "text";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  err?: string;
  placeholder?: string;
  note?: string;
}) {
  return (
    <div className="rt-field">
      <label className="rt-field-l">{label}{req && <span className="rt-req">必須</span>}</label>
      <input className={"rt-input" + (err ? " err" : "")} type={type} inputMode={inputMode} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
      {err ? <Err msg={err} /> : note ? <div className="rt-field-note">{note}</div> : null}
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return <div className="rt-err"><AlertCircle size={13} strokeWidth={2.4} />{msg}</div>;
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-steps{display:flex;align-items:center;padding:6px 6px 18px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:28px;height:28px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-n.done{background:var(--red);color:#fff;}
.rt-step-l{font-size:10.5px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--ink);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 3px 21px;}
.rt-step-line.on{background:var(--red);}
.rt-block{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-block-h{font-size:15px;font-weight:900;margin-bottom:14px;}
.rt-fields{display:flex;flex-direction:column;gap:14px;}
.rt-field{display:flex;flex-direction:column;gap:5px;}
.rt-field-l{font-size:12.5px;font-weight:800;color:var(--ink-2);display:flex;align-items:center;gap:6px;}
.rt-req{font-size:10px;font-weight:800;color:var(--red);background:var(--red-soft);padding:2px 7px;border-radius:5px;}
.rt-input{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px 13px;font-size:14px;color:var(--ink);outline:none;font-family:inherit;}
.rt-input:focus{border-color:var(--red);background:#fff;}
.rt-input.err{border-color:var(--err);background:#FDF3F2;}
.rt-input::placeholder{color:var(--ink-3);}
.rt-field-note{font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-err{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--err);}
.rt-err svg{flex:none;}
.rt-zip-row{display:flex;gap:8px;}
.rt-zip-row .rt-input{flex:1;}
.rt-zip-btn{flex:none;display:flex;align-items:center;gap:4px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12.5px;font-weight:800;border-radius:10px;padding:0 13px;cursor:pointer;white-space:nowrap;}
.rt-textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px 13px;font-size:14px;color:var(--ink);outline:none;font-family:inherit;resize:vertical;}
.rt-textarea:focus{border-color:var(--red);background:#fff;}
.rt-textarea::placeholder{color:var(--ink-3);}
.rt-pays{display:flex;flex-direction:column;gap:9px;}
.rt-pay{display:flex;align-items:center;gap:11px;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:13px;cursor:pointer;text-align:left;}
.rt-pay.on{border-color:var(--red);background:var(--red-soft-2);}
.rt-pay-ico{flex:none;width:40px;height:40px;border-radius:10px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-pay-body{flex:1;min-width:0;}
.rt-pay-l{font-size:14px;font-weight:800;}
.rt-pay-d{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:2px;}
.rt-radio{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;}
.rt-radio.on{border-color:var(--red);}
.rt-radio.on span{width:11px;height:11px;border-radius:50%;background:var(--red);}
.rt-form-alert{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--err);background:#FDF3F2;border:1px solid #F3D3D1;border-radius:11px;padding:12px;margin-bottom:10px;}
.rt-form-alert svg{flex:none;}
.rt-hint{font-size:11.5px;color:var(--ink-3);font-weight:600;text-align:center;line-height:1.5;}
.rt-bar{background:#fff;border-top:1px solid var(--line);padding:11px 14px calc(11px + env(safe-area-inset-bottom));box-shadow:0 -3px 14px rgba(20,28,38,.06);}
.rt-next-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;}
.rt-next-btn:hover{background:var(--red-deep);}
.rt-next-btn.off{background:#C8CCD0;cursor:not-allowed;}
`;
