"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, MapPin, ChevronRight, FileText, HelpCircle,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";
import AuthGuard from "@/components/AuthGuard";
import { Loading, Empty, ErrorState } from "@/components/states";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBookings, type BookingDoc } from "@/lib/firestore";
import { getService } from "@/lib/pricing";

/**
 * RE:TERA HOME — 予約・注文一覧
 * RETERA_Orders.jsx を移植。ログイン必須（AuthGuard）。サンプルデータ表示。
 */
const ORDERS = [
  { status: "予約中", img: "ac", title: "壁掛けエアコンクリーニング", date: "2026年7月3日（木）13:00〜15:00", addr: "埼玉県越谷市南越谷 1-26-12", price: "9,900", state: "予約確定", action: "日程変更" },
  { status: "完了", img: "bath", title: "浴室クリーニング", date: "2025年5月18日（日）10:00〜12:00", addr: "埼玉県春日部市中央 2-10-1", price: "16,000", state: "作業完了", action: "領収書" },
  { status: "完了", img: "hood", title: "レンジフードクリーニング", date: "2025年3月22日（土）14:00〜16:00", addr: "埼玉県越谷市蒲生 2-24-1", price: "13,000", state: "作業完了", action: "領収書" },
];
const TABS = ["すべて", "予約中", "完了", "キャンセル"];

interface OrderView {
  status: string; img: string; title: string; date: string;
  addr: string; price: string; state: string; action: string;
}

// Firestore の予約ドキュメント → 一覧カードの表示形へ（クリーニング=税込 / リフォーム=税抜参考）
const toView = (b: BookingDoc): OrderView => {
  const isReform = b.reform != null && b.reform.items.length > 0;
  const svc = getService(b.serviceId);
  const status = b.status === "completed" ? "完了" : b.status === "cancelled" ? "キャンセル" : "予約中";
  return {
    status,
    img: isReform ? "cloth" : svc?.img ?? "",
    title: isReform ? `リフォーム工事 × ${b.reform!.items.length}件` : svc?.title ?? b.serviceId,
    date: b.dateLabel,
    addr: [b.customer?.addr, b.customer?.building].filter(Boolean).join(" "),
    price: (b.totalIncl ?? 0).toLocaleString("ja-JP"),
    state: status === "完了" ? "作業完了" : status === "キャンセル" ? "キャンセル" : "予約確定",
    action: status === "完了" ? "領収書" : "日程変更",
  };
};

function OrdersInner() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const [tab, setTab] = useState(0);
  const [real, setReal] = useState<OrderView[] | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(false);

  const load = () => {
    if (!configured || !user) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    fetchUserBookings(user.uid)
      .then((rows) => { setReal((rows ?? []).map(toView)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };
  useEffect(load, [configured, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // 未設定時はサンプル（デザイン確認用）。設定時は本人の実データ。
  const source = configured ? real ?? [] : ORDERS;
  const counts: Record<string, number> = {
    すべて: source.length,
    予約中: source.filter((o) => o.status === "予約中").length,
    完了: source.filter((o) => o.status === "完了").length,
    キャンセル: source.filter((o) => o.status === "キャンセル").length,
  };
  const list = tab === 0 ? source : source.filter((o) => o.status === TABS[tab]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-page-head">
          <h1 className="rt-page-title">予約・注文一覧</h1>
          <p className="rt-page-sub">ご予約・ご注文の状況を確認できます。</p>
        </div>

        <div className="rt-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={"rt-tab" + (i === tab ? " rt-tab-on" : "")} onClick={() => setTab(i)}>
              {t}<span className={"rt-tab-c" + (i === tab ? " on" : "")}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {configured && loading ? (
          <Loading label="予約を読み込み中" />
        ) : configured && error ? (
          <ErrorState onRetry={load} />
        ) : source.length === 0 ? (
          <Empty preset="orders" onCta={() => router.push("/services")} />
        ) : (
        <div className="rt-orders">
          {list.map((o, i) => (
            <div className="rt-order" key={i}>
              <div className="rt-order-top">
                <div className="rt-order-photo">
                  <span className={"rt-order-tag " + (o.status === "予約中" ? "tag-book" : "tag-done")}>{o.status}</span>
                  <Photo srcKey={o.img} alt={o.title} />
                </div>
                <div className="rt-order-info">
                  <div className="rt-order-title-row">
                    <div className="rt-order-title">{o.title}</div>
                    <span className={"rt-order-state " + (o.status === "予約中" ? "st-book" : "st-done")}>{o.state}</span>
                  </div>
                  <div className="rt-order-line"><Calendar size={14} strokeWidth={2.2} />{o.date}</div>
                  <div className="rt-order-line"><MapPin size={14} strokeWidth={2.2} />{o.addr}</div>
                  <div className="rt-order-pay"><span>お支払い金額（税込）</span><div className="rt-order-price">{o.price}<b>円</b></div></div>
                </div>
              </div>
              <div className="rt-order-actions">
                {o.action === "日程変更" ? (
                  <Link href="/booking/date" className="rt-order-sub-btn"><Calendar size={15} strokeWidth={2.2} />{o.action}</Link>
                ) : (
                  <button className="rt-order-sub-btn"><FileText size={15} strokeWidth={2.2} />{o.action}</button>
                )}
                <Link href="/mypage" className="rt-order-main-btn">詳細を見る<ChevronRight size={15} strokeWidth={2.6} /></Link>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="rt-help">
          <div className="rt-help-ico"><HelpCircle size={30} strokeWidth={2} /></div>
          <div className="rt-help-body">
            <div className="rt-help-t">お困りごとはありませんか？</div>
            <div className="rt-help-d">日程の変更やキャンセル、サービス内容に関するご相談はお気軽にお問い合わせください。</div>
          </div>
          <Link href="/messages" className="rt-help-btn">お問い合わせ<ChevronRight size={14} strokeWidth={2.6} /></Link>
        </div>

        <div style={{ height: 84 }} />
      </div>

      <div className="rt-bottom"><BottomNav active="orders" /></div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersInner />
    </AuthGuard>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-page-head{padding:16px 2px 14px;}
.rt-page-title{font-size:24px;font-weight:900;margin:0 0 4px;}
.rt-page-sub{font-size:12.5px;color:var(--ink-2);font-weight:600;margin:0;}
.rt-tabs{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-bottom:16px;padding-bottom:2px;}
.rt-tabs::-webkit-scrollbar{display:none;}
.rt-tab{flex:none;display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-tab-on{border-color:var(--red);color:var(--red);}
.rt-tab-c{min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#E3E6E8;color:var(--ink-2);font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;}
.rt-tab-c.on{background:var(--red);color:#fff;}
.rt-orders{display:flex;flex-direction:column;gap:13px;}
.rt-order{background:#fff;border:1px solid var(--line);border-radius:16px;padding:13px;box-shadow:var(--shadow);}
.rt-order-top{display:flex;gap:12px;}
.rt-order-photo{position:relative;flex:none;width:96px;height:96px;border-radius:11px;overflow:hidden;background:#EDF1F3;}
.rt-order-tag{position:absolute;top:6px;left:6px;z-index:2;font-size:10px;font-weight:800;color:#fff;padding:3px 8px;border-radius:6px;}
.tag-book{background:var(--blue);}
.tag-done{background:var(--green);}
.rt-order-info{flex:1;min-width:0;}
.rt-order-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:7px;}
.rt-order-title{font-size:15px;font-weight:900;line-height:1.3;}
.rt-order-state{flex:none;font-size:10.5px;font-weight:800;padding:4px 9px;border-radius:7px;white-space:nowrap;}
.st-book{background:var(--blue-soft);color:var(--blue);}
.st-done{background:var(--green-soft);color:var(--green);}
.rt-order-line{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--ink-2);margin-bottom:5px;line-height:1.4;}
.rt-order-line svg{color:var(--red);flex:none;}
.rt-order-pay{margin-top:8px;}
.rt-order-pay span{font-size:10.5px;color:var(--ink-3);font-weight:700;}
.rt-order-price{font-size:22px;font-weight:900;color:var(--red);line-height:1.1;}
.rt-order-price b{font-size:13px;margin-left:1px;}
.rt-order-actions{display:flex;gap:9px;margin-top:13px;}
.rt-order-sub-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:12px;font-size:13px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-order-main-btn{flex:1.3;display:flex;align-items:center;justify-content:center;gap:4px;background:#fff;border:1.5px solid var(--red);border-radius:11px;padding:12px;font-size:13px;font-weight:800;color:var(--red);cursor:pointer;text-decoration:none;}
.rt-help{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 14px;margin-top:16px;box-shadow:var(--shadow);}
.rt-help-ico{flex:none;width:50px;height:50px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-help-body{flex:1;min-width:0;}
.rt-help-t{font-size:14px;font-weight:900;margin-bottom:3px;}
.rt-help-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-help-btn{flex:none;display:flex;align-items:center;gap:2px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12px;font-weight:800;border-radius:10px;padding:10px 12px;cursor:pointer;white-space:nowrap;text-decoration:none;}
.rt-photo{width:100%;height:100%;object-fit:cover;display:block;}
.rt-ph{display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#EDF1F3,#E1E7EA);color:#AAB2B8;}
`;
