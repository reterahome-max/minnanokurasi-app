"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronRight, ChevronLeft, Clock, MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useBooking } from "@/context/BookingContext";
import { getService, calcBill, num } from "@/lib/pricing";
import { fetchMonthAvailability } from "@/lib/firestore";
import {
  WEEK, SLOTS, AVAIL, CAL_FIRST_WEEKDAY, CAL_DAYS_IN_MONTH, CAL_MONTH_LABEL,
  shortDateLabel,
} from "@/lib/booking";

/**
 * RE:TERA HOME — 日時選択（STEP3 → 予約確定の手前）
 * RETERA_DateSelect.jsx を移植。空き枠はサンプル（lib/booking）。選択は BookingContext に保持。
 */
export default function DateSelect() {
  const router = useRouter();
  const { serviceId, qty, optionIds, day, slot, set, reform } = useBooking();

  const svc = getService(serviceId)!;
  const bill = calcBill(serviceId, qty, optionIds);

  // リフォーム予約（reformPricing・税抜）とクリーニング（pricing・税込）でサマリーを出し分け
  const isReform = reform != null && reform.items.length > 0;
  const reformTitle = isReform
    ? `リフォーム工事 × ${reform!.items.length}件`
    : "";

  // 空き状況（Firestore→未設定時はサンプル AVAIL）
  const [avail, setAvail] = useState<Record<number, string>>(AVAIL);
  useEffect(() => {
    let active = true;
    fetchMonthAvailability()
      .then((a) => { if (active) setAvail(a); })
      .catch(() => { /* フォールバック維持 */ });
    return () => { active = false; };
  }, []);

  // カレンダー生成
  const cells: (number | null)[] = [];
  for (let i = 0; i < CAL_FIRST_WEEKDAY; i++) cells.push(null);
  for (let d = 1; d <= CAL_DAYS_IN_MONTH; d++) cells.push(d);

  const canConfirm = day != null && slot != null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        {/* ステップ */}
        <div className="rt-steps">
          <div className="rt-step"><div className="rt-step-n done">1</div><div className="rt-step-l">サービス</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n done">2</div><div className="rt-step-l">条件</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n on">3</div><div className="rt-step-l on">日時</div></div>
        </div>

        <div className="rt-title-row">
          <button className="rt-back" onClick={() => router.push(isReform ? "/reform/simulator" : "/simulator")}><ArrowLeft size={20} strokeWidth={2.4} /></button>
          <h1 className="rt-page-title">日時を選ぶ</h1>
        </div>

        {/* 予約内容サマリー */}
        <div className="rt-summary">
          <div className="rt-summary-l">
            <div className="rt-summary-t">{isReform ? reformTitle : `${svc.title} × ${qty}${svc.unitLabel}`}</div>
            <div className="rt-summary-d">{isReform ? "埼玉県越谷市 ／ 税抜・材料施工費込み" : "埼玉県越谷市 ／ 約60〜90分"}</div>
          </div>
          <div className="rt-summary-p">{num(isReform ? reform!.net : bill.totalIncl)}<b>円</b></div>
        </div>

        {/* カレンダー */}
        <div className="rt-cal-head">
          <button className="rt-cal-nav"><ChevronLeft size={20} strokeWidth={2.4} /></button>
          <div className="rt-cal-month">{CAL_MONTH_LABEL}</div>
          <button className="rt-cal-nav"><ChevronRight size={20} strokeWidth={2.4} /></button>
        </div>
        <div className="rt-legend">
          <span><b className="lg-o">○</b>空きあり</span>
          <span><b className="lg-t">△</b>残りわずか</span>
          <span><b className="lg-x">×</b>満員</span>
        </div>
        <div className="rt-cal">
          {WEEK.map((w, i) => (
            <div key={"w" + i} className={"rt-cal-w" + (i === 0 ? " sun" : i === 6 ? " sat" : "")}>{w}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} className="rt-cal-cell empty" />;
            const a = avail[d];
            const dow = i % 7;
            const disabled = !a || a === "×";
            const on = day === d;
            return (
              <button key={d} className={"rt-cal-cell" + (on ? " on" : "") + (disabled ? " disabled" : "")} onClick={() => { if (!disabled) set({ day: d, slot: null }); }} disabled={disabled}>
                <span className={"rt-cal-d" + (dow === 0 ? " sun" : dow === 6 ? " sat" : "")}>{d}</span>
                {a && <span className={"rt-cal-mark mk-" + (a === "○" ? "o" : a === "△" ? "t" : "x")}>{a}</span>}
              </button>
            );
          })}
        </div>

        {/* 時間帯 */}
        <div className="rt-slot-h">
          <span className="rt-slot-title">時間帯を選ぶ</span>
          {day != null ? <span className="rt-slot-day">{shortDateLabel(day)}</span> : <span className="rt-slot-hint">先に日付を選んでください</span>}
        </div>
        <div className="rt-slots">
          {SLOTS.map((s, i) => {
            const slotDisabled = day == null || (day != null && i === 2 && avail[day] === "△"); // △の日は一部満
            const on = slot === i;
            return (
              <button key={i} className={"rt-slot-btn" + (on ? " on" : "") + (slotDisabled ? " disabled" : "")} onClick={() => { if (!slotDisabled) set({ slot: i }); }} disabled={slotDisabled}>
                <Clock size={15} strokeWidth={2.2} />{s}
                {slotDisabled && day != null && <span className="rt-slot-full">満</span>}
              </button>
            );
          })}
        </div>

        <div className="rt-note"><MapPin size={14} strokeWidth={2.2} />訪問時間は前後する場合があります。前日に担当より確定のご連絡をします。</div>

        <div style={{ height: 120 }} />
      </div>

      {/* 固定フッター */}
      <div className="rt-bottom">
        <div className="rt-confirm-bar">
          <div className="rt-confirm-info">
            {canConfirm ? (
              <><div className="rt-confirm-l">選択中の日時</div><div className="rt-confirm-v">{shortDateLabel(day!)}{SLOTS[slot!]}</div></>
            ) : (
              <div className="rt-confirm-hint">日付と時間帯を選んでください</div>
            )}
          </div>
          <button className={"rt-confirm-btn" + (canConfirm ? "" : " off")} disabled={!canConfirm} onClick={() => router.push("/booking/info")}>予約を確定する<ChevronRight size={18} strokeWidth={2.6} /></button>
        </div>
        <BottomNav active="simulator" />
      </div>
    </div>
  );
}

const styles = `
.rt-steps{display:flex;align-items:center;padding:14px 8px 16px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:30px;height:30px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-n.done{background:#fff;border:2px solid var(--red);color:var(--red);}
.rt-step-l{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--ink);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 4px 22px;}
.rt-step-line.on{background:var(--red);}
.rt-title-row{display:flex;align-items:center;gap:9px;padding:2px 2px 14px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-page-title{font-size:20px;font-weight:900;margin:0;}
.rt-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:13px;padding:13px 14px;margin-bottom:18px;}
.rt-summary-t{font-size:13.5px;font-weight:900;margin-bottom:3px;}
.rt-summary-d{font-size:11px;color:var(--ink-2);font-weight:600;}
.rt-summary-p{font-size:20px;font-weight:900;color:var(--red);flex:none;}
.rt-summary-p b{font-size:13px;margin-left:1px;}
.rt-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.rt-cal-nav{width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink-2);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-cal-month{font-size:17px;font-weight:900;}
.rt-legend{display:flex;justify-content:center;gap:16px;margin-bottom:12px;font-size:11px;font-weight:700;color:var(--ink-2);}
.rt-legend b{margin-right:3px;font-size:13px;}
.lg-o{color:var(--green);}.lg-t{color:var(--amber);}.lg-x{color:var(--ink-3);}
.rt-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 10px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-cal-w{text-align:center;font-size:11px;font-weight:800;color:var(--ink-2);padding-bottom:4px;}
.rt-cal-w.sun{color:var(--red);}.rt-cal-w.sat{color:#2563EB;}
.rt-cal-cell{aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:none;border:1.5px solid transparent;border-radius:9px;cursor:pointer;padding:0;}
.rt-cal-cell.empty{cursor:default;}
.rt-cal-cell.on{border-color:var(--red);background:var(--red-soft);}
.rt-cal-cell.disabled{cursor:not-allowed;}
.rt-cal-d{font-size:13px;font-weight:700;color:var(--ink);}
.rt-cal-d.sun{color:var(--red);}.rt-cal-d.sat{color:#2563EB;}
.rt-cal-cell.disabled .rt-cal-d{color:var(--ink-3);}
.rt-cal-mark{font-size:11px;font-weight:800;line-height:1;}
.mk-o{color:var(--green);}.mk-t{color:var(--amber);}.mk-x{color:var(--ink-3);}
.rt-slot-h{display:flex;align-items:baseline;gap:9px;margin-bottom:11px;}
.rt-slot-title{font-size:16px;font-weight:900;}
.rt-slot-day{font-size:13px;font-weight:800;color:var(--red);}
.rt-slot-hint{font-size:11.5px;color:var(--ink-3);font-weight:600;}
.rt-slots{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px;}
.rt-slot-btn{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:14px;font-size:14px;font-weight:800;color:var(--ink);cursor:pointer;}
.rt-slot-btn svg{color:var(--red);}
.rt-slot-btn.on{border-color:var(--red);background:var(--red-soft);color:var(--red);}
.rt-slot-btn.on svg{color:var(--red);}
.rt-slot-btn.disabled{color:var(--ink-3);cursor:not-allowed;background:#F4F5F6;}
.rt-slot-btn.disabled svg{color:var(--ink-3);}
.rt-slot-full{position:absolute;top:6px;right:8px;font-size:10px;font-weight:800;color:var(--ink-3);}
.rt-note{display:flex;align-items:flex-start;gap:6px;font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;background:#fff;border:1px solid var(--line);border-radius:11px;padding:11px;}
.rt-note svg{color:var(--red);flex:none;margin-top:1px;}
.rt-confirm-bar{display:flex;align-items:center;gap:11px;background:#fff;border-top:1px solid var(--line);padding:11px 14px;box-shadow:0 -3px 14px rgba(20,28,38,.06);}
.rt-confirm-info{flex:1;min-width:0;}
.rt-confirm-l{font-size:10px;color:var(--ink-3);font-weight:700;}
.rt-confirm-v{font-size:14px;font-weight:900;color:var(--ink);}
.rt-confirm-hint{font-size:12px;color:var(--ink-3);font-weight:700;}
.rt-confirm-btn{flex:none;display:flex;align-items:center;gap:5px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:14px 18px;font-size:15px;font-weight:900;cursor:pointer;}
.rt-confirm-btn:hover{background:var(--red-deep);}
.rt-confirm-btn.off{background:#C8CCD0;cursor:not-allowed;}
`;
