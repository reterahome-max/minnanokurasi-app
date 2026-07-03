"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/states";

/**
 * ログイン必須ページのガード。
 * /orders・/mypage 等をこのコンポーネントでラップする。
 * - Firebase 未設定（configured=false）時はガード無効（そのまま表示）。
 * - 未ログインは /login?redirect=現在パス へ。
 * ※ /booking/* はゲスト予約を許可するためガードしない（確定時に連絡先必須）。
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!configured) return; // 未設定時は無効
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [configured, loading, user, pathname, router]);

  if (!configured) return <>{children}</>;
  if (loading) {
    return (
      <div className="rt-shell" style={{ minHeight: "100vh" }}>
        <Loading label="読み込み中" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
