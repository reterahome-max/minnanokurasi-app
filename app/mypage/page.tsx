"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, ChevronRight, CalendarCheck, MapPin, CreditCard, Bell as BellIcon,
  Gift, FileText, HelpCircle, Settings, LogOut, Star,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { fetchUserBookings, type BookingDoc } from "@/lib/firestore";
import { getService } from "@/lib/pricing";

/**
 * RE:TERA HOME — マイページ
 * RETERA_MyPage.jsx を移植。ログイン必須（AuthGuard）。ログアウトを Auth に接続。
 * 統計・次回予約は Firestore の本人予約から算出（未設定時はサンプル表示）。
 */
const MENU_MAIN = [
  { icon: CalendarCheck, label: "予約・注文一覧", sub: "予約中 1件・完了 2件", href: "/orders" },
  { icon: MapPin, label: "登録住所", sub: "埼玉県越谷市南越谷 1-26-12", href: "" },
  { icon: CreditCard, label: "お支払い方法", sub: "クレジットカード ・ 現金", href: "" },
  { icon: Gift, label: "ポイント・クーポン", sub: "1,200pt ・ クーポン 2枚", href: "/reorder" },
];
const MENU_SUB = [
  { icon: FileText, label: "領収書の発行", href: "" },
  { icon: BellIcon, label: "通知設定", href: "/settings/notifications" },
  { icon: HelpCircle, label: "よくある質問・お問い合わせ", href: "/messages" },
  { icon: Settings, label: "アカウント設定", href: "" },
];

function MyPageInner() {
  const router = useRouter();
  const { user, signOutUser, configured } = useAuth();
  const name = user?.displayName ?? "ゲスト";

  const [bookings, setBookings] = useState<BookingDoc[] | null>(null);
  useEffect(() => {
    if (!configured || !user) return;
    fetchUserBookings(user.uid).then(setBookings).catch(() => {});
  }, [configured, user]);

  // 実データがあれば統計・次回予約を算出。無ければサンプル表示。
  const hasReal = configured && bookings != null;
  const upcoming = (bookings ?? []).filter((b) => b.status !== "completed" && b.status !== "cancelled");
  const STATS = [
    { label: "予約中", value: hasReal ? String(upcoming.length) : "1" },
    { label: "利用回数", value: hasReal ? String(bookings!.length) : "3" },
    { label: "ポイント", value: "1,200" },
  ];
  const next = upcoming[0] ?? (bookings ?? [])[0];
  const nextSvc = next
    ? next.reform != null && next.reform.items.length > 0
      ? `リフォーム工事 × ${next.reform.items.length}件`
      : `${getService(next.serviceId)?.title ?? next.serviceId} × ${next.qty}${getService(next.serviceId)?.unitLabel ?? ""}`
    : "壁掛けエアコンクリーニング × 2台";
  const nextDate = next ? next.dateLabel : "7月3日（木）13:00〜15:00";
  const hasNext = !hasReal || Boolean(next);

  const handleLogout = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header showAvatar={false} />

        <h1 className="rt-page-title">マイページ</h1>

        <div className="rt-profile">
          <div className="rt-profile-avatar"><User size={30} strokeWidth={2} /></div>
          <div className="rt-profile-info">
            <div className="rt-profile-name">{name} さん</div>
            <div className="rt-profile-rank"><Star size={13} fill="currentColor" strokeWidth={0} />レギュラー会員</div>
          </div>
          <button className="rt-profile-edit">編集</button>
        </div>

        <div className="rt-stats">
          {STATS.map((s, i) => (
            <div className="rt-stat" key={i}>
              <div className="rt-stat-v">{s.value}</div>
              <div className="rt-stat-l">{s.label}</div>
            </div>
          ))}
        </div>

        {hasNext && (
          <div className="rt-next">
            <div className="rt-next-head"><CalendarCheck size={16} strokeWidth={2.3} />次回のご予約</div>
            <div className="rt-next-body">
              <div>
                <div className="rt-next-svc">{nextSvc}</div>
                <div className="rt-next-date">{nextDate}</div>
              </div>
              <span className="rt-next-state">予約確定</span>
            </div>
            <Link href="/orders" className="rt-next-btn">予約詳細を見る<ChevronRight size={15} strokeWidth={2.6} /></Link>
          </div>
        )}

        <div className="rt-menu">
          {MENU_MAIN.map((m, i) => { const Icon = m.icon; const inner = (
            <>
              <div className="rt-menu-ico"><Icon size={20} strokeWidth={2.1} /></div>
              <div className="rt-menu-body"><div className="rt-menu-l">{m.label}</div><div className="rt-menu-sub">{m.sub}</div></div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
            </>
          );
          return m.href ? (
            <Link className="rt-menu-row" key={i} href={m.href}>{inner}</Link>
          ) : (
            <button className="rt-menu-row" key={i}>{inner}</button>
          ); })}
        </div>

        <div className="rt-menu rt-menu-sub">
          {MENU_SUB.map((m, i) => { const Icon = m.icon; const inner = (
            <>
              <div className="rt-menu-ico slim"><Icon size={18} strokeWidth={2.1} /></div>
              <div className="rt-menu-l">{m.label}</div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
            </>
          );
          return m.href ? (
            <Link className="rt-menu-row slim" key={i} href={m.href}>{inner}</Link>
          ) : (
            <button className="rt-menu-row slim" key={i}>{inner}</button>
          ); })}
        </div>

        <button className="rt-logout" onClick={handleLogout}><LogOut size={16} strokeWidth={2.2} />ログアウト</button>
        <div className="rt-version">RE:TERA HOME v1.0.0</div>

        <div style={{ height: 84 }} />
      </div>

      <div className="rt-bottom"><BottomNav active="mypage" /></div>
    </div>
  );
}

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageInner />
    </AuthGuard>
  );
}

const styles = `
.rt-page-title{font-size:24px;font-weight:900;margin:14px 2px 16px;}
.rt-profile{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:11px;box-shadow:var(--shadow);}
.rt-profile-avatar{width:58px;height:58px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-profile-info{flex:1;min-width:0;}
.rt-profile-name{font-size:17px;font-weight:900;margin-bottom:5px;}
.rt-profile-rank{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--gold);background:#FBF3E2;padding:4px 10px;border-radius:999px;}
.rt-profile-edit{flex:none;align-self:flex-start;background:#fff;border:1.5px solid var(--line);color:var(--ink-2);font-size:12px;font-weight:800;border-radius:9px;padding:8px 14px;cursor:pointer;}
.rt-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-bottom:16px;}
.rt-stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 6px;text-align:center;box-shadow:var(--shadow);}
.rt-stat-v{font-size:22px;font-weight:900;color:var(--red);line-height:1;}
.rt-stat-l{font-size:11px;color:var(--ink-2);font-weight:700;margin-top:5px;}
.rt-next{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:18px;box-shadow:var(--shadow);}
.rt-next-head{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:900;margin-bottom:12px;}
.rt-next-head svg{color:var(--red);}
.rt-next-body{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;background:var(--red-soft-2);border-radius:11px;padding:12px;margin-bottom:11px;}
.rt-next-svc{font-size:13.5px;font-weight:900;margin-bottom:4px;line-height:1.3;}
.rt-next-date{font-size:12px;color:var(--ink-2);font-weight:700;}
.rt-next-state{flex:none;font-size:10.5px;font-weight:800;color:var(--green);background:var(--green-soft);padding:4px 9px;border-radius:7px;white-space:nowrap;}
.rt-next-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:3px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:13.5px;font-weight:800;border-radius:11px;padding:12px;cursor:pointer;text-decoration:none;}
.rt-menu{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-menu-row{width:100%;display:flex;align-items:center;gap:12px;background:none;border:none;border-bottom:1px solid var(--line);padding:15px 14px;cursor:pointer;text-align:left;text-decoration:none;color:inherit;}
.rt-menu-row:last-child{border-bottom:none;}
.rt-menu-ico{flex:none;width:40px;height:40px;border-radius:11px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-menu-ico.slim{width:34px;height:34px;border-radius:9px;}
.rt-menu-body{flex:1;min-width:0;}
.rt-menu-l{font-size:14px;font-weight:800;}
.rt-menu-sub{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:2px;line-height:1.4;}
.rt-menu-cv{color:var(--ink-3);flex:none;}
.rt-menu-row.slim{padding:13px 14px;}
.rt-menu-row.slim .rt-menu-l{flex:1;}
.rt-logout{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:none;border:none;color:var(--ink-2);font-size:13px;font-weight:800;cursor:pointer;padding:14px;}
.rt-version{text-align:center;font-size:10.5px;color:var(--ink-3);font-weight:600;margin-top:2px;}
`;
