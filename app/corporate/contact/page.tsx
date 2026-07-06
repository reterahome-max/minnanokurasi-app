"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertCircle, Building2, ChevronRight, CheckCircle2, Plus, X, RefreshCw, Zap } from "lucide-react";
import { createCorporateInquiry, type CorporateProperty } from "@/lib/firestore";
import { notifyAdmin } from "@/lib/notify";
import { COMPANY } from "@/lib/company";
import Honeypot from "@/components/Honeypot";

/**
 * RE:TERA HOME — 法人問い合わせフォーム（ログイン不要）
 * corporateInquiries に保存し、管理者へメール通知。デザインは reform/survey のフォームに準拠。
 */
const NEEDS = ["空室クリーニング", "定期清掃", "原状回復", "エアコン・水回り清掃", "店舗・オフィス清掃", "その他"];
const SIZES = ["1〜5戸／拠点", "6〜20戸／拠点", "21〜50戸／拠点", "50戸以上", "未定・要相談"];
const PROP_SERVICES = ["空室クリーニング", "定期清掃", "原状回復", "エアコン・水回り", "その他"];
const emptyProp = (): CorporateProperty => ({ place: "", service: "", note: "" });

export default function CorporateContact() {
  const router = useRouter();
  const [f, setF] = useState({ company: "", name: "", tel: "", email: "", propertyCount: "", note: "" });
  const [plan, setPlan] = useState<"spot" | "regular">("spot");
  const [needs, setNeeds] = useState<string[]>([]);
  const [props, setProps] = useState<CorporateProperty[]>([emptyProp()]);
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [hp, setHp] = useState(""); // ハニーポット（ボット対策）

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (n: string) => setNeeds((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const setProp = (i: number, k: keyof CorporateProperty, v: string) =>
    setProps((p) => p.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const addProp = () => setProps((p) => (p.length >= 20 ? p : [...p, emptyProp()]));
  const removeProp = (i: number) => setProps((p) => (p.length <= 1 ? p : p.filter((_, j) => j !== i)));

  const submit = async () => {
    if (sending) return;
    if (hp) return; // ボットは黙って無視
    const t = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])) as typeof f;
    if (!t.company || !t.name || t.tel.replace(/[^0-9]/g, "").length < 10) {
      setErr("会社名・ご担当者名・電話番号（10桁以上）は必須です。");
      return;
    }
    setErr(null);
    setSending(true);
    // 空行を除いた物件リスト
    const properties = props
      .map((p) => ({ place: p.place.trim(), service: p.service.trim(), note: p.note.trim() }))
      .filter((p) => p.place || p.service || p.note);
    const planLabel = plan === "regular" ? "定期希望" : "スポット";
    try {
      await createCorporateInquiry({ ...t, plan, needs, properties });
      notifyAdmin({
        kind: "法人問い合わせ",
        title: `${t.company}／${t.name} 様（${planLabel}）`,
        lines: [
          `電話：${t.tel}${t.email ? `　メール：${t.email}` : ""}`,
          `規模：${t.propertyCount || "未記入"}／区分：${planLabel}`,
          `依頼内容：${needs.join("、") || "未選択"}`,
          `対象物件：${properties.length ? properties.map((p) => `${p.place}（${p.service || "サービス未指定"}）`).join(" / ") : "未記入"}`,
          `ご相談：${t.note || "（なし）"}`,
        ],
      });
      setDone(true);
    } catch {
      setErr("送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。");
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="rt-shell">
          <div className="rt-done">
            <div className="rt-done-ico"><CheckCircle2 size={44} strokeWidth={2} /></div>
            <h1 className="rt-done-t">お問い合わせを受け付けました</h1>
            <p className="rt-done-d">担当より、お電話またはメールで折り返しご連絡いたします。<br />ありがとうございました。</p>
            <Link href="/" className="rt-done-btn">ホームに戻る</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/corporate" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">法人お問い合わせ</div>
        </header>

        <div className="rt-intro">
          <Building2 size={16} strokeWidth={2.2} />
          管理会社・オーナー・店舗・法人のお客様の窓口です。物件数やご希望をお聞かせいただければ、専任担当が法人プランをお見積りします（登録不要）。
        </div>

        {err && <div className="rt-err"><AlertCircle size={15} strokeWidth={2.4} />{err}</div>}

        <div className="rt-fields">
          <label className="rt-field"><span className="rt-field-l">会社名・屋号 <b>必須</b></span>
            <input className="rt-input" value={f.company} onChange={set("company")} placeholder="株式会社◯◯／◯◯不動産" /></label>
          <label className="rt-field"><span className="rt-field-l">ご担当者名 <b>必須</b></span>
            <input className="rt-input" value={f.name} onChange={set("name")} placeholder="山田 太郎" /></label>
          <label className="rt-field"><span className="rt-field-l">電話番号 <b>必須</b></span>
            <input className="rt-input" type="tel" value={f.tel} onChange={set("tel")} placeholder="09012345678" /></label>
          <label className="rt-field"><span className="rt-field-l">メールアドレス</span>
            <input className="rt-input" type="email" value={f.email} onChange={set("email")} placeholder="example@company.co.jp" /></label>
          <label className="rt-field"><span className="rt-field-l">管理戸数・規模</span>
            <div className="rt-select-box">
              <select className="rt-select" value={f.propertyCount} onChange={set("propertyCount")}>
                <option value="">選択してください</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </label>

          <div className="rt-field">
            <span className="rt-field-l">ご依頼区分</span>
            <div className="rt-plan">
              <button type="button" className={"rt-plan-btn" + (plan === "spot" ? " on" : "")} onClick={() => setPlan("spot")}>
                <Zap size={16} strokeWidth={2.3} />スポット（都度）
              </button>
              <button type="button" className={"rt-plan-btn" + (plan === "regular" ? " on" : "")} onClick={() => setPlan("regular")}>
                <RefreshCw size={16} strokeWidth={2.3} />定期を希望
              </button>
            </div>
          </div>

          <div className="rt-field">
            <span className="rt-field-l">ご依頼内容（複数選択可）</span>
            <div className="rt-needs">
              {NEEDS.map((n) => {
                const on = needs.includes(n);
                return (
                  <button type="button" key={n} className={"rt-need" + (on ? " on" : "")} onClick={() => toggle(n)}>
                    <span className={"rt-need-check" + (on ? " on" : "")}>{on && <Check size={12} strokeWidth={3} />}</span>{n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rt-field">
            <span className="rt-field-l">対象物件（複数まとめてOK・任意）</span>
            <div className="rt-props">
              {props.map((row, i) => (
                <div className="rt-prop" key={i}>
                  <div className="rt-prop-head">
                    <span className="rt-prop-n">物件 {i + 1}</span>
                    {props.length > 1 && <button type="button" className="rt-prop-del" onClick={() => removeProp(i)} aria-label="削除"><X size={15} strokeWidth={2.6} /></button>}
                  </div>
                  <input className="rt-input" value={row.place} onChange={(e) => setProp(i, "place", e.target.value)} placeholder="物件名・住所（例：◯◯マンション 越谷市…）" />
                  <div className="rt-select-box">
                    <select className="rt-select" value={row.service} onChange={(e) => setProp(i, "service", e.target.value)}>
                      <option value="">希望サービス</option>
                      {PROP_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <input className="rt-input" value={row.note} onChange={(e) => setProp(i, "note", e.target.value)} placeholder="戸数・広さ・備考（任意）" />
                </div>
              ))}
              {props.length < 20 && <button type="button" className="rt-prop-add" onClick={addProp}><Plus size={16} strokeWidth={2.6} />物件を追加</button>}
            </div>
          </div>

          <label className="rt-field"><span className="rt-field-l">ご相談内容・ご希望</span>
            <textarea className="rt-input rt-textarea" value={f.note} onChange={set("note")} rows={4} placeholder="物件の所在地、希望時期、頻度、ご予算感などをご記入ください。" /></label>
        </div>

        <Honeypot value={hp} onChange={setHp} />
        <button className="rt-submit" onClick={submit} disabled={sending}>
          {sending ? "送信中…" : "この内容で問い合わせる"}<ChevronRight size={18} strokeWidth={2.6} />
        </button>
        <p className="rt-note">送信いただいた内容は、お見積り・ご連絡のみに使用します。お電話でのご相談は {COMPANY.tel}（{COMPANY.area}）まで。</p>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-intro{display:flex;align-items:flex-start;gap:8px;background:var(--navy);color:#fff;border-radius:12px;padding:13px;margin-bottom:16px;font-size:12px;font-weight:600;line-height:1.65;}
.rt-intro svg{flex:none;margin-top:1px;}
.rt-err{display:flex;align-items:center;gap:7px;background:#FDE9E7;border:1px solid #F5C4C0;color:var(--err);border-radius:10px;padding:11px 13px;font-size:12.5px;font-weight:700;margin-bottom:14px;}
.rt-fields{display:flex;flex-direction:column;gap:15px;margin-bottom:18px;}
.rt-field{display:flex;flex-direction:column;gap:6px;}
.rt-field-l{font-size:12.5px;font-weight:800;color:var(--ink-2);}
.rt-field-l b{color:var(--red);font-size:10px;background:var(--red-soft);padding:2px 7px;border-radius:6px;margin-left:5px;}
.rt-input{width:100%;background:#fff;border:1px solid #E1E4E7;border-radius:11px;padding:13px 14px;font-size:16px;color:var(--ink);font-family:inherit;outline:none;}
.rt-input:focus{border-color:var(--red);}
.rt-textarea{resize:vertical;line-height:1.6;}
.rt-select-box{position:relative;}
.rt-select{width:100%;appearance:none;-webkit-appearance:none;background:#fff;border:1px solid #E1E4E7;border-radius:11px;padding:13px 14px;font-size:16px;color:var(--ink);font-family:inherit;cursor:pointer;}
.rt-needs{display:flex;flex-wrap:wrap;gap:8px;}
.rt-need{display:flex;align-items:center;gap:7px;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:11px 13px;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer;}
.rt-need.on{border-color:var(--red);background:var(--red-soft-2);color:var(--red);}
.rt-need-check{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-need-check.on{background:var(--red);border-color:var(--red);color:#fff;}
.rt-plan{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.rt-plan-btn{display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:13px 8px;font-size:13px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-plan-btn.on{border-color:var(--red);background:var(--red-soft-2);color:var(--red);}
.rt-plan-btn svg{flex:none;}
.rt-props{display:flex;flex-direction:column;gap:10px;}
.rt-prop{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;box-shadow:var(--shadow);}
.rt-prop-head{display:flex;align-items:center;justify-content:space-between;}
.rt-prop-n{font-size:12px;font-weight:800;color:var(--ink-2);}
.rt-prop-del{background:none;border:none;color:var(--ink-3);cursor:pointer;display:flex;padding:2px;}
.rt-prop-add{display:flex;align-items:center;justify-content:center;gap:5px;background:#fff;border:1.5px dashed var(--red);border-radius:11px;padding:12px;font-size:13px;font-weight:800;color:var(--red);cursor:pointer;}
.rt-submit{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:16px;font-size:16px;font-weight:900;cursor:pointer;box-shadow:var(--shadow);}
.rt-submit:hover{background:var(--red-deep);}
.rt-submit:disabled{opacity:.6;cursor:default;}
.rt-note{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.6;margin:12px 2px 0;text-align:center;}
.rt-done{text-align:center;padding:60px 16px;}
.rt-done-ico{width:88px;height:88px;border-radius:50%;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
.rt-done-t{font-size:21px;font-weight:900;margin:0 0 12px;}
.rt-done-d{font-size:13px;color:var(--ink-2);font-weight:600;line-height:1.7;margin:0 0 22px;}
.rt-done-btn{display:inline-flex;background:var(--red);color:#fff;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:800;text-decoration:none;}
`;
