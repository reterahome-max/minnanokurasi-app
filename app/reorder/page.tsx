"use client";

import Link from "next/link";
import {
  ArrowLeft, RotateCcw, Calendar, ChevronRight, Repeat, Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";

/**
 * RE:TERA HOME — もう一度予約（利用履歴からの再予約＋定期プラン提案）
 * RETERA_Reorder.jsx を移植。「同じ内容で予約」→ /simulator へ。
 */
const HISTORY = [
  { img: "ac", title: "壁掛けエアコンクリーニング × 2台", opt: "防カビ・抗菌コート", last: "前回 2025年7月", price: "19,800", recommend: true },
  { img: "bath", title: "浴室クリーニング", opt: null, last: "前回 2025年5月", price: "16,000", recommend: false },
  { img: "hood", title: "レンジフードクリーニング", opt: null, last: "前回 2025年3月", price: "13,000", recommend: false },
];

export default function Reorder() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/mypage" className="rt-back"><ArrowLeft size={20} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">もう一度予約</h1>
        </div>
        <p className="rt-lead">過去のご利用内容から、ワンタップで再予約できます。</p>

        <div className="rt-plan">
          <div className="rt-plan-badge"><Sparkles size={13} strokeWidth={2.6} />おすすめ</div>
          <div className="rt-plan-t">定期プランで、いつもキレイに。</div>
          <div className="rt-plan-d">年2回（夏・冬前）の自動予約で、毎回 <b>10%オフ</b>。予約の手間もゼロに。</div>
          <button className="rt-plan-btn"><Repeat size={17} strokeWidth={2.3} />定期プランを見る<ChevronRight size={16} strokeWidth={2.6} className="rt-plan-cv" /></button>
        </div>

        <div className="rt-sec-h">これまでのご利用</div>
        <div className="rt-list">
          {HISTORY.map((h, i) => (
            <div className={"rt-hist" + (h.recommend ? " rec" : "")} key={i}>
              {h.recommend && <div className="rt-hist-rec">そろそろ時期です</div>}
              <div className="rt-hist-top">
                <div className="rt-hist-photo"><Photo srcKey={h.img} alt={h.title} /></div>
                <div className="rt-hist-info">
                  <div className="rt-hist-title">{h.title}</div>
                  {h.opt && <span className="rt-hist-opt">＋{h.opt}</span>}
                  <div className="rt-hist-last"><Calendar size={13} strokeWidth={2.2} />{h.last}</div>
                  <div className="rt-hist-price">{h.price}<b>円〜</b></div>
                </div>
              </div>
              <Link href="/booking/date" className="rt-hist-btn"><RotateCcw size={16} strokeWidth={2.3} />同じ内容で予約する<ChevronRight size={15} strokeWidth={2.6} className="rt-hist-cv" /></Link>
            </div>
          ))}
        </div>

        <div style={{ height: 84 }} />
      </div>

      <div className="rt-bottom"><BottomNav active="orders" /></div>
    </div>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-title-row{display:flex;align-items:center;gap:9px;padding:16px 2px 4px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-page-title{font-size:22px;font-weight:900;margin:0;}
.rt-lead{font-size:12.5px;color:var(--ink-2);font-weight:600;margin:0 2px 16px;}
.rt-plan{position:relative;background:linear-gradient(135deg,#15414B,#0C2A33);border-radius:16px;padding:18px 16px;margin-bottom:20px;color:#fff;overflow:hidden;}
.rt-plan-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:#15414B;background:#fff;padding:4px 10px;border-radius:999px;margin-bottom:10px;}
.rt-plan-t{font-size:18px;font-weight:900;margin-bottom:7px;}
.rt-plan-d{font-size:12px;font-weight:600;line-height:1.6;color:rgba(255,255,255,.85);margin-bottom:14px;}
.rt-plan-d b{color:#fff;font-size:14px;}
.rt-plan-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;color:#15414B;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:900;cursor:pointer;}
.rt-plan-cv{position:absolute;right:14px;}
.rt-sec-h{font-size:16px;font-weight:900;margin:0 0 12px;}
.rt-list{display:flex;flex-direction:column;gap:11px;}
.rt-hist{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--shadow);}
.rt-hist.rec{border-color:var(--red);}
.rt-hist-rec{display:inline-block;font-size:11px;font-weight:800;color:#fff;background:var(--red);padding:4px 11px;border-radius:7px;margin-bottom:11px;}
.rt-hist-top{display:flex;gap:12px;margin-bottom:12px;}
.rt-hist-photo{flex:none;width:84px;height:84px;border-radius:11px;overflow:hidden;background:#EDF1F3;}
.rt-hist-info{flex:1;min-width:0;}
.rt-hist-title{font-size:14.5px;font-weight:900;line-height:1.3;margin-bottom:6px;}
.rt-hist-opt{display:inline-block;font-size:10.5px;font-weight:700;color:var(--red);background:var(--red-soft);border-radius:6px;padding:3px 8px;margin-bottom:7px;}
.rt-hist-last{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--ink-2);font-weight:600;margin-bottom:7px;}
.rt-hist-last svg{color:var(--ink-3);}
.rt-hist-price{font-size:20px;font-weight:900;color:var(--red);line-height:1;}
.rt-hist-price b{font-size:13px;margin-left:1px;}
.rt-hist-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:900;cursor:pointer;text-decoration:none;}
.rt-hist-btn:hover{background:var(--red-deep);}
.rt-hist-cv{position:absolute;right:14px;}
`;
