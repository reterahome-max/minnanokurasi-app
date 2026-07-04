"use client";

import Link from "next/link";
import {
  ArrowLeft, ChevronRight, Search, CalendarCheck, Truck, CreditCard,
  Check, Phone, MapPin, Sparkles, ClipboardList, Car, Info, HelpCircle, Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { COMPANY } from "@/lib/company";

/**
 * RE:TERA HOME — 初めての方へ（ご利用ガイド）
 * 初めての不安を解消する公開ページ。内容は実情報（税込・追加料金なし・当日払い等）に基づく。
 * デザインは既存トンマナ（タイトル行・カード・ステップ・下部CTA）に準拠。
 */

const STEPS = [
  { icon: Search, t: "1. サービスを選ぶ", d: "料金シミュレーターで、台数やオプションを選ぶと税込の総額がその場でわかります。カテゴリからサービスを探すこともできます。" },
  { icon: CalendarCheck, t: "2. 日時を選んでWeb予約", d: "カレンダーから空いている日時を選び、お客様情報を入力するだけ。ゲストのままでもご予約いただけます。" },
  { icon: Truck, t: "3. 前日連絡・当日訪問", d: "前日に担当より訪問時間の最終確認をご連絡。当日はスタッフが伺い、丁寧に作業します。" },
  { icon: CreditCard, t: "4. 仕上がり確認・お支払い", d: "作業後、一緒に仕上がりをご確認いただいてからお支払い。領収書の発行も可能です。" },
];

const ASSURE = [
  { t: "税込価格で表示", d: "サイトの料金はすべて税込。あとから税分が増えることはありません。" },
  { t: "追加料金なし", d: "お見積り後の追加請求は原則ありません。汚れ具合や駐車場代が発生する場合のみ、作業前にご説明・ご同意のうえで対応します。" },
  { t: "見積り後のキャンセル無料", d: "前日までのご連絡なら、変更・キャンセルは無料です。" },
];

const PREP = [
  { icon: ClipboardList, t: "作業場所まわりの片付け", d: "対象の周辺に置いてある小物を少しどけていただけると、当日スムーズです（大きな家具の移動は不要です）。" },
  { icon: Car, t: "駐車スペースの確認", d: "近くに駐車できる場所があるとスムーズです。無い場合は近隣コインパーキングを利用し、料金はお客様負担となります（事前にご案内します）。" },
  { icon: Info, t: "貴重品の管理", d: "貴重品はお手元で管理をお願いします。" },
];

export default function Guide() {
  const tel = COMPANY.tel.replace(/[^0-9+]/g, "");
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">初めての方へ</h1>
        </div>

        <div className="rt-lead">
          <Sparkles size={18} strokeWidth={2.2} />
          <div>{COMPANY.area}に地域密着。初めてでも安心してご利用いただけるよう、ご予約から当日までの流れを分かりやすくご案内します。</div>
        </div>

        <h2 className="rt-g-h">ご利用の流れ</h2>
        <div className="rt-g-steps">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div className={"rt-g-step" + (i === STEPS.length - 1 ? " last" : "")} key={i}>
                <div className="rt-g-step-ico"><Icon size={20} strokeWidth={2.2} /></div>
                <div className="rt-g-step-body">
                  <div className="rt-g-step-t">{s.t}</div>
                  <p className="rt-g-step-d">{s.d}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="rt-g-h">料金の安心ポイント</h2>
        <div className="rt-g-cards">
          {ASSURE.map((a, i) => (
            <div className="rt-g-card" key={i}>
              <div className="rt-g-card-ico"><Check size={16} strokeWidth={3} /></div>
              <div><div className="rt-g-card-t">{a.t}</div><p className="rt-g-card-d">{a.d}</p></div>
            </div>
          ))}
        </div>

        <h2 className="rt-g-h">当日までにご準備いただくこと</h2>
        <div className="rt-g-cards">
          {PREP.map((p, i) => {
            const Icon = p.icon;
            return (
              <div className="rt-g-card" key={i}>
                <div className="rt-g-card-ico prep"><Icon size={16} strokeWidth={2.3} /></div>
                <div><div className="rt-g-card-t">{p.t}</div><p className="rt-g-card-d">{p.d}</p></div>
              </div>
            );
          })}
        </div>

        <h2 className="rt-g-h">お支払い・キャンセル</h2>
        <div className="rt-g-info">
          <div className="rt-g-info-row"><CreditCard size={16} strokeWidth={2.2} /><div><b>お支払い</b>：作業完了後に、現金・クレジットカード・電子決済（QRコード決済など）でお支払いいただけます。</div></div>
          <div className="rt-g-info-row"><Calendar size={16} strokeWidth={2.2} /><div><b>変更・キャンセル</b>：前日までのご連絡なら無料。マイページ・メッセージ・お電話から承ります。</div></div>
          <div className="rt-g-info-row"><MapPin size={16} strokeWidth={2.2} /><div><b>対応エリア</b>：{COMPANY.area}。エリア内かどうかは、ホームの郵便番号チェックでご確認いただけます。</div></div>
        </div>

        <Link href="/#faq" className="rt-g-faq"><HelpCircle size={18} strokeWidth={2.2} />よくあるご質問を見る<ChevronRight size={16} strokeWidth={2.6} /></Link>

        <div className="rt-g-cta">
          <div className="rt-g-cta-t">まずは料金を確認してみましょう</div>
          <div className="rt-g-cta-btns">
            <Link href="/simulator" className="rt-g-cta-main"><Calendar size={18} strokeWidth={2.3} />料金シミュレーター</Link>
            <a href={`tel:${tel}`} className="rt-g-cta-tel"><Phone size={18} strokeWidth={2.3} />お電話で相談</a>
          </div>
        </div>

        <div style={{ height: 96 }} />
      </div>

      <div className="rt-bottom"><BottomNav active="home" /></div>
    </div>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-title-row{display:flex;align-items:center;gap:10px;padding:16px 2px 12px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;}
.rt-page-title{font-size:24px;font-weight:900;letter-spacing:.01em;margin:0;}
.rt-lead{display:flex;align-items:flex-start;gap:9px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:12px;padding:13px;margin-bottom:20px;font-size:12.5px;color:var(--ink-2);font-weight:600;line-height:1.65;}
.rt-lead svg{color:var(--red);flex:none;margin-top:1px;}
.rt-g-h{font-size:18px;font-weight:900;margin:0 0 12px;letter-spacing:.01em;}
.rt-g-steps{display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-g-step{display:flex;gap:12px;padding-bottom:16px;position:relative;}
.rt-g-step:not(.last):before{content:"";position:absolute;left:19px;top:42px;bottom:0;width:2px;background:var(--line);}
.rt-g-step.last{padding-bottom:0;}
.rt-g-step-ico{flex:none;width:40px;height:40px;border-radius:11px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;z-index:1;}
.rt-g-step-t{font-size:14.5px;font-weight:900;margin-bottom:4px;}
.rt-g-step-d{font-size:12.5px;color:var(--ink-2);font-weight:600;line-height:1.6;margin:0;}
.rt-g-cards{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;}
.rt-g-card{display:flex;gap:11px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:var(--shadow);}
.rt-g-card-ico{flex:none;width:30px;height:30px;border-radius:50%;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center;}
.rt-g-card-ico.prep{background:var(--red-soft);color:var(--red);}
.rt-g-card-t{font-size:13.5px;font-weight:900;margin-bottom:3px;}
.rt-g-card-d{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;margin:0;}
.rt-g-info{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:20px;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:13px;}
.rt-g-info-row{display:flex;align-items:flex-start;gap:9px;font-size:12.5px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-g-info-row svg{color:var(--red);flex:none;margin-top:2px;}
.rt-g-info-row b{color:var(--ink);font-weight:800;}
.rt-g-faq{display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:14px;font-size:13.5px;font-weight:800;color:var(--ink);text-decoration:none;margin-bottom:22px;}
.rt-g-faq svg:first-child{color:var(--red);}
.rt-g-faq svg:last-child{color:var(--ink-3);margin-left:auto;}
.rt-g-cta{background:linear-gradient(180deg,var(--red-soft-2),var(--red-soft));border:1px solid #F5DAD8;border-radius:16px;padding:16px;text-align:center;}
.rt-g-cta-t{font-size:14px;font-weight:900;margin-bottom:12px;}
.rt-g-cta-btns{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.rt-g-cta-main,.rt-g-cta-tel{display:flex;align-items:center;justify-content:center;gap:6px;border-radius:12px;padding:13px 8px;font-size:13.5px;font-weight:900;text-decoration:none;}
.rt-g-cta-main{background:var(--red);color:#fff;}
.rt-g-cta-tel{background:#3A5876;color:#fff;}
`;
