"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, RotateCcw, Calendar, ChevronRight, Repeat, Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";
import AuthGuard from "@/components/AuthGuard";
import { Loading, Empty } from "@/components/states";
import { useAuth } from "@/context/AuthContext";
import { useBooking } from "@/context/BookingContext";
import { fetchUserBookings, type BookingDoc } from "@/lib/firestore";
import { getService, optionsFor, num } from "@/lib/pricing";
import { reformImageKey } from "@/lib/reformPricing";

/**
 * RE:TERA HOME — もう一度予約（利用履歴からの再予約＋定期プラン提案）
 * RETERA_Reorder.jsx を移植。履歴は本人の予約実データから生成（未設定時はサンプル）。
 * 「同じ内容で予約する」は内容を BookingContext にプリセットして日時選択へ。
 */
interface HistView {
  img: string; title: string; opt: string | null; last: string; price: string;
  serviceId: string; qty: number; optionIds: string[]; isReform: boolean;
}

const SAMPLE: HistView[] = [
  { img: "ac", title: "壁掛けエアコンクリーニング × 2台", opt: "防カビ・抗菌コート", last: "前回のご利用", price: "19,800", serviceId: "ac_wall", qty: 2, optionIds: ["anti_mold"], isReform: false },
  { img: "bath", title: "浴室クリーニング", opt: null, last: "前回のご利用", price: "16,000", serviceId: "bath", qty: 1, optionIds: [], isReform: false },
  { img: "hood", title: "レンジフードクリーニング", opt: null, last: "前回のご利用", price: "13,000", serviceId: "hood", qty: 1, optionIds: [], isReform: false },
];

const toHist = (b: BookingDoc): HistView => {
  const isReform = b.reform != null && b.reform.items.length > 0;
  const svc = getService(b.serviceId);
  const optNames = optionsFor(b.serviceId).filter((o) => (b.optionIds ?? []).includes(o.id)).map((o) => o.name);
  return {
    img: isReform ? reformImageKey(b.reform!.items[0]?.id ?? "") : svc?.img ?? "",
    title: isReform ? `リフォーム工事 × ${b.reform!.items.length}件` : `${svc?.title ?? b.serviceId} × ${b.qty}${svc?.unitLabel ?? ""}`,
    opt: optNames[0] ?? null,
    last: `前回 ${b.dateLabel?.split("（")[0] ?? ""}`,
    price: num(b.totalIncl ?? 0),
    serviceId: b.serviceId, qty: b.qty, optionIds: b.optionIds ?? [], isReform,
  };
};

function ReorderInner() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const { set } = useBooking();
  const [list, setList] = useState<HistView[] | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured || !user) { setLoading(false); return; }
    fetchUserBookings(user.uid)
      .then((rows) => setList((rows ?? []).map(toHist)))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [configured, user]);

  const source = configured ? list ?? [] : SAMPLE;

  const rebook = (h: HistView) => {
    if (h.isReform) { router.push("/reform/simulator"); return; }
    set({ serviceId: h.serviceId, qty: h.qty, optionIds: h.optionIds, reform: null, day: null, slot: null, bookingNo: null });
    router.push("/booking/date");
  };

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
          <Link href="/messages" className="rt-plan-btn"><Repeat size={17} strokeWidth={2.3} />定期プランを相談する<ChevronRight size={16} strokeWidth={2.6} className="rt-plan-cv" /></Link>
        </div>

        <div className="rt-sec-h">これまでのご利用</div>
        {loading ? (
          <Loading label="ご利用履歴を読み込み中" />
        ) : source.length === 0 ? (
          <Empty preset="history" onCta={() => router.push("/services")} />
        ) : (
        <div className="rt-list">
          {source.map((h, i) => (
            <div className="rt-hist" key={i}>
              <div className="rt-hist-top">
                <div className="rt-hist-photo"><Photo srcKey={h.img} alt={h.title} /></div>
                <div className="rt-hist-info">
                  <div className="rt-hist-title">{h.title}</div>
                  {h.opt && <span className="rt-hist-opt">＋{h.opt}</span>}
                  <div className="rt-hist-last"><Calendar size={13} strokeWidth={2.2} />{h.last}</div>
                  <div className="rt-hist-price">{h.price}<b>円〜</b></div>
                </div>
              </div>
              <button className="rt-hist-btn" onClick={() => rebook(h)}><RotateCcw size={16} strokeWidth={2.3} />同じ内容で予約する<ChevronRight size={15} strokeWidth={2.6} className="rt-hist-cv" /></button>
            </div>
          ))}
        </div>
        )}

        <div style={{ height: 84 }} />
      </div>

      <div className="rt-bottom"><BottomNav active="orders" /></div>
    </div>
  );
}

export default function Reorder() {
  return (
    <AuthGuard>
      <ReorderInner />
    </AuthGuard>
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
.rt-plan-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:#fff;color:#15414B;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:900;cursor:pointer;text-decoration:none;}
.rt-plan-cv{position:absolute;right:14px;}
.rt-sec-h{font-size:16px;font-weight:900;margin:0 0 12px;}
.rt-list{display:flex;flex-direction:column;gap:11px;}
.rt-hist{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--shadow);}
.rt-hist-top{display:flex;gap:12px;margin-bottom:12px;}
.rt-hist-photo{flex:none;width:84px;height:84px;border-radius:11px;overflow:hidden;background:#EDF1F3;}
.rt-hist-info{flex:1;min-width:0;}
.rt-hist-title{font-size:14.5px;font-weight:900;line-height:1.3;margin-bottom:6px;}
.rt-hist-opt{display:inline-block;font-size:10.5px;font-weight:700;color:var(--red);background:var(--red-soft);border-radius:6px;padding:3px 8px;margin-bottom:7px;}
.rt-hist-last{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--ink-2);font-weight:600;margin-bottom:7px;}
.rt-hist-last svg{color:var(--ink-3);}
.rt-hist-price{font-size:20px;font-weight:900;color:var(--red);line-height:1;}
.rt-hist-price b{font-size:13px;margin-left:1px;}
.rt-hist-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;background:var(--red);color:#fff;border:none;border-radius:11px;padding:13px;font-size:14px;font-weight:900;cursor:pointer;}
.rt-hist-btn:hover{background:var(--red-deep);}
.rt-hist-cv{position:absolute;right:14px;}
`;
