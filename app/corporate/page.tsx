"use client";

import Link from "next/link";
import {
  ArrowLeft, Building2, FileText, Users, Percent, ClipboardList, Phone, Check, ChevronRight,
} from "lucide-react";
import Photo from "@/components/Photo";

/**
 * RE:TERA HOME — 法人・管理会社向けプラン（BtoB導線）
 * RETERA_Corporate.jsx を移植。お問い合わせ重視。
 */
const MERITS = [
  { icon: Building2, t: "複数物件をまとめて依頼", d: "管理戸数が多くても、一括で受付・スケジュール調整します。" },
  { icon: FileText, t: "請求書・後払いに対応", d: "月締め請求書払いに対応。経理処理もスムーズです。" },
  { icon: Users, t: "専任担当がつきます", d: "窓口を一本化。やり取りの手間を最小限に。" },
  { icon: Percent, t: "数量割引", d: "戸数・頻度に応じた法人価格をご用意します。" },
];
const USECASES = [
  "入居前・退去後の空室クリーニング",
  "定期巡回でのエアコン・水回り清掃",
  "原状回復に伴うまとめ清掃",
  "複数拠点・店舗の定期メンテナンス",
];
const FLOW = [
  { n: "1", t: "お問い合わせ", d: "物件数・ご希望をフォームから送信。" },
  { n: "2", t: "お見積り", d: "専任担当が法人プランをご提案。" },
  { n: "3", t: "契約・定期運用", d: "スケジュールを組み、まとめて運用。" },
];

export default function CorporateLanding() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/" className="rt-back"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">法人・管理会社の方へ</div>
        </header>

        <div className="rt-hero">
          <div className="rt-hero-photo"><Photo srcKey="hero" alt="法人向けクリーニング" /></div>
          <div className="rt-hero-overlay" />
          <div className="rt-hero-inner">
            <div className="rt-hero-badge"><Building2 size={13} strokeWidth={2.6} />法人プラン</div>
            <h1 className="rt-hero-h1">物件管理の清掃を、<br />まるごとおまかせ。</h1>
            <p className="rt-hero-sub">越谷・春日部エリアの管理会社・オーナー様向け。<br />空室清掃から定期メンテナンスまで一括対応します。</p>
          </div>
        </div>

        <div className="rt-sec-h">法人プランの特長</div>
        <div className="rt-merits">
          {MERITS.map((m, i) => { const Icon = m.icon; return (
            <div className="rt-merit" key={i}>
              <div className="rt-merit-ico"><Icon size={22} strokeWidth={2.1} /></div>
              <div className="rt-merit-t">{m.t}</div>
              <div className="rt-merit-d">{m.d}</div>
            </div>
          ); })}
        </div>

        <div className="rt-usecase">
          <div className="rt-usecase-h"><ClipboardList size={18} strokeWidth={2.2} />こんなご依頼に</div>
          <ul className="rt-usecase-list">
            {USECASES.map((u, i) => <li key={i}><Check size={15} strokeWidth={3} />{u}</li>)}
          </ul>
        </div>

        <div className="rt-sec-h">導入の流れ</div>
        <div className="rt-flow">
          {FLOW.map((f, i) => (
            <div className="rt-flow-row" key={i}>
              <div className="rt-flow-n">{f.n}</div>
              <div className="rt-flow-card"><div className="rt-flow-t">{f.t}</div><div className="rt-flow-d">{f.d}</div></div>
            </div>
          ))}
        </div>

        <div className="rt-contact">
          <div className="rt-contact-t">まずはお気軽にご相談ください</div>
          <div className="rt-contact-d">物件数・ご希望をお聞かせいただければ、法人プランをお見積りします。</div>
          <Link href="/messages" className="rt-contact-btn"><FileText size={18} strokeWidth={2.2} />法人問い合わせフォーム<ChevronRight size={17} strokeWidth={2.6} className="rt-contact-cv" /></Link>
          <button className="rt-contact-tel"><Phone size={17} strokeWidth={2.2} />電話で相談する</button>
        </div>

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
.rt-hero{position:relative;border-radius:18px;overflow:hidden;margin-bottom:22px;min-height:208px;display:flex;align-items:flex-end;}
.rt-hero-photo{position:absolute;inset:0;}
.rt-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,42,51,.25),rgba(12,42,51,.85));}
.rt-hero-inner{position:relative;z-index:2;padding:18px 16px;color:#fff;}
.rt-hero-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--navy);background:#fff;padding:4px 10px;border-radius:999px;margin-bottom:10px;}
.rt-hero-h1{font-size:25px;font-weight:900;line-height:1.3;margin:0 0 8px;}
.rt-hero-sub{font-size:12px;font-weight:600;line-height:1.6;color:rgba(255,255,255,.9);margin:0;}
.rt-sec-h{font-size:17px;font-weight:900;margin:0 0 13px;}
.rt-merits{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px;}
.rt-merit{background:#fff;border:1px solid var(--line);border-radius:15px;padding:15px;box-shadow:var(--shadow);}
.rt-merit-ico{width:44px;height:44px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.rt-merit-t{font-size:14px;font-weight:900;line-height:1.3;margin-bottom:5px;}
.rt-merit-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-usecase{background:var(--navy);border-radius:16px;padding:18px;margin-bottom:22px;color:#fff;}
.rt-usecase-h{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:900;margin-bottom:13px;}
.rt-usecase-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
.rt-usecase-list li{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;}
.rt-usecase-list svg{color:#fff;background:var(--red);border-radius:50%;padding:2px;flex:none;}
.rt-flow{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
.rt-flow-row{display:flex;align-items:center;gap:12px;}
.rt-flow-n{flex:none;width:36px;height:36px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;}
.rt-flow-card{flex:1;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px 15px;box-shadow:var(--shadow);}
.rt-flow-t{font-size:14px;font-weight:900;margin-bottom:2px;}
.rt-flow-d{font-size:11.5px;color:var(--ink-2);font-weight:600;}
.rt-contact{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 16px;text-align:center;box-shadow:var(--shadow);}
.rt-contact-t{font-size:17px;font-weight:900;margin-bottom:6px;}
.rt-contact-d{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;margin-bottom:16px;}
.rt-contact-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:15px;font-size:15px;font-weight:900;cursor:pointer;margin-bottom:10px;text-decoration:none;}
.rt-contact-btn:hover{background:var(--red-deep);}
.rt-contact-cv{position:absolute;right:15px;}
.rt-contact-tel{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;border:1.5px solid var(--red);color:var(--red);border-radius:13px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;}
.rt-ph{min-height:208px;background:linear-gradient(150deg,#2A4A54,#15414B);color:#7E98A0;}
`;
