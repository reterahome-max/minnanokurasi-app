"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, ChevronRight,
  Layers, Grid3x3, DoorOpen, Droplet, Wrench, Calendar,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Photo from "@/components/Photo";

/**
 * RE:TERA HOME — リフォーム工事一覧
 * RETERA_ReformList.jsx を移植（UIは人気サービス一覧と同一の器）。
 * 価格は【税抜】・材料費/施工費込み・諸経費15%は内部上乗せ（非表示）。
 * price 表示は代表単価（〜/㎡・〜/枚・一式）。詳細な概算は工事詳細 or 見積で quote() 算出。
 */
const FILTERS: { label: string; icon: typeof Layers | null }[] = [
  { label: "すべて", icon: null },
  { label: "クロス", icon: Layers },
  { label: "床", icon: Grid3x3 },
  { label: "建具", icon: DoorOpen },
  { label: "水回り", icon: Droplet },
  { label: "補修", icon: Wrench },
];

// 一覧カードの代表表示（税抜）。id は lib/reformPricing の REFORM_ITEMS に対応。
const ITEMS = [
  { id: "cloth_std",     cat: "クロス", title: "量産クロス貼り替え",            desc: "お部屋の印象を一新",             priceLabel: "980",     unit: "円/㎡",   img: "cloth",  survey: true },
  { id: "cloth_high",    cat: "クロス", title: "ハイグレードクロス貼り替え",    desc: "上質な質感・機能性クロス",       priceLabel: "1,200",   unit: "円/㎡〜", img: "cloth",  survey: true },
  { id: "cf_room",       cat: "床",     title: "CF貼り替え",                    desc: "水回りにも強いクッションフロア", priceLabel: "2,000",   unit: "円/㎡〜", img: "floor",  survey: true },
  { id: "fl_room",       cat: "床",     title: "フローリング貼り替え",          desc: "傷んだ床を美しく",               priceLabel: "10,000",  unit: "円/㎡",   img: "floor",  survey: true },
  { id: "ft_room",       cat: "床",     title: "フロアタイル貼り替え",          desc: "重ね貼りで手軽にリフレッシュ",   priceLabel: "4,000",   unit: "円/㎡〜", img: "floor",  survey: true },
  { id: "door_lever",    cat: "建具",   title: "室内ドアハンドル交換",          desc: "握り玉・レバー各種",             priceLabel: "9,000",   unit: "円/箇所", img: "door",   survey: false },
  { id: "net_window",    cat: "建具",   title: "網戸張り替え",                  desc: "窓用・ベランダ用に対応",         priceLabel: "3,000",   unit: "円/枚〜", img: "net",    survey: false },
  { id: "toilet_toto_qr",cat: "水回り", title: "トイレ交換（TOTO ピュアレストQR）", desc: "材料・標準施工込み",         priceLabel: "130,000", unit: "円〜",    img: "toilet", survey: true },
  { id: "cloth_patch",   cat: "補修",   title: "クロス壁穴・凹み補修",          desc: "気になる穴・凹みを補修",         priceLabel: "15,000",  unit: "円〜",    img: "patch",  survey: false },
];

export default function ReformList() {
  const [filter, setFilter] = useState(0);
  const list = filter === 0 ? ITEMS : ITEMS.filter((s) => s.cat === FILTERS[filter].label);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">リフォーム</h1>
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
          <button className="rt-sort">おすすめ順 <ChevronDown size={15} strokeWidth={2.4} /></button>
          <div className="rt-count">全 <b>{list.length}</b> 件</div>
        </div>

        <div className="rt-grid">
          {list.map((s) => (
            <Link className="rt-card" key={s.id} href={`/reform/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="rt-card-photo">
                <span className={"rt-card-badge " + (s.survey ? "survey" : "book")}>{s.survey ? "現地調査" : "価格確定"}</span>
                <Photo srcKey={s.img} alt={s.title} />
              </div>
              <div className="rt-card-body">
                <div className="rt-card-title">{s.title}</div>
                <div className="rt-card-desc">{s.desc}</div>
                <div className="rt-card-foot">
                  <div className="rt-card-price">{s.priceLabel}<span>{s.unit}</span></div>
                  <div className="rt-card-go"><ChevronRight size={17} strokeWidth={2.6} /></div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="rt-disc">価格は税抜・材料費・施工費込みです。現地状況により追加費用が発生する場合があります。</div>

        <div style={{ height: 128 }} />
      </div>

      <div className="rt-bottom">
        <Link href="/reform/simulator" className="rt-book"><Calendar size={20} strokeWidth={2.3} /><span className="rt-book-main">見積もりを依頼する</span><ChevronRight size={20} strokeWidth={2.6} /></Link>
        <BottomNav active="home" />
      </div>
    </div>
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
.rt-card-badge{position:absolute;top:8px;left:8px;z-index:2;color:#fff;font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:6px;}
.rt-card-badge.book{background:var(--green);}
.rt-card-badge.survey{background:var(--blue);}
.rt-card-body{padding:11px 11px 12px;}
.rt-card-title{font-size:13.5px;font-weight:800;line-height:1.35;margin-bottom:4px;min-height:37px;}
.rt-card-desc{font-size:10.5px;color:var(--ink-3);font-weight:600;margin-bottom:8px;}
.rt-card-foot{display:flex;align-items:flex-end;justify-content:space-between;}
.rt-card-price{font-size:18px;font-weight:900;color:var(--red);line-height:1;}
.rt-card-price span{font-size:11px;margin-left:1px;font-weight:800;}
.rt-card-go{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--line);color:var(--ink-2);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-disc{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.6;margin-top:14px;padding:0 2px;}
.rt-book{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;padding:15px 14px;cursor:pointer;box-shadow:0 -3px 14px rgba(20,28,38,.08);text-decoration:none;}
.rt-book:hover{background:var(--red-deep);}
.rt-book-main{font-size:17px;font-weight:900;letter-spacing:.03em;}
.rt-photo{width:100%;height:100%;object-fit:cover;display:block;}
.rt-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(150deg,#EDF1F3,#E1E7EA);color:#AAB2B8;}
.rt-ph span{font-size:9.5px;font-weight:700;letter-spacing:.14em;}
`;
