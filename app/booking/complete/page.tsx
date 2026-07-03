"use client";

import { useRouter } from "next/navigation";
import {
  Check, Calendar, MapPin, Clock, MessageCircle, ChevronRight, Home, CalendarCheck,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { getService, calcBill, num } from "@/lib/pricing";
import { fullDateLabel, bookingNumber } from "@/lib/booking";

/**
 * RE:TERA HOME — 予約完了
 * RETERA_BookingComplete.jsx を移植。内容は BookingContext、金額は calcBill。
 */
export default function BookingComplete() {
  const router = useRouter();
  const { serviceId, qty, optionIds, year, month, day, slot, customer, bookingNo, reform } = useBooking();

  const svc = getService(serviceId)!;
  const bill = calcBill(serviceId, qty, optionIds);
  const dateText = day != null && slot != null ? fullDateLabel(year, month, day, slot) : "—";
  const place = customer.addr || "—";
  const no =
    bookingNo ??
    (day != null && slot != null ? bookingNumber(year, month, day, slot) : "RT-XXXXXXXX-XXXX");

  // リフォーム予約時は工事内容・税込参考額（出所: reformPricing）を表示
  const isReform = reform != null && reform.items.length > 0;
  const cardTitle = isReform ? `リフォーム工事 × ${reform!.items.length}件` : `${svc.title} × ${qty}${svc.unitLabel}`;
  const payTotal = isReform ? reform!.incl : bill.totalIncl;

  const DETAILS = [
    { icon: Calendar, label: "日時", value: dateText },
    { icon: MapPin, label: "場所", value: place },
    { icon: Clock, label: "作業時間の目安", value: isReform ? "工事内容により異なります" : `約60〜90分（${qty}${svc.unitLabel}）` },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        {/* 完了ヒーロー */}
        <div className="rt-done">
          <div className="rt-done-ring">
            <div className="rt-done-circle"><Check size={40} strokeWidth={3} /></div>
          </div>
          <h1 className="rt-done-t">ご予約が完了しました</h1>
          <p className="rt-done-d">ご予約ありがとうございます。<br />下記の予約番号をお控えください。</p>
          <div className="rt-done-no">予約番号　<b>{no}</b></div>
        </div>

        {/* 予約内容 */}
        <div className="rt-card">
          <div className="rt-card-head">
            <div className="rt-card-svc">{cardTitle}</div>
            <span className="rt-card-state">予約確定</span>
          </div>
          <div className="rt-card-list">
            {DETAILS.map((d, i) => {
              const Icon = d.icon;
              return (
                <div className="rt-card-row" key={i}>
                  <div className="rt-card-ico"><Icon size={17} strokeWidth={2.2} /></div>
                  <div><div className="rt-card-l">{d.label}</div><div className="rt-card-v">{d.value}</div></div>
                </div>
              );
            })}
          </div>
          <div className="rt-card-pay">
            <span>お支払い金額（税込）</span>
            <div className="rt-card-price">{num(payTotal)}<b>円</b></div>
          </div>
          <div className="rt-card-note"><Check size={13} strokeWidth={3} />当日は現金・クレジットカード・電子決済でお支払いいただけます。</div>
        </div>

        {/* 次の流れ */}
        <div className="rt-flow">
          <div className="rt-flow-h">この後の流れ</div>
          <div className="rt-flow-row"><div className="rt-flow-n">1</div><div><div className="rt-flow-t">前日に確認のご連絡</div><div className="rt-flow-d">担当より訪問時間の最終確定をご連絡します。</div></div></div>
          <div className="rt-flow-row"><div className="rt-flow-n">2</div><div><div className="rt-flow-t">当日ご訪問・作業</div><div className="rt-flow-d">スタッフが伺い、丁寧に作業します。</div></div></div>
          <div className="rt-flow-row last"><div className="rt-flow-n">3</div><div><div className="rt-flow-t">仕上がり確認・お支払い</div><div className="rt-flow-d">一緒に仕上がりを確認後、お支払い。領収書も発行可能です。</div></div></div>
        </div>

        {/* アクション */}
        <button className="rt-act" onClick={() => router.push("/orders")}><CalendarCheck size={19} strokeWidth={2.2} />予約内容を確認する<ChevronRight size={18} strokeWidth={2.6} className="rt-act-cv" /></button>
        <button className="rt-act sub" onClick={() => router.push("/messages")}><MessageCircle size={19} strokeWidth={2.2} />メッセージで相談する<ChevronRight size={18} strokeWidth={2.6} className="rt-act-cv" /></button>

        <button className="rt-home-btn" onClick={() => router.push("/")}><Home size={17} strokeWidth={2.3} />ホームに戻る</button>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-shell{padding-bottom:28px;}
.rt-done{text-align:center;padding:38px 10px 26px;}
.rt-done-ring{width:96px;height:96px;border-radius:50%;background:var(--green-soft);margin:0 auto 18px;display:flex;align-items:center;justify-content:center;animation:pop .45s cubic-bezier(.2,.8,.3,1.2);}
.rt-done-circle{width:64px;height:64px;border-radius:50%;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;}
@keyframes pop{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}
@media(prefers-reduced-motion:reduce){.rt-done-ring{animation:none;}}
.rt-done-t{font-size:23px;font-weight:900;margin:0 0 10px;letter-spacing:.01em;}
.rt-done-d{font-size:13px;color:var(--ink-2);font-weight:600;line-height:1.6;margin:0 0 16px;}
.rt-done-no{display:inline-block;font-size:12px;font-weight:700;color:var(--ink-2);background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 16px;}
.rt-done-no b{color:var(--ink);letter-spacing:.04em;}
.rt-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;}
.rt-card-svc{font-size:15px;font-weight:900;line-height:1.3;}
.rt-card-state{flex:none;font-size:11px;font-weight:800;color:var(--green);background:var(--green-soft);padding:5px 10px;border-radius:7px;}
.rt-card-list{display:flex;flex-direction:column;gap:13px;}
.rt-card-row{display:flex;align-items:flex-start;gap:11px;}
.rt-card-ico{flex:none;width:36px;height:36px;border-radius:9px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-card-l{font-size:11px;color:var(--ink-3);font-weight:700;margin-bottom:2px;}
.rt-card-v{font-size:13.5px;font-weight:800;line-height:1.4;}
.rt-card-pay{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);margin-top:15px;padding-top:14px;}
.rt-card-pay span{font-size:11px;color:var(--ink-3);font-weight:700;}
.rt-card-price{font-size:25px;font-weight:900;color:var(--red);line-height:1;}
.rt-card-price b{font-size:14px;margin-left:1px;}
.rt-card-note{display:flex;align-items:flex-start;gap:6px;font-size:11px;font-weight:700;color:var(--ink-2);background:var(--red-soft-2);border-radius:10px;padding:10px;margin-top:13px;line-height:1.5;}
.rt-card-note svg{color:var(--red);flex:none;margin-top:2px;}
.rt-flow{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:18px;box-shadow:var(--shadow);}
.rt-flow-h{font-size:15px;font-weight:900;margin-bottom:14px;}
.rt-flow-row{display:flex;gap:12px;padding-bottom:14px;position:relative;}
.rt-flow-row:not(.last):before{content:"";position:absolute;left:14px;top:30px;bottom:0;width:2px;background:var(--line);}
.rt-flow-row.last{padding-bottom:0;}
.rt-flow-n{flex:none;width:30px;height:30px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;z-index:1;}
.rt-flow-t{font-size:14px;font-weight:900;margin-bottom:3px;}
.rt-flow-d{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.55;}
.rt-act{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:16px;font-size:15px;font-weight:900;cursor:pointer;margin-bottom:10px;box-shadow:var(--shadow);position:relative;}
.rt-act:hover{background:var(--red-deep);}
.rt-act.sub{background:#fff;color:var(--red);border:1.5px solid var(--red);box-shadow:none;}
.rt-act-cv{position:absolute;right:16px;}
.rt-home-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;color:var(--ink-2);font-size:13px;font-weight:700;cursor:pointer;padding:14px;margin-top:4px;}
`;
