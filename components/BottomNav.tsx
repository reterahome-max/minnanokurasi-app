"use client";

import Link from "next/link";
import { Home, Calculator, Calendar, Mail, User } from "lucide-react";

/**
 * 共通ボトムナビ。active タブを props で受け取る。
 * 見た目は各 jsx の .rt-nav / .rt-nav-btn / .rt-nav-on に一致。CSS は globals.css。
 * 固定配置の .rt-bottom ラッパーは画面側で（予約バー等と一緒に）組み立てる。
 */

export type NavKey = "home" | "simulator" | "orders" | "messages" | "mypage";

const NAV: { key: NavKey; icon: typeof Home; label: string; href: string }[] = [
  { key: "home", icon: Home, label: "ホーム", href: "/" },
  { key: "simulator", icon: Calculator, label: "料金シミュレーター", href: "/simulator" },
  { key: "orders", icon: Calendar, label: "予約・注文", href: "/orders" },
  { key: "messages", icon: Mail, label: "メッセージ", href: "/messages" },
  { key: "mypage", icon: User, label: "マイページ", href: "/mypage" },
];

export default function BottomNav({ active }: { active: NavKey }) {
  return (
    <nav className="rt-nav">
      {NAV.map((n) => {
        const Icon = n.icon;
        const on = n.key === active;
        return (
          <Link key={n.key} href={n.href} className={"rt-nav-btn" + (on ? " rt-nav-on" : "")}>
            <Icon size={22} strokeWidth={on ? 2.5 : 2.1} />
            <span>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
