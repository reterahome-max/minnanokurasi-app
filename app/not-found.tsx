import Link from "next/link";
import { SearchX, ChevronRight } from "lucide-react";

/**
 * 404 — ブランドトンマナ（globals.css の rt-state 部品を流用）
 */
export const metadata = { title: "ページが見つかりません" };

export default function NotFound() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="rt-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="rt-state">
          <div className="rt-state-ico">
            <SearchX size={30} strokeWidth={1.8} />
          </div>
          <div className="rt-state-t">ページが見つかりません</div>
          <div className="rt-state-d">
            お探しのページは移動または削除された可能性があります。
            ホームからサービスをお探しください。
          </div>
          <Link href="/" className="rt-state-btn solid" style={{ textDecoration: "none" }}>
            ホームへ戻る
            <ChevronRight size={16} strokeWidth={2.6} />
          </Link>
        </div>
      </div>
    </div>
  );
}
