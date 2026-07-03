"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft, ChevronDown, ChevronRight,
  Wind, ShowerHead, Fan, Utensils, Droplets, Waves, Sparkles, Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";
import { popularList, num, CATEGORIES } from "@/lib/pricing";

/**
 * RE:TERA HOME — 人気サービス一覧（ホームの「すべて見る」遷移先）
 * RETERA_ServiceList.jsx を移植。サービス・価格・カテゴリは lib/pricing を参照。
 * URL の ?category=（pricing の cat）で初期絞り込みを設定（ホームのカテゴリと連動）。
 */
// カテゴリ名は lib/pricing の cat を正とし、アイコンのみ対応付け
const FILTER_ICONS: Record<string, typeof Wind> = {
  エアコン: Wind, 浴室: ShowerHead, レンジフード: Fan, キッチン: Utensils,
  トイレ: Droplets, 洗面所: Waves, 空室: Sparkles,
};
const FILTERS: { label: string; icon: typeof Wind | null }[] = [
  { label: "すべて", icon: null },
  ...CATEGORIES.map((c) => ({ label: c, icon: FILTER_ICONS[c] ?? null })),
];

const rankColor = (r: number) => (r === 1 ? "#EE8A00" : r === 2 ? "#22A24A" : r === 3 ? "#EE8A00" : "#6B7178");

const filterIndexOf = (category: string | null) => {
  const idx = FILTERS.findIndex((f) => f.label === category);
  return idx > 0 ? idx : 0; // 無効値・未指定は「すべて」
};

function ServiceListInner() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [filter, setFilter] = useState(() => filterIndexOf(category));
  const [sort, setSort] = useState<"rank" | "price">("rank");

  // URL の category が変わったら初期絞り込みを同期（ホームから再入する場合）
  useEffect(() => {
    setFilter(filterIndexOf(category));
  }, [category]);

  const all = popularList();
  const filtered = filter === 0 ? all : all.filter((s) => s.cat === FILTERS[filter].label);
  const list = sort === "price" ? [...filtered].sort((a, b) => a.price - b.price) : filtered;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">人気サービス一覧</h1>
        </div>

        <div className="rt-filters">
          {FILTERS.map((f, i) => {
            const Icon = f.icon;
            return (
              <button key={i} className={"rt-filter" + (i === filter ? " rt-filter-on" : "")} onClick={() => setFilter(i)}>
                {Icon && <Icon size={17} strokeWidth={2.2} />}{f.label}
              </button>
            );
          })}
        </div>

        <div className="rt-sort-row">
          <button className="rt-sort" onClick={() => setSort((x) => (x === "rank" ? "price" : "rank"))} aria-pressed={sort === "price"}>{sort === "rank" ? "人気順" : "価格が安い順"} <ChevronDown size={15} strokeWidth={2.4} /></button>
          <div className="rt-count">全 <b>{list.length}</b> 件</div>
        </div>

        <div className="rt-grid">
          {list.map((s) => (
            <Link className="rt-card" key={s.id} href={`/services/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="rt-card-photo">
                <span className="rt-card-rank" style={{ background: rankColor(s.rank) }}>人気No.{s.rank}</span>
                <Photo srcKey={s.img} alt={s.title} />
              </div>
              <div className="rt-card-body">
                <div className="rt-card-title">{s.title}</div>
                <div className="rt-card-desc">{s.desc}</div>
                <div className="rt-card-foot">
                  <div className="rt-card-price">{num(s.price)}<span>円〜</span></div>
                  <div className="rt-card-go"><ChevronRight size={17} strokeWidth={2.6} /></div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ height: 128 }} />
      </div>

      <div className="rt-bottom">
        <Link href="/simulator" className="rt-book"><Calendar size={20} strokeWidth={2.3} /><span className="rt-book-main">料金を確認する</span><ChevronRight size={20} strokeWidth={2.6} /></Link>
        <BottomNav active="home" />
      </div>
    </div>
  );
}

export default function ServiceList() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg)", minHeight: "100vh" }} />}>
      <ServiceListInner />
    </Suspense>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-title-row{display:flex;align-items:center;gap:10px;padding:16px 2px 14px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;}
.rt-page-title{font-size:24px;font-weight:900;letter-spacing:.01em;margin:0;}
.rt-filters{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;margin-bottom:12px;}
.rt-filters::-webkit-scrollbar{display:none;}
.rt-filter{flex:none;display:flex;align-items:center;gap:5px;background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:9px 16px;font-size:13px;font-weight:700;color:var(--ink-2);cursor:pointer;white-space:nowrap;}
.rt-filter-on{border-color:var(--red);color:var(--red);}
.rt-sort-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.rt-sort{display:flex;align-items:center;gap:5px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:9px 14px;font-size:13px;font-weight:700;color:var(--ink);cursor:pointer;}
.rt-count{font-size:13px;color:var(--ink-2);font-weight:700;}
.rt-count b{color:var(--red);font-size:16px;margin:0 1px;}
.rt-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.rt-card{background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;box-shadow:var(--shadow);}
.rt-card-photo{position:relative;height:108px;overflow:hidden;}
.rt-card-rank{position:absolute;top:8px;left:8px;z-index:2;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:6px;}
.rt-card-body{padding:11px 11px 12px;}
.rt-card-title{font-size:13.5px;font-weight:800;line-height:1.35;margin-bottom:4px;min-height:37px;}
.rt-card-desc{font-size:10.5px;color:var(--ink-3);font-weight:600;margin-bottom:8px;}
.rt-card-foot{display:flex;align-items:flex-end;justify-content:space-between;}
.rt-card-price{font-size:19px;font-weight:900;color:var(--red);line-height:1;}
.rt-card-price span{font-size:12px;margin-left:1px;}
.rt-card-go{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--line);color:var(--ink-2);display:flex;align-items:center;justify-content:center;}
.rt-book{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;padding:15px 14px;cursor:pointer;box-shadow:0 -3px 14px rgba(20,28,38,.08);text-decoration:none;}
.rt-book:hover{background:var(--red-deep);}
.rt-book-main{font-size:17px;font-weight:900;letter-spacing:.03em;}
.rt-photo{width:100%;height:100%;object-fit:cover;display:block;}
.rt-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(150deg,#EDF1F3,#E1E7EA);color:#AAB2B8;}
.rt-ph span{font-size:9.5px;font-weight:700;letter-spacing:.14em;}
`;
