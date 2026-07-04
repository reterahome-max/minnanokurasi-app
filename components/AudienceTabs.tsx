import Link from "next/link";
import { User, Building2 } from "lucide-react";

/**
 * 一般 / 法人 の切り替えタブ（SEO安全なリンク型セグメント）。
 * 実体は2つの <a>（/ と /corporate）。JSでの表示切替ではなく実URL遷移なので
 * クロール・被リンク・共有すべてに強い。active でハイライトのみ切り替える。
 */
export default function AudienceTabs({ active }: { active: "personal" | "corporate" }) {
  return (
    <nav className="rt-aud" aria-label="お客様の種別">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Link href="/" className={"rt-aud-tab" + (active === "personal" ? " on" : "")} aria-current={active === "personal" ? "page" : undefined}>
        <User size={15} strokeWidth={2.6} />個人のお客様
      </Link>
      <Link href="/corporate" className={"rt-aud-tab" + (active === "corporate" ? " on" : "")} aria-current={active === "corporate" ? "page" : undefined}>
        <Building2 size={15} strokeWidth={2.6} />法人・管理会社
      </Link>
    </nav>
  );
}

const styles = `
.rt-aud{display:flex;gap:4px;background:var(--red-soft-2,#F3F6FB);border:1px solid var(--line);border-radius:12px;padding:4px;margin-bottom:14px;}
.rt-aud-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;border-radius:9px;font-size:13px;font-weight:800;color:var(--ink-2);text-decoration:none;transition:background .15s,color .15s;}
.rt-aud-tab.on{background:var(--navy);color:#fff;box-shadow:var(--shadow);}
.rt-aud-tab:not(.on):hover{color:var(--ink);}
`;
