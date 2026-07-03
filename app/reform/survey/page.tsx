"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, AlertCircle, Search, Camera, X, Calendar, ChevronRight, Info,
} from "lucide-react";
import { useReform, needsInput, valLabel } from "@/context/ReformContext";
import { useAuth } from "@/context/AuthContext";
import { createSurveyRequest } from "@/lib/firestore";

/**
 * RE:TERA HOME — 現地調査 申し込みフォーム
 * RETERA_SurveyRequest.jsx を移植（器はお客様情報入力の流用）。
 * 見積内容（工事リスト・概算）は ReformContext から上部サマリーに引き継ぐ。
 * 【新規要素】現況写真アップロード（Phase1はプレースホルダー）／希望日程（第1〜第3）。
 */
const emailOk = (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const telOk = (v: string) => { const d = v.replace(/[-\s]/g, ""); return /^0\d{9,10}$/.test(d); };
const num = (n: number) => n.toLocaleString("ja-JP");

// カートが空のときのサンプル表示（デモ用フォールバック）
const SAMPLE = { items: ["量産クロス貼り替え 30㎡", "CF貼り替え（トイレ） 1式"], net: 68900 };

const TIMES = ["午前", "午後", "夕方", "指定なし"];

type Pref = { date: string; time: string };

export default function SurveyRequest() {
  const router = useRouter();
  const { rows, net, clear } = useReform();
  const { user } = useAuth();

  const summaryItems = rows.length
    ? rows.map((r) => `${r.item.title} ${needsInput(r.item) ? `${r.val}${valLabel(r.item)}` : r.item.method === "set" ? "1台" : "1式"}`)
    : SAMPLE.items;
  const summaryNet = rows.length ? net : SAMPLE.net;

  const [f, setF] = useState({ name: "", tel: "", email: "", zip: "", addr: "", building: "", note: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<{ id: number; name: string }[]>([]);
  const [prefs, setPrefs] = useState<Pref[]>([{ date: "", time: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const nameErr = touched.name && !f.name.trim() ? "お名前を入力してください" : "";
  const telErr = touched.tel && !telOk(f.tel) ? "正しい電話番号を入力してください" : "";
  const emailErr = touched.email && !emailOk(f.email) ? "正しいメールアドレスを入力してください" : "";
  const addrErr = touched.addr && !f.addr.trim() ? "ご住所を入力してください" : "";

  const ready = Boolean(f.name.trim() && telOk(f.tel) && f.addr.trim() && emailOk(f.email));

  const addPhoto = () => setPhotos((p) => (p.length >= 6 ? p : [...p, { id: Date.now() + Math.random(), name: `写真${p.length + 1}` }]));
  const removePhoto = (id: number) => setPhotos((p) => p.filter((x) => x.id !== id));
  const addPref = () => setPrefs((p) => (p.length >= 3 ? p : [...p, { date: "", time: "" }]));
  const setPref = (i: number, k: keyof Pref, v: string) => setPrefs((p) => p.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  const removePref = (i: number) => setPrefs((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!ready || submitting) return;
    setSubmitting(true);
    try {
      await createSurveyRequest({
        items: summaryItems,
        net: summaryNet,
        customer: f,
        prefs,
        photoCount: photos.length,
        userId: user?.uid ?? null,
      });
      clear();
    } catch {
      // 未設定・失敗でもフローは継続
    } finally {
      router.push("/messages");
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <button className="rt-back" onClick={() => router.push("/reform/simulator")}><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-mini-title">現地調査のお申し込み</div>
        </header>

        <div className="rt-intro">
          <Info size={15} strokeWidth={2.2} />
          <div>正確なお見積りのため、担当が現地を確認します。調査・お見積りは無料です。</div>
        </div>

        {/* 見積サマリー（引き継ぎ） */}
        <div className="rt-summary">
          <div className="rt-summary-h">ご相談内容</div>
          {summaryItems.map((t, i) => <div className="rt-summary-item" key={i}><Check size={14} strokeWidth={3} />{t}</div>)}
          <div className="rt-summary-est">概算 <b>{num(summaryNet)}円</b><span>（税抜・目安）</span></div>
        </div>

        {/* 連絡先 */}
        <div className="rt-block">
          <div className="rt-block-h">ご連絡先</div>
          <div className="rt-fields">
            <Field label="お名前" req value={f.name} onChange={set("name")} onBlur={blur("name")} err={nameErr} placeholder="山田 花子" />
            <Field label="電話番号" req type="tel" inputMode="tel" value={f.tel} onChange={set("tel")} onBlur={blur("tel")} err={telErr} placeholder="090-1234-5678" note="調査日程の調整にご連絡します" />
            <Field label="メールアドレス" type="email" inputMode="email" value={f.email} onChange={set("email")} onBlur={blur("email")} err={emailErr} placeholder="example@email.com" />
          </div>
        </div>

        {/* 住所 */}
        <div className="rt-block">
          <div className="rt-block-h">調査先のご住所</div>
          <div className="rt-fields">
            <div className="rt-field">
              <label className="rt-field-l">郵便番号</label>
              <div className="rt-zip-row">
                <input className="rt-input" inputMode="numeric" value={f.zip} onChange={set("zip")} placeholder="343-0845" />
                <button className="rt-zip-btn"><Search size={15} strokeWidth={2.4} />住所を検索</button>
              </div>
            </div>
            <Field label="ご住所" req value={f.addr} onChange={set("addr")} onBlur={blur("addr")} err={addrErr} placeholder="埼玉県越谷市南越谷 1-26-12" />
            <Field label="建物名・部屋番号" value={f.building} onChange={set("building")} placeholder="◯◯マンション 101" />
          </div>
        </div>

        {/* 現況写真 */}
        <div className="rt-block">
          <div className="rt-block-h">現況写真 <span>（任意・最大6枚）</span></div>
          <div className="rt-block-sub">気になる箇所の写真があると、より正確なお見積りができます。</div>
          <div className="rt-photos">
            {photos.map((p) => (
              <div className="rt-photo-item" key={p.id}>
                <Camera size={20} strokeWidth={2} />
                <button className="rt-photo-del" onClick={() => removePhoto(p.id)} aria-label="削除"><X size={13} strokeWidth={2.6} /></button>
              </div>
            ))}
            {photos.length < 6 && (
              <button className="rt-photo-add" onClick={addPhoto}><Camera size={22} strokeWidth={1.8} /><span>追加</span></button>
            )}
          </div>
        </div>

        {/* 希望日程 */}
        <div className="rt-block">
          <div className="rt-block-h">調査のご希望日程 <span>（最大3つ）</span></div>
          <div className="rt-block-sub">担当が調整のうえ、確定日をご連絡します。</div>
          <div className="rt-prefs">
            {prefs.map((p, i) => (
              <div className="rt-pref" key={i}>
                <div className="rt-pref-badge">第{i + 1}希望</div>
                <input className="rt-input rt-pref-date" type="date" value={p.date} onChange={(e) => setPref(i, "date", e.target.value)} />
                <div className="rt-pref-time">
                  <select value={p.time} onChange={(e) => setPref(i, "time", e.target.value)}>
                    <option value="">時間帯</option>
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {prefs.length > 1 && <button className="rt-pref-del" onClick={() => removePref(i)} aria-label="削除"><X size={15} strokeWidth={2.4} /></button>}
              </div>
            ))}
            {prefs.length < 3 && <button className="rt-pref-add" onClick={addPref}><Calendar size={15} strokeWidth={2.2} />希望日程を追加</button>}
          </div>
        </div>

        {/* 備考 */}
        <div className="rt-block">
          <div className="rt-block-h">ご要望・備考</div>
          <textarea className="rt-textarea" rows={3} value={f.note} onChange={set("note")} placeholder="気になる点、駐車場の有無、ご希望など" />
        </div>

        <div className="rt-hint">送信後、担当より日程調整のご連絡をします。調査・お見積りは無料です。</div>

        <div style={{ height: 100 }} />
      </div>

      <div className="rt-bottom">
        <div className="rt-bar">
          <button className={"rt-submit" + (ready ? "" : " off")} disabled={!ready || submitting} onClick={handleSubmit}>現地調査を申し込む<ChevronRight size={18} strokeWidth={2.6} /></button>
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
      {err ? <div className="rt-err"><AlertCircle size={13} strokeWidth={2.4} />{err}</div> : note ? <div className="rt-field-note">{note}</div> : null}
    </div>
  );
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-intro{display:flex;align-items:flex-start;gap:8px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:12px;padding:12px;margin-bottom:14px;font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-intro svg{color:var(--red);flex:none;margin-top:1px;}
.rt-summary{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-summary-h{font-size:12px;font-weight:800;color:var(--ink-2);margin-bottom:9px;}
.rt-summary-item{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;margin-bottom:6px;}
.rt-summary-item svg{color:var(--red);flex:none;}
.rt-summary-est{font-size:12px;color:var(--ink-2);font-weight:700;margin-top:8px;padding-top:9px;border-top:1px solid var(--line);}
.rt-summary-est b{font-size:17px;color:var(--red);font-weight:900;margin:0 2px;}
.rt-summary-est span{font-size:11px;color:var(--ink-3);}
.rt-block{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-block-h{font-size:15px;font-weight:900;margin-bottom:4px;}
.rt-block-h span{font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-block-sub{font-size:11.5px;color:var(--ink-2);font-weight:600;margin-bottom:13px;line-height:1.5;}
.rt-block-h + .rt-fields{margin-top:12px;}
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
.rt-photos{display:flex;flex-wrap:wrap;gap:9px;}
.rt-photo-item{position:relative;width:76px;height:76px;border-radius:11px;background:var(--red-soft-2);border:1px solid #F3DEDC;color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-photo-del{position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:var(--ink);color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-photo-add{width:76px;height:76px;border-radius:11px;border:1.5px dashed var(--red);background:#fff;color:var(--red);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;font-size:11px;font-weight:800;}
.rt-prefs{display:flex;flex-direction:column;gap:9px;}
.rt-pref{display:flex;align-items:center;gap:8px;}
.rt-pref-badge{flex:none;font-size:10.5px;font-weight:800;color:var(--red);background:var(--red-soft);padding:6px 9px;border-radius:7px;white-space:nowrap;}
.rt-pref-date{flex:1;padding:10px 12px;}
.rt-pref-time{flex:none;position:relative;}
.rt-pref-time select{appearance:none;-webkit-appearance:none;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:11px 14px;font-size:13px;font-weight:700;color:var(--ink);font-family:inherit;cursor:pointer;}
.rt-pref-del{flex:none;background:none;border:none;color:var(--ink-3);cursor:pointer;padding:4px;}
.rt-pref-add{display:flex;align-items:center;gap:6px;background:#fff;border:1.5px dashed var(--red);color:var(--red);border-radius:10px;padding:11px;font-size:13px;font-weight:800;cursor:pointer;justify-content:center;}
.rt-hint{font-size:11.5px;color:var(--ink-3);font-weight:600;text-align:center;line-height:1.6;}
.rt-bar{background:#fff;border-top:1px solid var(--line);padding:11px 14px calc(11px + env(safe-area-inset-bottom));box-shadow:0 -3px 14px rgba(20,28,38,.06);}
.rt-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;}
.rt-submit:hover{background:var(--red-deep);}
.rt-submit.off{background:#C8CCD0;cursor:not-allowed;}
`;
