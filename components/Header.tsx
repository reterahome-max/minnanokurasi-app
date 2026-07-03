"use client";

import Link from "next/link";
import { Menu, Bell, User, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * 共通ヘッダー（ロゴ＋ベル＋アバター）。
 * 見た目は各 jsx の .rt-header に一致。CSS は globals.css。
 * アバターはログイン状態で遷移先のみ切替（未ログイン→/login、ログイン→/mypage）。
 */
export default function Header({
  showAvatar = true,
  tag = "ハウスクリーニング",
}: {
  showAvatar?: boolean;
  tag?: string;
}) {
  const { user } = useAuth();
  return (
    <header className="rt-header">
      <Link href="/menu" className="rt-icon-btn" aria-label="メニュー">
        <Menu size={24} strokeWidth={2.2} />
      </Link>
      <Link href="/" className="rt-brand" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="rt-brand-mark">
          <Home size={19} strokeWidth={2.6} />
        </div>
        <div>
          <div className="rt-brand-name">RE:TERA HOME</div>
          <div className="rt-brand-tag">{tag}</div>
        </div>
      </Link>
      <div className="rt-header-right">
        <Link href="/settings/notifications" className="rt-icon-btn" aria-label="お知らせ">
          <Bell size={22} strokeWidth={2.2} />
          <span className="rt-bell-dot" />
        </Link>
        {showAvatar && (
          <Link href={user ? "/mypage" : "/login"} className="rt-avatar" aria-label="アカウント">
            <User size={20} strokeWidth={2.2} />
          </Link>
        )}
      </div>
    </header>
  );
}
