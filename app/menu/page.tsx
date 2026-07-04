"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronRight, Sparkles, Wrench, Calculator, CalendarCheck,
  Mail, User, Building2, FileText, Bell, LogIn, ShieldCheck, Camera, BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdminEmail } from "@/lib/admin";

/**
 * RE:TERA HOME — メニュー（ヘッダーのハンバーガーから）
 * マイページのメニューリスト（rt-menu / rt-menu-row）のトンマナを流用。
 */
const MAIN = [
  { icon: Sparkles, label: "ハウスクリーニング", sub: "エアコン・水回りなどの一覧", href: "/services" },
  { icon: Wrench, label: "リフォーム", sub: "クロス・床・建具・水回り", href: "/reform" },
  { icon: Camera, label: "施工事例・ビフォーアフター", sub: "実際の施工写真を見る", href: "/works" },
  { icon: BookOpen, label: "初めての方へ", sub: "ご利用ガイド・流れ・料金の仕組み", href: "/guide" },
  { icon: Calculator, label: "料金シミュレーター", sub: "30秒で料金がわかります", href: "/simulator" },
  { icon: CalendarCheck, label: "予約・注文一覧", sub: "ご予約の確認・変更", href: "/orders" },
];
const SUB = [
  { icon: Mail, label: "メッセージで相談", href: "/messages" },
  { icon: Bell, label: "通知設定", href: "/settings/notifications" },
  { icon: Building2, label: "法人・管理会社の方へ", href: "/corporate" },
  { icon: FileText, label: "利用規約・プライバシー・特商法", href: "/legal" },
];

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <button className="rt-back" onClick={() => router.back()} aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></button>
          <div className="rt-mini-title">メニュー</div>
        </header>

        <div className="rt-menu">
          {MAIN.map((m, i) => { const Icon = m.icon; return (
            <Link className="rt-menu-row" key={i} href={m.href}>
              <div className="rt-menu-ico"><Icon size={20} strokeWidth={2.1} /></div>
              <div className="rt-menu-body"><div className="rt-menu-l">{m.label}</div><div className="rt-menu-sub">{m.sub}</div></div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
            </Link>
          ); })}
        </div>

        <div className="rt-menu">
          {SUB.map((m, i) => { const Icon = m.icon; return (
            <Link className="rt-menu-row slim" key={i} href={m.href}>
              <div className="rt-menu-ico slim"><Icon size={18} strokeWidth={2.1} /></div>
              <div className="rt-menu-l">{m.label}</div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
            </Link>
          ); })}
        </div>

        <div className="rt-menu">
          <Link className="rt-menu-row slim" href={user ? "/mypage" : "/login"}>
            <div className="rt-menu-ico slim">{user ? <User size={18} strokeWidth={2.1} /> : <LogIn size={18} strokeWidth={2.1} />}</div>
            <div className="rt-menu-l">{user ? "マイページ" : "ログイン・新規登録"}</div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
          </Link>
        </div>

        {isAdminEmail(user?.email) && (
          <div className="rt-menu">
            <Link className="rt-menu-row slim" href="/admin">
              <div className="rt-menu-ico slim"><ShieldCheck size={18} strokeWidth={2.1} /></div>
              <div className="rt-menu-l">管理ダッシュボード</div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-menu-cv" />
            </Link>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
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
`;
