"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronDown, Plus, Minus, Trash2, Ruler,
  ShieldCheck, UserCheck, ClipboardCheck, Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useReform, needsInput, valLabel } from "@/context/ReformContext";
import { useBooking } from "@/context/BookingContext";
import { REFORM_ITEMS } from "@/lib/reformPricing";

/**
 * RE:TERA HOME — リフォーム見積シミュレーター（複数工事カート方式）
 * RETERA_ReformSimulator.jsx を移植。金額は全て lib/reformPricing の quote()（税抜）。
 * 諸経費15%は内部上乗せのまま非表示。合計は税抜主・税込参考併記（×1.1）。
 * CTA分岐：全て bookable → クリーニング予約フローに合流／概算あり → /reform/survey。
 */
const num = (n: number) => n.toLocaleString("ja-JP");

export default function ReformSimulator() {
  const router = useRouter();
  const { cart, rows, net, incl, hasSurvey, allBookable, addItem, removeItem, setVal } = useReform();
  const { set } = useBooking();
  const [pickOpen, setPickOpen] = useState(false);

  const add = (id: string) => { addItem(id); setPickOpen(false); };

  // 全て確定工事 → 予約フローへ合流（内容と金額を予約データに載せる。出所は reformPricing・税抜）
  const goBooking = () => {
    set({
      reform: { items: cart.map(({ id, val }) => ({ id, val })), net, incl },
      day: null,
      slot: null,
      bookingNo: null,
    });
    router.push("/booking/date");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header tag="リフォーム見積" />

        {/* ステップ */}
        <div className="rt-steps">
          <div className="rt-step"><div className="rt-step-n on">1</div><div className="rt-step-l on">工事を選ぶ</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className="rt-step-n">2</div><div className="rt-step-l">内容確認</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className="rt-step-n">3</div><div className="rt-step-l">申込</div></div>
        </div>

        <div className="rt-q"><span className="rt-q-t">工事を追加する</span><span className="rt-any">複数まとめてOK</span></div>

        {/* カート */}
        {rows.length === 0 && (
          <div className="rt-empty"><Ruler size={26} strokeWidth={1.6} /><div>工事を追加すると、ここに概算が表示されます。</div></div>
        )}
        <div className="rt-cart">
          {rows.map((r) => {
            const tag = r.q.isMinimum ? "最低料金" : r.q.isSmallSpace ? "一式" : null;
            return (
              <div className="rt-item" key={r.uid}>
                <div className="rt-item-top">
                  <div className="rt-item-info">
                    <div className="rt-item-title">{r.item.title}</div>
                    <div className="rt-item-meta">
                      {r.item.bookable ? <span className="rt-tag book">価格確定</span> : <span className="rt-tag survey">現地調査</span>}
                      {tag && <span className="rt-tag muted">{tag}</span>}
                    </div>
                  </div>
                  <button className="rt-del" onClick={() => removeItem(r.uid)} aria-label="削除"><Trash2 size={17} strokeWidth={2.2} /></button>
                </div>
                <div className="rt-item-bot">
                  {needsInput(r.item) ? (
                    <div className="rt-field">
                      <span className="rt-field-l">{r.item.method === "area" ? "施工面積" : "数量"}</span>
                      <div className="rt-stepper">
                        <button onClick={() => setVal(r.uid, r.val - 1)} disabled={r.val <= (r.item.method === "area" ? 0 : 1)}><Minus size={15} strokeWidth={2.4} /></button>
                        <input type="number" min={r.item.method === "area" ? 0 : 1} value={r.val} onChange={(e) => setVal(r.uid, Number(e.target.value))} />
                        <span className="rt-field-u">{valLabel(r.item)}</span>
                        <button onClick={() => setVal(r.uid, r.val + 1)}><Plus size={15} strokeWidth={2.4} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="rt-field"><span className="rt-field-l">{r.item.method === "set" ? "1台" : "1式"}</span></div>
                  )}
                  <div className="rt-item-price">{num(r.total)}<span>円</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 追加ボタン／ピッカー */}
        <button className="rt-add" onClick={() => setPickOpen((o) => !o)}>
          <Plus size={18} strokeWidth={2.4} />工事を追加<ChevronDown size={16} strokeWidth={2.4} style={{ marginLeft: "auto", transform: pickOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>
        {pickOpen && (
          <div className="rt-picker">
            {REFORM_ITEMS.map((it) => (
              <button key={it.id} className="rt-pick" onClick={() => add(it.id)}>
                <div className="rt-pick-info"><div className="rt-pick-title">{it.title}</div><div className="rt-pick-cat">{it.cat}</div></div>
                <Plus size={17} strokeWidth={2.4} className="rt-pick-add" />
              </button>
            ))}
          </div>
        )}

        {/* 合計（税抜主・税込併記） */}
        {rows.length > 0 && (
          <div className="rt-bill">
            <div className="rt-bill-h">お見積り</div>
            {rows.map((r) => (
              <div className="rt-bill-row" key={r.uid}><div className="rt-bill-l">{r.item.title}<br /><span>{needsInput(r.item) ? `${r.val}${valLabel(r.item)}` : (r.item.method === "set" ? "1台" : "1式")}</span></div><div className="rt-bill-v">{num(r.total)}円</div></div>
            ))}
            <div className="rt-bill-div" />
            <div className="rt-bill-total"><span>合計（税抜）</span><span className="rt-bill-total-v">{num(net)}<b>円</b></span></div>
            <div className="rt-bill-incl"><span>税込参考</span><span>{num(incl)}円</span></div>
            <div className="rt-bill-note">価格は税抜・材料費・施工費込みです。駐車場代は別途実費。現地状況により変動する場合があります。</div>
          </div>
        )}

        {/* 安心バッジ */}
        {rows.length > 0 && (
          <>
            <div className="rt-assure">
              <div className="rt-assure-card"><div className="rt-assure-ico">¥</div><div><div className="rt-assure-t">明朗会計</div><div className="rt-assure-d">材料費・施工費・通常養生・廃材処分込み</div></div></div>
              <div className="rt-assure-card"><div className="rt-assure-ico"><UserCheck size={20} strokeWidth={2.2} /></div><div><div className="rt-assure-t">事前に内容確認</div><div className="rt-assure-d">着工前に内容と金額をご説明します</div></div></div>
            </div>
            <div className="rt-assure-foot"><ShieldCheck size={15} strokeWidth={2.4} />下地の劣化・階段工事など特殊なケースは別途お見積りとなります。</div>
          </>
        )}

        <div style={{ height: 104 }} />
      </div>

      {/* CTA分岐 */}
      <div className="rt-bottom">
        {rows.length > 0 && (
          <div className="rt-bar-info-row">
            <div className="rt-bar-l">合計（税抜）</div>
            <div className="rt-bar-v">{num(net)}円 <small>税込 {num(incl)}円</small></div>
          </div>
        )}
        <div className="rt-bar">
          {allBookable ? (
            <button className="rt-cta" onClick={goBooking}><Calendar size={18} strokeWidth={2.3} />この内容で予約する<ChevronRight size={17} strokeWidth={2.6} /></button>
          ) : (
            <button className={"rt-cta" + (rows.length === 0 ? " off" : "")} disabled={rows.length === 0} onClick={() => router.push("/reform/survey")}>
              <ClipboardCheck size={18} strokeWidth={2.3} />{hasSurvey ? "現地調査を申し込む" : "工事を追加してください"}<ChevronRight size={17} strokeWidth={2.6} />
            </button>
          )}
        </div>
        <BottomNav active="simulator" />
      </div>
    </div>
  );
}

const styles = `
.rt-steps{display:flex;align-items:center;padding:14px 8px 18px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:30px;height:30px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-l{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--ink);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 4px 22px;}
.rt-q{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
.rt-q-t{font-size:17px;font-weight:900;}
.rt-any{font-size:10.5px;font-weight:700;color:var(--red);background:var(--red-soft);padding:3px 9px;border-radius:6px;}
.rt-empty{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;color:var(--ink-3);background:#fff;border:1px dashed var(--line);border-radius:14px;padding:30px 20px;margin-bottom:12px;font-size:12.5px;font-weight:600;}
.rt-cart{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;}
.rt-item{background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:var(--shadow);}
.rt-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;}
.rt-item-title{font-size:14px;font-weight:800;line-height:1.3;margin-bottom:6px;}
.rt-item-meta{display:flex;gap:6px;flex-wrap:wrap;}
.rt-tag{font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;}
.rt-tag.book{color:var(--green);background:var(--green-soft);}
.rt-tag.survey{color:var(--blue);background:var(--blue-soft);}
.rt-tag.muted{color:var(--ink-2);background:#EEF0F1;}
.rt-del{flex:none;background:none;border:none;color:var(--ink-3);cursor:pointer;padding:3px;}
.rt-item-bot{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.rt-field{display:flex;align-items:center;gap:9px;}
.rt-field-l{font-size:12px;font-weight:800;color:var(--ink-2);}
.rt-stepper{display:flex;align-items:center;gap:3px;background:var(--bg);border:1px solid var(--line);border-radius:9px;padding:3px;}
.rt-stepper button{width:32px;height:32px;border-radius:7px;border:none;background:#fff;color:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-stepper button:disabled{color:var(--ink-3);opacity:.5;}
.rt-stepper input{width:44px;background:none;border:none;text-align:center;font-size:16px;font-weight:900;color:var(--ink);outline:none;font-family:inherit;}
.rt-field-u{font-size:12px;font-weight:800;color:var(--ink-2);}
.rt-item-price{font-size:18px;font-weight:900;color:var(--red);white-space:nowrap;}
.rt-item-price span{font-size:12px;margin-left:1px;}
.rt-add{width:100%;display:flex;align-items:center;gap:8px;background:#fff;border:1.5px dashed var(--red);color:var(--red);border-radius:12px;padding:14px;font-size:14.5px;font-weight:800;cursor:pointer;margin-bottom:10px;}
.rt-picker{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-pick{width:100%;display:flex;align-items:center;gap:10px;background:none;border:none;border-bottom:1px solid var(--line);padding:13px 14px;cursor:pointer;text-align:left;}
.rt-pick:last-child{border-bottom:none;}
.rt-pick-info{flex:1;min-width:0;}
.rt-pick-title{font-size:13.5px;font-weight:800;}
.rt-pick-cat{font-size:10.5px;color:var(--ink-3);font-weight:700;margin-top:2px;}
.rt-pick-add{color:var(--red);flex:none;}
.rt-bill{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-bill-h{font-size:15px;font-weight:900;margin-bottom:14px;}
.rt-bill-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:11px;}
.rt-bill-l{font-size:13px;font-weight:700;line-height:1.4;}
.rt-bill-l span{font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-bill-v{font-size:14px;font-weight:800;flex:none;}
.rt-bill-div{height:1px;background:var(--line);margin:12px 0;}
.rt-bill-total{display:flex;align-items:center;justify-content:space-between;}
.rt-bill-total span:first-child{font-size:15px;font-weight:900;}
.rt-bill-total-v{font-size:28px;font-weight:900;color:var(--red);line-height:1;}
.rt-bill-total-v b{font-size:15px;margin-left:1px;}
.rt-bill-incl{display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:var(--ink-3);margin-top:6px;}
.rt-bill-note{font-size:10.5px;color:var(--ink-3);font-weight:600;line-height:1.6;margin-top:12px;}
.rt-assure{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px;}
.rt-assure-card{display:flex;align-items:flex-start;gap:9px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px;box-shadow:var(--shadow);}
.rt-assure-ico{flex:none;width:38px;height:38px;border-radius:50%;border:1.5px solid #F0CDCB;color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;}
.rt-assure-t{font-size:13px;font-weight:800;margin-bottom:3px;}
.rt-assure-d{font-size:10px;color:var(--ink-2);font-weight:600;line-height:1.45;}
.rt-assure-foot{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;font-weight:700;color:var(--ink-2);padding:8px 0;text-align:center;}
.rt-assure-foot svg{color:var(--red);flex:none;}
.rt-bar-info-row{display:flex;align-items:center;justify-content:space-between;background:#fff;border-top:1px solid var(--line);padding:9px 16px;}
.rt-bar-l{font-size:11px;color:var(--ink-3);font-weight:700;}
.rt-bar-v{font-size:18px;font-weight:900;color:var(--red);}
.rt-bar-v small{font-size:11px;color:var(--ink-3);font-weight:700;margin-left:5px;}
.rt-bar{background:#fff;border-top:1px solid var(--line);padding:11px 14px;}
.rt-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:900;cursor:pointer;}
.rt-cta:hover{background:var(--red-deep);}
.rt-cta.off{background:#C8CCD0;cursor:not-allowed;}
`;
