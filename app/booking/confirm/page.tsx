"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Check, Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, ChevronRight, AlertCircle,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { getService, optionsFor, calcBill, num } from "@/lib/pricing";
import { getReformItem, quote } from "@/lib/reformPricing";
import { fullDateLabel, paymentConfirmLabel } from "@/lib/booking";
import { createBooking, SlotFullError } from "@/lib/firestore";
import { notifyAdmin, notifyCustomer } from "@/lib/notify";

/**
 * RE:TERA HOME — 最終確認（お客様情報入力 → ここ → 完了）
 * RETERA_FinalConfirm.jsx を移植。金額は lib/pricing の calcBill、内容は BookingContext から。
 * 直接アクセス（日時未選択）は /simulator へ戻すガードを入れる。
 */
export default function FinalConfirm() {
  const router = useRouter();
  const { serviceId, qty, optionIds, year, month, day, slot, customer, payment, hasSchedule, set, reform, bookingNo } = useBooking();
  const { user } = useAuth();
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // リフォーム予約：金額の出所は lib/reformPricing（税抜）。クリーニングの calcBill とは混ぜない。
  const isReform = reform != null && reform.items.length > 0;
  const reformRows = isReform
    ? reform!.items
        .map((ci) => {
          const item = getReformItem(ci.id);
          if (!item) return null;
          const q = item.method === "area" ? quote(ci.id, { area: ci.val }) : quote(ci.id, { qty: ci.val });
          const detail = item.method === "area" ? `${ci.val}㎡` : item.method === "set" ? "1台" : item.method === "small" ? "1式" : `${ci.val}${item.unitLabel}`;
          return { id: ci.id, val: ci.val, title: item.title, detail, total: q.total ?? 0 };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
    : [];
  const reformNet = reformRows.reduce((s, r) => s + r.total, 0);
  const reformIncl = Math.round(reformNet * 1.1);
  const reformTax = reformIncl - reformNet;

  // ガード：フロー未経由（日時未選択）は /simulator へ。
  // 確定済み（bookingNo あり）で戻ってきた場合は完了画面へ（更新→再確定の二重予約防止）。
  useEffect(() => {
    if (bookingNo) router.replace("/booking/complete");
    else if (!hasSchedule) router.replace("/simulator");
  }, [hasSchedule, bookingNo, router]);
  if (!hasSchedule || bookingNo) return null;

  const svc = getService(serviceId)!;
  const bill = calcBill(serviceId, qty, optionIds);
  const chosenOptionNames = optionsFor(serviceId)
    .filter((o) => optionIds.includes(o.id))
    .map((o) => o.name);

  const addrFull = [customer.addr, customer.building].filter(Boolean).join(" ");

  const handleConfirm = async () => {
    if (!agree || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // 保存前に前後空白を除去
      const trimmed = Object.fromEntries(
        Object.entries(customer).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      ) as typeof customer;
      const { bookingNo: newNo } = await createBooking({
        serviceId: isReform ? "reform" : serviceId,
        qty: isReform ? reformRows.length : qty,
        optionIds: isReform ? [] : optionIds,
        year,
        month,
        day: day!,
        slot: slot!,
        dateLabel: fullDateLabel(year, month, day!, slot!),
        customer: trimmed,
        payment,
        totalIncl: isReform ? reformIncl : bill.totalIncl,
        userId: user?.uid ?? null,
        reform: isReform
          ? { items: reformRows.map(({ id, val, title, total }) => ({ id, val, title, total })), net: reformNet, incl: reformIncl }
          : null,
      });
      set({ bookingNo: newNo });
      // メール通知（補助・失敗しても続行）
      const svcLabel = isReform ? `リフォーム工事 × ${reformRows.length}件` : `${svc.title} × ${qty}${svc.unitLabel}`;
      const dateLabelText = fullDateLabel(year, month, day!, slot!);
      const totalText = `${(isReform ? reformIncl : bill.totalIncl).toLocaleString("ja-JP")}円（${isReform ? "税込参考" : "税込"}）`;
      const addrText = [trimmed.zip && `〒${trimmed.zip}`, trimmed.addr, trimmed.building].filter(Boolean).join(" ");
      // 管理者へ
      notifyAdmin({
        kind: "予約",
        title: `${svcLabel}（${newNo}）`,
        lines: [
          `日時：${dateLabelText}`,
          `お客様：${trimmed.name}／${trimmed.tel}`,
          `住所：${addrText}`,
          `金額：${totalText}／${payment}`,
        ],
      });
      // お客様へ確定控え（メール入力があれば）
      notifyCustomer({
        to: trimmed.email,
        title: `${trimmed.name} 様　ご予約を承りました（予約番号：${newNo}）`,
        lines: [
          `内容：${svcLabel}`,
          `日時：${dateLabelText}`,
          `場所：${addrText}`,
          `お支払い目安：${totalText}（当日 現金・カード・電子決済）`,
          `※前日に担当より訪問時間の最終確認をご連絡します。ご不明点はアプリのメッセージへ。`,
        ],
      });
      router.push("/booking/complete");
    } catch (e) {
      // 失敗時は完了に進まず、理由を表示して再試行できるようにする
      if (e instanceof SlotFullError) {
        setSubmitError("申し訳ありません。この時間帯は直前に満員となりました。別の日時をお選びください。");
      } else {
        setSubmitError("予約の送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。");
      }
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <button className="rt-back" onClick={() => router.push("/booking/info")}><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-mini-title">最終確認</div>
        </header>

        <div className="rt-steps">
          <div className="rt-step"><div className="rt-step-n done"><Check size={13} strokeWidth={3} /></div><div className="rt-step-l">条件</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n done"><Check size={13} strokeWidth={3} /></div><div className="rt-step-l">日時</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n done"><Check size={13} strokeWidth={3} /></div><div className="rt-step-l">情報</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n on">4</div><div className="rt-step-l on">確認</div></div>
        </div>

        <div className="rt-lead">内容をご確認のうえ、ページ下部の「予約を確定する」を押してください。</div>

        {/* 予約内容 */}
        <div className="rt-block">
          <div className="rt-block-top"><div className="rt-block-h">ご予約内容</div><button className="rt-edit" onClick={() => router.push(isReform ? "/reform/simulator" : "/simulator")}>変更</button></div>
          {isReform ? (
            <>
              <div className="rt-svc">リフォーム工事 × {reformRows.length}件</div>
              {reformRows.map((r, i) => <span className="rt-opt" key={i}>{r.title}（{r.detail}）</span>)}
              <div className="rt-line"><Calendar size={15} strokeWidth={2.2} />{fullDateLabel(year, month, day!, slot!)}</div>
              <div className="rt-line"><Clock size={15} strokeWidth={2.2} />作業時間の目安 工事内容により異なります</div>
            </>
          ) : (
            <>
              <div className="rt-svc">{svc.title} × {qty}{svc.unitLabel}</div>
              {chosenOptionNames.map((o, i) => <span className="rt-opt" key={i}>＋{o}</span>)}
              <div className="rt-line"><Calendar size={15} strokeWidth={2.2} />{fullDateLabel(year, month, day!, slot!)}</div>
              <div className="rt-line"><Clock size={15} strokeWidth={2.2} />作業時間の目安 約60〜90分</div>
            </>
          )}
        </div>

        {/* お客様情報 */}
        <div className="rt-block">
          <div className="rt-block-top"><div className="rt-block-h">お客様情報</div><button className="rt-edit" onClick={() => router.push("/booking/info")}>変更</button></div>
          <div className="rt-info">
            <div className="rt-info-row"><User size={15} strokeWidth={2.2} /><span>{customer.name}</span></div>
            <div className="rt-info-row"><Phone size={15} strokeWidth={2.2} /><span>{customer.tel}</span></div>
            {customer.email && <div className="rt-info-row"><Mail size={15} strokeWidth={2.2} /><span>{customer.email}</span></div>}
            <div className="rt-info-row"><MapPin size={15} strokeWidth={2.2} /><span>{addrFull}</span></div>
            <div className="rt-info-row"><CreditCard size={15} strokeWidth={2.2} /><span>{paymentConfirmLabel(payment)}</span></div>
          </div>
        </div>

        {/* 料金 */}
        <div className="rt-block">
          <div className="rt-block-h">料金の内訳</div>
          <div className="rt-bill">
            {(isReform
              ? reformRows.map((r) => ({ label: r.title, detail: r.detail, amount: r.total }))
              : bill.lines
            ).map((l, i) => (
              <div className="rt-bill-row" key={i}><div className="rt-bill-l">{l.label}<br /><span>{l.detail}</span></div><div className="rt-bill-v">{num(l.amount)}円</div></div>
            ))}
            <div className="rt-bill-div" />
            <div className="rt-bill-sub"><span>小計（税抜）</span><span>{num(isReform ? reformNet : bill.net)}円</span></div>
            <div className="rt-bill-sub"><span>消費税（10%）</span><span>{num(isReform ? reformTax : bill.tax)}円</span></div>
            <div className="rt-bill-div" />
            <div className="rt-bill-total"><span>合計（税込）</span><span className="rt-bill-total-v">{num(isReform ? reformIncl : bill.totalIncl)}<b>円</b></span></div>
          </div>
          <div className="rt-bill-note"><Check size={13} strokeWidth={3} />{isReform ? "リフォームは税抜表示です。材料費・施工費込み、駐車場代は別途実費となります。" : "表示価格はすべて税込です。追加料金は一切かかりません。"}</div>
        </div>

        {/* 同意 */}
        <button className="rt-agree" onClick={() => setAgree((a) => !a)} aria-pressed={agree}>
          <div className={"rt-check" + (agree ? " on" : "")}>{agree && <Check size={14} strokeWidth={3} />}</div>
          <div className="rt-agree-t"><Link href="/legal" className="rt-agree-link" onClick={(e) => e.stopPropagation()}>キャンセルポリシー・利用規約</Link>に同意します。前日までのご連絡は無料、当日キャンセルは料金が発生する場合があります。</div>
        </button>

        {submitError && (
          <div className="rt-form-alert" role="alert"><AlertCircle size={15} strokeWidth={2.4} />{submitError}</div>
        )}

        <div style={{ height: 108 }} />
      </div>

      <div className="rt-bottom">
        <div className="rt-bar">
          <div className="rt-bar-info"><div className="rt-bar-l">お支払い金額（税込）</div><div className="rt-bar-v">{num(isReform ? reformIncl : bill.totalIncl)}円</div></div>
          <button className={"rt-confirm-btn" + (agree && !submitting ? "" : " off")} disabled={!agree || submitting} onClick={handleConfirm}>{submitting ? "送信中…" : "予約を確定する"}<ChevronRight size={18} strokeWidth={2.6} /></button>
        </div>
      </div>
    </div>
  );
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-steps{display:flex;align-items:center;padding:6px 6px 16px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:28px;height:28px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-n.done{background:var(--red);color:#fff;}
.rt-step-l{font-size:10.5px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--ink);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 3px 21px;}
.rt-step-line.on{background:var(--red);}
.rt-lead{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.5;margin:0 2px 14px;}
.rt-block{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-block-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.rt-block-h{font-size:15px;font-weight:900;}
.rt-edit{background:none;border:none;color:var(--red);font-size:12.5px;font-weight:800;cursor:pointer;padding:2px 4px;}
.rt-svc{font-size:15px;font-weight:900;margin-bottom:7px;}
.rt-opt{display:inline-block;font-size:11px;font-weight:700;color:var(--red);background:var(--red-soft);border-radius:6px;padding:3px 8px;margin:0 5px 9px 0;}
.rt-line{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:var(--ink-2);margin-top:7px;}
.rt-line svg{color:var(--red);flex:none;}
.rt-info{display:flex;flex-direction:column;gap:11px;}
.rt-info-row{display:flex;align-items:flex-start;gap:9px;font-size:13px;font-weight:700;color:var(--ink);line-height:1.45;}
.rt-info-row svg{color:var(--red);flex:none;margin-top:2px;}
.rt-bill-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:11px;}
.rt-bill-l{font-size:13px;font-weight:700;line-height:1.4;}
.rt-bill-l span{font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-bill-v{font-size:14px;font-weight:800;flex:none;}
.rt-bill-div{height:1px;background:var(--line);margin:12px 0;}
.rt-bill-sub{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--ink-2);margin-bottom:8px;}
.rt-bill-total{display:flex;align-items:center;justify-content:space-between;}
.rt-bill-total span:first-child{font-size:15px;font-weight:900;}
.rt-bill-total-v{font-size:28px;font-weight:900;color:var(--red);line-height:1;}
.rt-bill-total-v b{font-size:15px;margin-left:1px;}
.rt-bill-note{display:flex;align-items:flex-start;gap:6px;font-size:11px;font-weight:700;color:var(--ink-2);background:var(--red-soft-2);border-radius:10px;padding:10px;margin-top:13px;line-height:1.5;}
.rt-bill-note svg{color:var(--red);flex:none;margin-top:2px;}
.rt-agree{width:100%;display:flex;align-items:flex-start;gap:10px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;cursor:pointer;text-align:left;box-shadow:var(--shadow);}
.rt-check{flex:none;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--line);background:#fff;display:flex;align-items:center;justify-content:center;color:#fff;}
.rt-check.on{background:var(--red);border-color:var(--red);}
.rt-agree-t{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-agree-t b{color:var(--ink);}
.rt-agree-link{color:var(--red);font-weight:800;text-decoration:underline;}
.rt-form-alert{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--err);background:#FDF3F2;border:1px solid #F3D3D1;border-radius:11px;padding:12px;margin-top:12px;}
.rt-form-alert svg{flex:none;}
.rt-bar{display:flex;align-items:center;gap:11px;background:#fff;border-top:1px solid var(--line);padding:11px 14px calc(11px + env(safe-area-inset-bottom));box-shadow:0 -3px 14px rgba(20,28,38,.06);}
.rt-bar-info{flex:none;}
.rt-bar-l{font-size:10px;color:var(--ink-3);font-weight:700;}
.rt-bar-v{font-size:20px;font-weight:900;color:var(--red);}
.rt-confirm-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:var(--red);color:#fff;border:none;border-radius:12px;padding:15px;font-size:15px;font-weight:900;cursor:pointer;}
.rt-confirm-btn:hover{background:var(--red-deep);}
.rt-confirm-btn.off{background:#C8CCD0;cursor:not-allowed;}
`;
