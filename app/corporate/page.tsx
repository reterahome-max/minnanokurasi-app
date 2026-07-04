"use client";

import Link from "next/link";
import {
  ArrowLeft, Building2, FileText, Users, Percent, ClipboardList, Phone, Check, ChevronRight,
  RefreshCw, CalendarClock, Wallet, Layers,
} from "lucide-react";
import Photo from "@/components/Photo";
import AudienceTabs from "@/components/AudienceTabs";
import { COMPANY } from "@/lib/company";

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

        <AudienceTabs active="corporate" />

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

        <div className="rt-sec-h">定期プランのご案内</div>
        <div className="rt-plan-card">
          <div className="rt-plan-lead"><RefreshCw size={17} strokeWidth={2.3} />月次・隔月などの定期清掃で、物件の美観と資産価値をキープ。</div>
          <div className="rt-plan-grid">
            <div className="rt-plan-item"><CalendarClock size={18} strokeWidth={2.2} /><div><b>スケジュール一括管理</b><span>訪問日を固定化し、都度依頼の手間をゼロに。</span></div></div>
            <div className="rt-plan-item"><Wallet size={18} strokeWidth={2.2} /><div><b>定期割引・請求書払い</b><span>頻度に応じた法人価格。月締め請求書に対応。</span></div></div>
            <div className="rt-plan-item"><Layers size={18} strokeWidth={2.2} /><div><b>スポット併用OK</b><span>定期＋退去時のスポット清掃も同じ窓口で。</span></div></div>
          </div>
          <div className="rt-plan-note">頻度・戸数によりお見積り。まずはお気軽にご相談ください。</div>
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

        <div className="rt-sec-h">法人メニュー</div>
        <div className="rt-cmenu">
          <Link href="/corporate/restoration" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><ClipboardList size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">原状回復・退去後清掃</div><div className="rt-cmenu-d">対応範囲の紹介と、概算がわかる見積シミュレーター</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          <Link href="/corporate/contact" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><Layers size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">複数物件をまとめて依頼</div><div className="rt-cmenu-d">物件を何件でも追加して一括でお申し込み</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          <Link href="/corporate/contact" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><RefreshCw size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">定期プランを相談する</div><div className="rt-cmenu-d">月次・隔月の定期清掃をお見積り</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          {COMPANY.tel && (
            <a href={`tel:${COMPANY.tel.replace(/[^0-9+]/g, "")}`} className="rt-cmenu-row">
              <div className="rt-cmenu-ico"><Phone size={20} strokeWidth={2.1} /></div>
              <div className="rt-cmenu-body"><div className="rt-cmenu-t">電話で相談する</div><div className="rt-cmenu-d">{COMPANY.tel}（{COMPANY.area}）</div></div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
            </a>
          )}
        </div>

        <div className="rt-contact">
          <div className="rt-contact-t">まずはお気軽にご相談ください</div>
          <div className="rt-contact-d">物件数・ご希望をお聞かせいただければ、法人プランをお見積りします（登録不要）。</div>
          <Link href="/corporate/contact" className="rt-contact-btn"><FileText size={18} strokeWidth={2.2} />法人問い合わせフォーム<ChevronRight size={17} strokeWidth={2.6} className="rt-contact-cv" /></Link>
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
.rt-plan-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-plan-lead{display:flex;align-items:flex-start;gap:7px;font-size:13px;font-weight:800;line-height:1.5;margin-bottom:13px;}
.rt-plan-lead svg{color:var(--red);flex:none;margin-top:1px;}
.rt-plan-grid{display:flex;flex-direction:column;gap:11px;}
.rt-plan-item{display:flex;align-items:flex-start;gap:10px;}
.rt-plan-item svg{color:var(--red);flex:none;margin-top:2px;}
.rt-plan-item b{display:block;font-size:13px;font-weight:800;margin-bottom:2px;}
.rt-plan-item span{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-plan-note{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:13px;padding-top:12px;border-top:1px solid var(--line);}
.rt-cmenu{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-cmenu-row{display:flex;align-items:center;gap:12px;padding:15px 14px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;}
.rt-cmenu-row:last-child{border-bottom:none;}
.rt-cmenu-ico{flex:none;width:42px;height:42px;border-radius:11px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-cmenu-body{flex:1;min-width:0;}
.rt-cmenu-t{font-size:14px;font-weight:800;}
.rt-cmenu-d{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:2px;}
.rt-cmenu-cv{color:var(--ink-3);flex:none;}
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
.rt-contact-tel{text-decoration:none;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;border:1.5px solid var(--red);color:var(--red);border-radius:13px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;}
.rt-ph{min-height:208px;background:linear-gradient(150deg,#2A4A54,#15414B);color:#7E98A0;}
`;
