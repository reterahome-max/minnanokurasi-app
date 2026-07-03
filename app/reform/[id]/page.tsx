"use client";

import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, notFound } from "next/navigation";
import {
  ArrowLeft, ChevronRight, ChevronLeft,
  ShieldCheck, Check, Ruler, Minus, Plus, Wrench, Layers, PaintRoller, Sparkles,
  Calculator, Info,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";
import BeforeAfter from "@/components/BeforeAfter";
import { useReform, quoteFor, needsInput, defaultVal } from "@/context/ReformContext";
import { getReformItem, type ReformItem } from "@/lib/reformPricing";

/**
 * RE:TERA HOME — リフォーム工事 詳細
 * RETERA_ReformDetail.jsx を移植（UIはクリーニング詳細と同一の器）。
 * 価格は【税抜】・材料費/施工費込み・諸経費15%は内部上乗せ（非表示）。
 * 簡易概算は lib/reformPricing の quote() に接続（ベタ書き計算は排除）。
 * 正式見積はシミュレーターに集約（CTA「詳しい見積もりへ進む」→ この工事をカートに積んで遷移）。
 */

const num = (n: number) => n.toLocaleString("ja-JP");


// 作業ステップ（クロスは Artifact 準拠、その他は汎用）
const STEPS_CLOTH = [
  { t: "既存クロス\n剥がし", icon: Layers }, { t: "下地\nパテ処理", icon: Wrench },
  { t: "新規クロス\n貼り付け", icon: PaintRoller }, { t: "清掃・\n仕上げ確認", icon: Sparkles },
];
const STEPS_GENERIC = [
  { t: "養生・\n準備", icon: Wrench }, { t: "既存\n撤去", icon: Layers },
  { t: "新規\n施工", icon: PaintRoller }, { t: "清掃・\n仕上げ確認", icon: Sparkles },
];
const MERITS_CLOTH = [
  "お部屋の印象が明るく一新",
  "ヤニ・汚れ・小さな傷をリセット",
  "防カビ・消臭など機能性クロスも選択可",
  "退去前の原状回復にも最適",
];
const MERITS_GENERIC = [
  "材料費・施工費込みの明朗価格",
  "経験豊富な職人が丁寧に施工",
  "住みながらの工事もご相談OK",
  "原状回復・空室対策にも最適",
];

// method 別のヘッダー価格表示
const priceView = (it: ReformItem): { label: string; value: string; unit: string } => {
  switch (it.method) {
    case "area":   return { label: "単価（税抜）", value: num(it.unitPrice ?? 0), unit: `円/${it.unitLabel}` };
    case "unit":   return { label: "単価（税抜）", value: num(it.unitPrice ?? 0), unit: `円/${it.unitLabel}` };
    case "tiered": return { label: "料金（税抜）", value: num(it.tiers?.[0].price ?? 0), unit: "円〜" };
    case "set":    return { label: "料金（税抜）", value: num(it.setPrice ?? 0), unit: "円〜" };
    case "small":  return { label: "料金（税抜）", value: num(35000), unit: `円/${it.unitLabel}` };
  }
};

// サムネのキー（一覧と同じ対応）
const imgOf = (it: ReformItem) =>
  it.cat === "クロス" ? "cloth" : it.cat === "床" ? "floor" : it.cat === "水回り" ? "toilet"
  : it.cat === "補修" ? "patch" : it.id.startsWith("net") ? "net" : "door";

// 工事アイテム別の実写真ビフォーアフター（未掲載アイテムは欄ごと非表示）
const REFORM_BA: Record<string, { before: string; after: string }> = {
  cloth_std:      { before: "ba_cloth_before", after: "ba_cloth_after" },
  cloth_high:     { before: "ba_cloth_before", after: "ba_cloth_after" },
  fl_room:        { before: "ba_floor_before", after: "ba_floor_after" },
  cf_room:        { before: "ba_cf_before",    after: "ba_cf_after" },
  ft_room:        { before: "ba_ftile_before", after: "ba_ftile_after" },
  net_window:     { before: "ba_net_before",   after: "ba_net_after" },
  toilet_toto_qr: { before: "ba_toilet_before", after: "ba_toilet_after" },
};

export default function ReformDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { addItem } = useReform();
  const item = getReformItem(decodeURIComponent(params.id));
  if (!item) notFound();
  const it = item!;

  const [val, setVal] = useState(defaultVal(it));
  const r = quoteFor(it, val);
  const pv = priceView(it);
  const isArea = it.method === "area";
  const showInput = needsInput(it);
  const steps = it.cat === "クロス" ? STEPS_CLOTH : STEPS_GENERIC;
  const merits = it.cat === "クロス" ? MERITS_CLOTH : MERITS_GENERIC;
  const tagText = r.isMinimum ? "最低施工料金" : r.isSmallSpace ? "小空間一式" : null;

  const handleCta = () => {
    addItem(it.id, val);
    router.push("/reform/simulator");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header tag="リフォーム" />

        <div className="rt-title-row">
          <Link href="/reform" className="rt-back"><ArrowLeft size={20} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">{it.title}</h1>
        </div>

        <div className="rt-detail-hero"><Photo srcKey={imgOf(it)} alt={it.title} /></div>

        <div className="rt-detail-head">
          <div className="rt-detail-info">
            <h2 className="rt-detail-name">{it.title}</h2>
            <p className="rt-detail-desc">{it.cat === "クロス" ? "お部屋の壁紙を張り替えて、空間をまるごとリフレッシュ。" : "材料費・施工費込みの明朗価格で、丁寧に施工します。"}</p>
          </div>
          <div className="rt-detail-price">
            <div className="rt-detail-price-l">{pv.label}</div>
            <div className="rt-detail-price-v">{pv.value}<span>{pv.unit}</span></div>
          </div>
        </div>

        <div className="rt-badges">
          <div className="rt-badge"><div className="rt-badge-ico">¥</div><div><div className="rt-badge-t">材料・施工費込み</div><div className="rt-badge-d">通常養生・廃材処分も価格に含みます</div></div></div>
          {isArea ? (
            <div className="rt-badge"><div className="rt-badge-ico"><Ruler size={18} strokeWidth={2.4} /></div><div><div className="rt-badge-t">10㎡以上から㎡単価</div><div className="rt-badge-d">10㎡未満は最低施工料金となります</div></div></div>
          ) : (
            <div className="rt-badge"><div className="rt-badge-ico"><Ruler size={18} strokeWidth={2.4} /></div><div><div className="rt-badge-t">1{it.unitLabel}から対応</div><div className="rt-badge-d">{it.note ?? "小規模のご依頼もお気軽にどうぞ"}</div></div></div>
          )}
          <div className="rt-badge"><div className="rt-badge-ico"><ShieldCheck size={18} strokeWidth={2.4} /></div><div><div className="rt-badge-t">損害保険加入</div><div className="rt-badge-d">万が一の際も安心の損害保険に加入済み</div></div></div>
        </div>

        <div className="rt-sec-h">作業内容 <span>（すべて料金に含まれます）</span></div>
        <div className="rt-steps">
          {steps.map((s, i) => { const Icon = s.icon; return (
            <Fragment key={i}>
              <div className="rt-step"><div className="rt-step-ico"><Icon size={20} strokeWidth={2} /></div><div className="rt-step-t">{s.t}</div></div>
              {i < steps.length - 1 && <ChevronRight size={14} className="rt-step-arrow" />}
            </Fragment>
          ); })}
        </div>

        {/* ── 簡易概算（quote() 接続） ── */}
        <div className="rt-sec-h">かんたん概算 <span>{isArea ? "（面積を入れると目安がわかります）" : showInput ? "（数量を入れると目安がわかります）" : "（固定価格の目安です）"}</span></div>
        <div className="rt-estimate">
          {showInput && (
            <div className="rt-est-inp">
              <label className="rt-est-l"><Ruler size={15} strokeWidth={2.2} />{isArea ? "施工面積" : "数量"}</label>
              <div className="rt-est-field">
                <button className="rt-est-btn" onClick={() => setVal((a) => Math.max(isArea ? 0 : 1, a - 1))}><Minus size={16} strokeWidth={2.4} /></button>
                <input className="rt-est-num" type="number" min={isArea ? 0 : 1} value={val} onChange={(e) => setVal(Math.min(500, Math.max(0, Number(e.target.value))))} />
                <span className="rt-est-unit">{isArea ? "㎡" : it.unitLabel}</span>
                <button className="rt-est-btn" onClick={() => setVal((a) => Math.min(500, a + 1))}><Plus size={16} strokeWidth={2.4} /></button>
              </div>
            </div>
          )}
          <div className="rt-est-result">
            <div className="rt-est-result-l">概算価格（税抜）</div>
            <div className="rt-est-result-v">{r.total != null ? <>{num(r.total)}<b>円</b></> : "—"}</div>
          </div>
          {tagText && <div className="rt-est-tag">{tagText}が適用されています</div>}
          <div className="rt-est-note"><Info size={13} strokeWidth={2.2} />目安金額です。下地の状態などにより変動します。</div>
        </div>

        {REFORM_BA[it.id] && (
          <>
            <div className="rt-sec-h">ビフォーアフター</div>
            <BeforeAfter beforeKey={REFORM_BA[it.id].before} afterKey={REFORM_BA[it.id].after} alt={it.title} />
            <div className="rt-cmp-hint"><ChevronLeft size={13} strokeWidth={2.6} />つまみを左右にドラッグして比較<ChevronRight size={13} strokeWidth={2.6} /></div>
          </>
        )}

        <div className="rt-bottom-grid">
          <div className="rt-merit">
            <div className="rt-block-h">ご利用のメリット</div>
            <ul className="rt-merit-list">{merits.map((m, i) => <li key={i}><Check size={14} strokeWidth={3} />{m}</li>)}</ul>
          </div>
          <div className="rt-voice">
            <div className="rt-block-h">お客様の声</div>
            <div className="rt-voice-score"><div className="rt-voice-l">ご利用の声</div><div className="rt-voice-cnt">掲載準備中です</div></div>
            <div className="rt-voice-bubble">着工前に内容と金額をご説明し、施工後は仕上がりを一緒にご確認いただいています。</div>
          </div>
        </div>

        <div className="rt-disc"><Info size={14} strokeWidth={2.2} /><div>価格は税抜・材料費・施工費込みです。駐車場代は別途実費。下地の著しい劣化・腐食・カビ、階段工事は別途お見積り／対応外となります。</div></div>

        <div style={{ height: 96 }} />
      </div>

      <div className="rt-bottom">
        <button className="rt-cta-bar" onClick={handleCta}><Calculator size={20} strokeWidth={2.3} />詳しい見積もりへ進む</button>
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
.rt-detail-price-v{font-size:26px;font-weight:900;color:var(--red);line-height:1.05;}
.rt-detail-price-v span{font-size:13px;margin-left:1px;}
.rt-badges{display:flex;flex-direction:column;gap:8px;margin-bottom:20px;}
.rt-badge{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:12px;box-shadow:var(--shadow);}
.rt-badge-ico{width:40px;height:40px;border-radius:50%;border:2px solid var(--red);color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex:none;}
.rt-badge-t{font-size:13.5px;font-weight:900;}
.rt-badge-d{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:2px;line-height:1.45;}
.rt-sec-h{font-size:16px;font-weight:900;margin:0 0 12px;}
.rt-sec-h span{font-size:11.5px;color:var(--ink-3);font-weight:600;}
.rt-steps{display:flex;align-items:stretch;overflow-x:auto;scrollbar-width:none;gap:1px;margin-bottom:22px;padding-bottom:4px;}
.rt-steps::-webkit-scrollbar{display:none;}
.rt-step{flex:none;width:80px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;}
.rt-step-ico{width:50px;height:50px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-step-t{font-size:10.5px;font-weight:700;color:var(--ink);line-height:1.3;white-space:pre-line;}
.rt-step-arrow{color:var(--ink-3);align-self:flex-start;margin-top:18px;flex:none;}
.rt-estimate{background:#fff;border:1px solid var(--line);border-radius:14px;padding:15px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-est-inp{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;}
.rt-est-l{display:flex;align-items:center;gap:5px;font-size:13.5px;font-weight:800;color:var(--ink-2);}
.rt-est-l svg{color:var(--red);}
.rt-est-field{display:flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:4px;}
.rt-est-btn{width:36px;height:36px;border-radius:8px;border:none;background:#fff;color:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-est-num{width:56px;background:none;border:none;font-size:18px;font-weight:900;color:var(--ink);text-align:center;outline:none;font-family:inherit;}
.rt-est-unit{font-size:14px;font-weight:800;color:var(--ink-2);}
.rt-est-result{display:flex;align-items:flex-end;justify-content:space-between;background:var(--red-soft-2);border-radius:12px;padding:14px;}
.rt-est-result-l{font-size:12px;font-weight:800;color:var(--ink-2);}
.rt-est-result-v{font-size:26px;font-weight:900;color:var(--red);line-height:1;}
.rt-est-result-v b{font-size:15px;margin-left:1px;}
.rt-est-tag{font-size:11px;font-weight:800;color:var(--blue);margin-top:8px;}
.rt-est-note{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink-3);font-weight:600;margin-top:10px;}
.rt-est-note svg{color:var(--ink-3);flex:none;}
.rt-cmp{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;background:#EDF1F3;}
.rt-cmp-layer{position:absolute;inset:0;}
.rt-cmp-badge{position:absolute;top:9px;z-index:3;font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:6px;}
.rt-cmp-before{left:9px;background:rgba(40,44,48,.82);}
.rt-cmp-after{right:9px;background:var(--red);}
.rt-cmp-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-1.5px);z-index:4;box-shadow:0 0 0 1px rgba(0,0,0,.1);}
.rt-cmp-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;color:var(--red);box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:ew-resize;}
.rt-cmp-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink-3);margin:10px 0 22px;}
.rt-cmp-hint svg{color:var(--red);}
.rt-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:16px;}
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
.rt-disc{display:flex;align-items:flex-start;gap:8px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;box-shadow:var(--shadow);}
.rt-disc svg{color:var(--red);flex:none;margin-top:1px;}
.rt-disc div{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.7;}
.rt-cta-bar{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;padding:16px 14px;font-size:17px;font-weight:900;letter-spacing:.03em;cursor:pointer;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-cta-bar:hover{background:var(--red-deep);}
`;
