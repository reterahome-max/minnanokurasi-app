"use client";

import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  Clock, ShieldCheck, Check, Wrench, Filter, Layers, Fan, Droplets, Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";
import BeforeAfter from "@/components/BeforeAfter";
import { useBooking } from "@/context/BookingContext";
import { getService, optionsFor, num } from "@/lib/pricing";

/**
 * RE:TERA HOME — サービス詳細
 * RETERA_ServiceDetail.jsx を移植。サービス・オプション・価格は lib/pricing を参照。
 * 「この内容で料金を見る」で選択を BookingContext に保存し /simulator へ。
 */


const STEPS = [
  { t: "本体カバー\n分解洗浄", icon: Wrench }, { t: "フィルター\n洗浄", icon: Filter },
  { t: "熱交換器\n高圧洗浄", icon: Layers }, { t: "送風ファン\n洗浄", icon: Fan },
  { t: "ドレンパン\n洗浄", icon: Droplets }, { t: "動作確認\n簡易清掃", icon: Check },
];
const MERITS = [
  "カビ・ホコリを徹底除去し、空気がキレイに", "イヤなニオイを解消し、快適な室内環境に",
  "冷暖房効率がUPし、電気代の節約にも", "定期的なお手入れで、エアコンが長持ち",
];

export default function ServiceDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const { set } = useBooking();
  const svc = getService(id);
  if (!svc) notFound();

  const options = optionsFor(id);
  const [opt, setOpt] = useState<Record<string, boolean>>({});
  const base = svc!.price;
  const optTotal = options.reduce((s, o) => s + (opt[o.id] ? o.price : 0), 0);
  const total = base + optTotal;

  const handleCta = () => {
    set({ serviceId: svc!.id, optionIds: options.filter((o) => opt[o.id]).map((o) => o.id) });
    router.push("/simulator");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/services" className="rt-back"><ArrowLeft size={20} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">{svc!.title}</h1>
        </div>

        <div className="rt-detail-hero"><Photo srcKey={svc!.img} alt={svc!.title + "の様子"} /></div>

        <div className="rt-detail-head">
          <div className="rt-detail-info">
            <h2 className="rt-detail-name">{svc!.title}</h2>
            <p className="rt-detail-desc">{svc!.desc}。清潔で快適な毎日を。</p>
          </div>
          <div className="rt-detail-price">
            <div className="rt-detail-price-l">料金（税込）</div>
            <div className="rt-detail-price-v">{num(base)}<span>円〜</span></div>
          </div>
        </div>

        <div className="rt-badges">
          <div className="rt-badge"><div className="rt-badge-ico">¥</div><div><div className="rt-badge-t">追加料金なし</div><div className="rt-badge-d">見積り後の追加請求は一切ありません</div></div></div>
          <div className="rt-badge"><div className="rt-badge-ico"><Clock size={18} strokeWidth={2.4} /></div><div><div className="rt-badge-t">作業時間 約60〜90分</div><div className="rt-badge-d">機種・汚れ具合により前後します</div></div></div>
          <div className="rt-badge"><div className="rt-badge-ico"><ShieldCheck size={18} strokeWidth={2.4} /></div><div><div className="rt-badge-t">損害保険加入</div><div className="rt-badge-d">万が一の時も安心の損害保険に加入済み</div></div></div>
        </div>

        <div className="rt-sec-h">作業内容 <span>（すべて料金に含まれます）</span></div>
        <div className="rt-steps">
          {STEPS.map((s, i) => { const Icon = s.icon; return (
            <Fragment key={i}>
              <div className="rt-step"><div className="rt-step-ico"><Icon size={20} strokeWidth={2} /></div><div className="rt-step-t">{s.t}</div></div>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="rt-step-arrow" />}
            </Fragment>
          ); })}
        </div>

        {options.length > 0 && (
          <>
            <div className="rt-sec-h">オプション <span>（追加でさらに快適に）</span></div>
            <div className="rt-opts">
              {options.map((o) => {
                const on = !!opt[o.id];
                return (
                  <button key={o.id} className={"rt-opt" + (on ? " rt-opt-on" : "")} onClick={() => setOpt((p) => ({ ...p, [o.id]: !p[o.id] }))}>
                    <div className="rt-opt-body">
                      <div className="rt-opt-name">{o.name}</div>
                      <div className="rt-opt-desc">{o.desc}</div>
                      <div className="rt-opt-price">+{num(o.price)}円〜</div>
                    </div>
                    <div className={"rt-check" + (on ? " rt-check-on" : "")}>{on && <Check size={14} strokeWidth={3} />}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="rt-estimate">
          <div className="rt-est-h">料金目安</div>
          <div className="rt-est-row">
            <div className="rt-est-col"><div className="rt-est-l">基本料金（{svc!.short}）</div><div className="rt-est-v">{num(base)}<span>円〜</span></div></div>
            <ChevronRight size={16} className="rt-est-arrow" />
            <div className="rt-est-col"><div className="rt-est-l">オプション</div><div className="rt-est-v2">+{num(optTotal)}<span>円〜</span></div></div>
            <ChevronRight size={16} className="rt-est-arrow" />
            <div className="rt-est-col"><div className="rt-est-l">合計目安</div><div className="rt-est-v">{num(total)}<span>円〜</span></div></div>
          </div>
          <div className="rt-est-note">※機種・汚れ具合により料金が変動する場合があります。</div>
        </div>

        <div className="rt-sec-h">ビフォーアフター</div>
        <BeforeAfter beforeKey="ba_ac_before" afterKey="ba_ac_after" alt={svc!.title} beforeSuffix=" 作業前" afterSuffix=" 作業後" />
        <div className="rt-cmp-hint"><ChevronLeft size={13} strokeWidth={2.6} />つまみを左右にドラッグして比較<ChevronRight size={13} strokeWidth={2.6} /></div>

        <div className="rt-bottom-grid">
          <div className="rt-merit">
            <div className="rt-block-h">ご利用のメリット</div>
            <ul className="rt-merit-list">{MERITS.map((m, i) => <li key={i}><Check size={14} strokeWidth={3} />{m}</li>)}</ul>
          </div>
          <div className="rt-voice">
            <div className="rt-block-h">お客様の声</div>
            <div className="rt-voice-score"><div className="rt-voice-l">ご利用の声</div><div className="rt-voice-cnt">掲載準備中です</div></div>
            <div className="rt-voice-bubble">作業完了後、お客様と一緒に仕上がりをご確認いただいています。気になる点はその場でご対応します。</div>
          </div>
        </div>

        <div style={{ height: 96 }} />
      </div>

      <div className="rt-bottom">
        <button className="rt-cta-bar" onClick={handleCta}><Calendar size={20} strokeWidth={2.3} />この内容で料金を見る</button>
        <BottomNav active="home" />
      </div>
    </div>
  );
}

const styles = `
.rt-title-row{display:flex;align-items:center;gap:9px;padding:8px 2px 12px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-page-title{font-size:18px;font-weight:900;margin:0;}
.rt-detail-hero{height:200px;border-radius:16px;overflow:hidden;margin-bottom:14px;background:#EDF1F3;}
.rt-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;}
.rt-detail-name{font-size:21px;font-weight:900;margin:0 0 6px;line-height:1.25;}
.rt-detail-desc{font-size:12.5px;color:var(--ink-2);font-weight:600;margin:0;line-height:1.5;}
.rt-detail-price{text-align:right;flex:none;}
.rt-detail-price-l{font-size:10.5px;color:var(--ink-2);font-weight:700;}
.rt-detail-price-v{font-size:27px;font-weight:900;color:var(--red);line-height:1.05;}
.rt-detail-price-v span{font-size:14px;margin-left:1px;}
.rt-badges{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.rt-badge{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:12px;box-shadow:var(--shadow);}
.rt-badge-ico{width:40px;height:40px;border-radius:50%;border:2px solid var(--red);color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex:none;}
.rt-badge-t{font-size:13.5px;font-weight:900;}
.rt-badge-d{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:2px;line-height:1.45;}
.rt-sec-h{font-size:16px;font-weight:900;margin:0 0 12px;}
.rt-sec-h span{font-size:11.5px;color:var(--ink-3);font-weight:600;}
.rt-steps{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;gap:1px;margin-bottom:22px;padding-bottom:4px;}
.rt-steps::-webkit-scrollbar{display:none;}
.rt-step{flex:none;width:74px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.rt-step-ico{width:50px;height:50px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-step-t{font-size:10.5px;font-weight:700;color:var(--ink);line-height:1.3;white-space:pre-line;}
.rt-step-arrow{color:var(--ink-3);align-self:flex-start;margin-top:18px;flex:none;}
.rt-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.rt-opt{display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid var(--line);border-radius:13px;padding:13px;cursor:pointer;text-align:left;transition:border-color .15s;width:100%;}
.rt-opt-on{border-color:var(--red);background:var(--red-soft-2);}
.rt-opt-body{flex:1;min-width:0;}
.rt-opt-name{font-size:14px;font-weight:800;margin-bottom:3px;}
.rt-opt-desc{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;margin-bottom:5px;}
.rt-opt-price{font-size:14px;font-weight:900;color:var(--red);}
.rt-check{flex:none;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:center;color:#fff;}
.rt-check-on{background:var(--red);border-color:var(--red);}
.rt-estimate{background:#fff;border:1px solid var(--line);border-radius:14px;padding:15px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-est-h{font-size:14px;font-weight:900;margin-bottom:12px;}
.rt-est-row{display:flex;align-items:center;gap:4px;}
.rt-est-col{flex:1;min-width:0;text-align:center;}
.rt-est-l{font-size:10px;color:var(--ink-2);font-weight:700;margin-bottom:4px;line-height:1.3;}
.rt-est-v{font-size:18px;font-weight:900;color:var(--red);line-height:1;}
.rt-est-v span{font-size:11px;}
.rt-est-v2{font-size:16px;font-weight:900;color:var(--ink-2);line-height:1;}
.rt-est-v2 span{font-size:10px;}
.rt-est-arrow{color:var(--ink-3);flex:none;}
.rt-est-note{font-size:10.5px;color:var(--ink-3);font-weight:600;margin-top:12px;}
.rt-cmp{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;background:#EDF1F3;}
.rt-cmp-layer{position:absolute;inset:0;}
.rt-cmp-badge{position:absolute;top:9px;z-index:3;font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:6px;}
.rt-cmp-before{left:9px;background:rgba(40,44,48,.82);}
.rt-cmp-after{right:9px;background:var(--red);}
.rt-cmp-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-1.5px);z-index:4;box-shadow:0 0 0 1px rgba(0,0,0,.1);}
.rt-cmp-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;color:var(--red);box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:ew-resize;}
.rt-cmp-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink-3);margin:10px 0 22px;}
.rt-cmp-hint svg{color:var(--red);}
.rt-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.rt-block-h{font-size:14px;font-weight:900;margin-bottom:10px;}
.rt-merit{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:var(--shadow);}
.rt-merit-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;}
.rt-merit-list li{display:flex;align-items:flex-start;gap:6px;font-size:11.5px;font-weight:700;color:var(--ink);line-height:1.4;}
.rt-merit-list svg{color:var(--red);flex:none;margin-top:2px;}
.rt-voice{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:var(--shadow);}
.rt-voice-score{margin-bottom:10px;}
.rt-voice-l{font-size:11px;color:var(--ink-2);font-weight:700;}
.rt-voice-v{font-size:30px;font-weight:900;color:var(--red);line-height:1;}
.rt-voice-stars{display:flex;gap:1px;color:var(--gold);margin:3px 0;}
.rt-voice-cnt{font-size:10px;color:var(--ink-3);font-weight:600;}
.rt-voice-bubble{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.6;background:var(--red-soft-2);border-radius:10px;padding:10px;}
.rt-voice-who{font-size:10px;color:var(--ink-3);margin-top:6px;}
.rt-cta-bar{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;padding:16px 14px;font-size:17px;font-weight:900;letter-spacing:.03em;cursor:pointer;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-cta-bar:hover{background:var(--red-deep);}
`;
