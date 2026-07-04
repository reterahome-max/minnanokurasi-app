import Link from "next/link";
import {
  ArrowLeft, ClipboardList, Check, ChevronRight, Phone, FileText,
  Calculator, Receipt, ShieldCheck,
} from "lucide-react";
import Photo from "@/components/Photo";
import { COMPANY } from "@/lib/company";
import { CORP_CATEGORIES } from "@/lib/corporatePricing";

/**
 * 法人 原状回復のサービス紹介ページ（indexable・SEO）。
 * トンマナは /corporate と統一しつつ、淡いネイビーで法人面を表現。
 * 見積は独立エンジン（lib/corporatePricing）のシミュレーターへ誘導。
 */

const SCOPE = [
  "退去後の空室クリーニング（間取り別の一式料金）",
  "クロス（壁紙）の張替え・部分補修",
  "床材の補修・張替え（CF・フロアタイル・巾木）",
  "建具・窓まわり・水回り設備の交換・調整",
  "エアコン・換気設備のクリーニング",
  "残置物処分・特殊清掃などのご相談",
];

const REASONS = [
  { icon: Calculator, t: "Webで概算がすぐわかる", d: "メニューを選ぶだけで、税抜の概算金額をその場で確認できます。" },
  { icon: Receipt, t: "明朗な単価表ベース", d: "作業ごとの標準単価をもとに算出。追加は写真確認・現地調査で明示します。" },
  { icon: ShieldCheck, t: "まとめて一括対応", d: "清掃から内装・設備まで、退去1件を窓口ひとつで完結できます。" },
];

const FLOW = [
  { n: "1", t: "メニューを選ぶ", d: "間取りと作業内容をシミュレーターで選択。" },
  { n: "2", t: "概算を確認", d: "税抜の概算金額がその場で表示されます。" },
  { n: "3", t: "見積を依頼", d: "物件情報とご連絡先を送信（登録不要）。" },
  { n: "4", t: "正式見積・着工", d: "写真確認・現地調査のうえ正式金額をご提示。" },
];

export default function RestorationLanding() {
  return (
    <div className="theme-navy" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/corporate" className="rt-back" aria-label="法人トップへ戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">原状回復・退去後清掃</div>
        </header>

        <div className="rt-hero">
          <div className="rt-hero-photo"><Photo srcKey="vacancy" alt="原状回復・退去後清掃" /></div>
          <div className="rt-hero-overlay" />
          <div className="rt-hero-inner">
            <div className="rt-hero-badge"><ClipboardList size={13} strokeWidth={2.6} />法人向けサービス</div>
            <h1 className="rt-hero-h1">賃貸の原状回復を、<br />清掃から内装までまるごと。</h1>
            <p className="rt-hero-sub">越谷市・春日部市の管理会社・オーナー様向け。<br />退去後の空室清掃・クロス・床・設備をまとめて対応します。</p>
          </div>
        </div>

        <div className="rt-lead">
          退去のたびに複数業者へ手配する手間をなくし、<b>原状回復の一式をワンストップ</b>でご依頼いただけます。
          Webの見積シミュレーターで、税抜の概算をその場で確認してから相談できます。
        </div>

        <div className="rt-sim-cta">
          <div className="rt-sim-cta-body">
            <div className="rt-sim-cta-t"><Calculator size={17} strokeWidth={2.3} />原状回復シミュレーター</div>
            <div className="rt-sim-cta-d">メニューを選ぶだけで概算金額（税抜）がわかります。</div>
          </div>
          <Link href="/corporate/restoration/simulator" className="rt-sim-cta-btn">概算を出す<ChevronRight size={17} strokeWidth={2.6} /></Link>
        </div>

        <h2 className="rt-sec-h">対応する作業範囲</h2>
        <div className="rt-usecase">
          <ul className="rt-usecase-list">
            {SCOPE.map((u, i) => <li key={i}><Check size={15} strokeWidth={3} />{u}</li>)}
          </ul>
        </div>

        <h2 className="rt-sec-h">対応カテゴリ</h2>
        <div className="rt-cats">
          {CORP_CATEGORIES.map((c) => (
            <div className="rt-cat" key={c.key}>{c.label}</div>
          ))}
        </div>

        <h2 className="rt-sec-h">選ばれる理由</h2>
        <div className="rt-merits">
          {REASONS.map((m, i) => { const Icon = m.icon; return (
            <div className="rt-merit" key={i}>
              <div className="rt-merit-ico"><Icon size={22} strokeWidth={2.1} /></div>
              <div className="rt-merit-t">{m.t}</div>
              <div className="rt-merit-d">{m.d}</div>
            </div>
          ); })}
        </div>

        <h2 className="rt-sec-h">お見積りの流れ</h2>
        <div className="rt-flow">
          {FLOW.map((f, i) => (
            <div className="rt-flow-row" key={i}>
              <div className="rt-flow-n">{f.n}</div>
              <div className="rt-flow-card"><div className="rt-flow-t">{f.t}</div><div className="rt-flow-d">{f.d}</div></div>
            </div>
          ))}
        </div>

        <div className="rt-note">
          表示金額はすべて税抜の概算です。最低施工料金・諸経費・現地条件により変動する場合があります。
          正式なお見積りは、写真確認または現地調査のうえご提示します。
        </div>

        <div className="rt-contact">
          <div className="rt-contact-t">まずは概算から、お気軽に</div>
          <div className="rt-contact-d">シミュレーターで概算を出してそのまま見積依頼、またはお電話・フォームでご相談ください（登録不要）。</div>
          <Link href="/corporate/restoration/simulator" className="rt-contact-btn"><Calculator size={18} strokeWidth={2.2} />シミュレーターで概算する<ChevronRight size={17} strokeWidth={2.6} className="rt-contact-cv" /></Link>
          <Link href="/corporate/contact" className="rt-contact-tel"><FileText size={17} strokeWidth={2.2} />法人問い合わせフォーム</Link>
          {COMPANY.tel && (
            <a href={`tel:${COMPANY.tel.replace(/[^0-9+]/g, "")}`} className="rt-contact-tel"><Phone size={17} strokeWidth={2.2} />{COMPANY.tel} に電話する</a>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.theme-navy{--red:#33517D;--red-deep:#2a4568;--red-soft:#E9EEF6;--red-soft-2:#F3F6FB;}
.rt-shell{min-height:100vh;}
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-hero{position:relative;border-radius:18px;overflow:hidden;margin-bottom:16px;min-height:208px;display:flex;align-items:flex-end;}
.rt-hero-photo{position:absolute;inset:0;}
.rt-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,42,51,.25),rgba(12,42,51,.85));}
.rt-hero-inner{position:relative;z-index:2;padding:18px 16px;color:#fff;}
.rt-hero-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--navy);background:#fff;padding:4px 10px;border-radius:999px;margin-bottom:10px;}
.rt-hero-h1{font-size:24px;font-weight:900;line-height:1.32;margin:0 0 8px;}
.rt-hero-sub{font-size:12px;font-weight:600;line-height:1.6;color:rgba(255,255,255,.9);margin:0;}
.rt-lead{font-size:13px;font-weight:600;line-height:1.75;color:var(--ink-2);margin-bottom:18px;}
.rt-lead b{color:var(--ink);font-weight:900;}
.rt-sim-cta{display:flex;align-items:center;gap:12px;background:var(--red-soft);border:1px solid var(--red);border-radius:16px;padding:15px;margin-bottom:24px;}
.rt-sim-cta-body{flex:1;min-width:0;}
.rt-sim-cta-t{display:flex;align-items:center;gap:6px;font-size:15px;font-weight:900;color:var(--red);}
.rt-sim-cta-d{font-size:11.5px;color:var(--ink-2);font-weight:700;margin-top:3px;line-height:1.5;}
.rt-sim-cta-btn{flex:none;display:inline-flex;align-items:center;gap:2px;background:var(--red);color:#fff;border-radius:11px;padding:11px 14px;font-size:13.5px;font-weight:900;text-decoration:none;white-space:nowrap;}
.rt-sim-cta-btn:hover{background:var(--red-deep);}
.rt-sec-h{font-size:17px;font-weight:900;margin:0 0 13px;}
.rt-usecase{background:var(--navy);border-radius:16px;padding:18px;margin-bottom:24px;color:#fff;}
.rt-usecase-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px;}
.rt-usecase-list li{display:flex;align-items:flex-start;gap:8px;font-size:13px;font-weight:700;line-height:1.5;}
.rt-usecase-list svg{color:#fff;background:var(--red);border-radius:50%;padding:2px;flex:none;margin-top:1px;}
.rt-cats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;}
.rt-cat{background:#fff;border:1px solid var(--line);border-radius:999px;padding:9px 14px;font-size:12.5px;font-weight:800;color:var(--navy);box-shadow:var(--shadow);}
.rt-merits{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}
.rt-merit{background:#fff;border:1px solid var(--line);border-radius:15px;padding:15px;box-shadow:var(--shadow);display:flex;flex-direction:column;}
.rt-merit-ico{width:44px;height:44px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.rt-merit-t{font-size:14px;font-weight:900;line-height:1.3;margin-bottom:5px;}
.rt-merit-d{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.55;}
.rt-flow{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}
.rt-flow-row{display:flex;align-items:center;gap:12px;}
.rt-flow-n{flex:none;width:36px;height:36px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;}
.rt-flow-card{flex:1;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px 15px;box-shadow:var(--shadow);}
.rt-flow-t{font-size:14px;font-weight:900;margin-bottom:2px;}
.rt-flow-d{font-size:11.5px;color:var(--ink-2);font-weight:600;}
.rt-note{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.7;background:var(--red-soft-2);border-radius:12px;padding:13px 15px;margin-bottom:24px;}
.rt-contact{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 16px;text-align:center;box-shadow:var(--shadow);}
.rt-contact-t{font-size:17px;font-weight:900;margin-bottom:6px;}
.rt-contact-d{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;margin-bottom:16px;}
.rt-contact-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:15px;font-size:15px;font-weight:900;cursor:pointer;margin-bottom:10px;text-decoration:none;}
.rt-contact-btn:hover{background:var(--red-deep);}
.rt-contact-cv{position:absolute;right:15px;}
.rt-contact-tel{text-decoration:none;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;border:1.5px solid var(--red);color:var(--red);border-radius:13px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;margin-bottom:10px;}
.rt-contact-tel:last-child{margin-bottom:0;}
.rt-ph{min-height:208px;background:linear-gradient(150deg,#2A4A54,#15414B);color:#7E98A0;}
`;
