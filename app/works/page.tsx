"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Wrench, Camera } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BeforeAfter from "@/components/BeforeAfter";

/**
 * RE:TERA HOME — 施工事例・ビフォーアフター
 * 実際の施工写真（lib/images の ba_* ペア）をカテゴリ別に掲載。
 * デザインは既存トンマナに準拠（タイトル行・カード・.rt-cmp スライダー・ボトムCTA）。
 * 事例の場所・日付は個別に特定しない（誇大・虚偽表示を避けるため総称表記のみ）。
 */

const CLEANING = [
  { before: "ba_ac_before", after: "ba_ac_after", title: "エアコンクリーニング", desc: "送風ファン・熱交換器のカビとホコリを分解洗浄で除去しました。", href: "/services/ac_wall", link: "エアコンクリーニングの料金を見る" },
  { before: "ba_bath_before", after: "ba_bath_after", title: "浴室クリーニング", desc: "浴槽まわり・壁・床の水アカとカビを徹底洗浄しました。", href: "/services/bath", link: "浴室クリーニングの料金を見る" },
  { before: "ba_kitchen_before", after: "ba_kitchen_after", title: "キッチンクリーニング", desc: "シンク・コンロ・調理台の油汚れと水アカを除去しました。", href: "/services/kitchen", link: "キッチンクリーニングの料金を見る" },
  { before: "ba_hood_before", after: "ba_hood_after", title: "レンジフードクリーニング", desc: "こびりついた油汚れを分解洗浄でリセットしました。", href: "/services/hood", link: "レンジフードクリーニングの料金を見る" },
  { before: "ba_water_before", after: "ba_water_after", title: "洗面所クリーニング", desc: "洗面ボウル・鏡・水栓の水アカと石けんカスを除去しました。", href: "/services/washroom", link: "洗面所クリーニングの料金を見る" },
  { before: "ba_fan_before", after: "ba_fan_after", title: "換気扇クリーニング", desc: "プロペラと枠のホコリ・油汚れを洗浄しました。", href: "/services/fan", link: "換気扇クリーニングの料金を見る" },
  { before: "ba_vacancy_before", after: "ba_vacancy_after", title: "空室クリーニング", desc: "退去後のお部屋全体を入居前の状態まで清掃しました。", href: "/services/vacancy", link: "空室クリーニングの料金を見る" },
];

const REFORM = [
  { before: "ba_cloth_before", after: "ba_cloth_after", title: "クロス張り替え", desc: "日焼け・剥がれのあった壁紙を張り替え、お部屋の印象を一新しました。", href: "/reform/cloth_std", link: "クロス張り替えの概算を見る" },
  { before: "ba_floor_before", after: "ba_floor_after", title: "フローリング張り替え", desc: "傷みの目立つ床材を張り替え、明るい床に生まれ変わりました。", href: "/reform/fl_room", link: "フローリング張り替えの概算を見る" },
  { before: "ba_cf_before", after: "ba_cf_after", title: "CF（クッションフロア）張り替え", desc: "洗面所の汚れ・めくれのあったCFを張り替えました。", href: "/reform/cf_room", link: "CF張り替えの概算を見る" },
  { before: "ba_ftile_before", after: "ba_ftile_after", title: "フロアタイル張り替え", desc: "キッチンの床をフロアタイルで清潔感のある仕上がりに。", href: "/reform/ft_room", link: "フロアタイル張り替えの概算を見る" },
  { before: "ba_toilet_before", after: "ba_toilet_after", title: "トイレ交換", desc: "経年のトイレを新品に交換し、明るい空間になりました。", href: "/reform/toilet_toto_qr", link: "トイレ交換の料金を見る" },
  { before: "ba_net_before", after: "ba_net_after", title: "網戸張り替え", desc: "破れた網戸を張り替え、しっかり閉まる状態に戻しました。", href: "/reform/net_window", link: "網戸張り替えの料金を見る" },
  { before: "ba_door_before", after: "ba_door_after", title: "室内ドアハンドル交換", desc: "古くなったハンドルを新しいレバーハンドルに交換しました。", href: "/reform/door_lever", link: "ドアハンドル交換の料金を見る" },
  { before: "ba_patch_before", after: "ba_patch_after", title: "クロス壁穴補修", desc: "壁にあいた穴を下地から補修し、目立たない仕上がりに。", href: "/reform/cloth_patch", link: "壁穴補修の料金を見る" },
];

function CaseCard({ c }: { c: (typeof CLEANING)[number] }) {
  return (
    <div className="rt-work">
      <BeforeAfter beforeKey={c.before} afterKey={c.after} alt={c.title} beforeSuffix="の施工前" afterSuffix="の施工後" />
      <div className="rt-work-body">
        <div className="rt-work-title">{c.title}</div>
        <p className="rt-work-desc">{c.desc}</p>
        <Link href={c.href} className="rt-work-link">{c.link}<ChevronRight size={15} strokeWidth={2.6} /></Link>
      </div>
    </div>
  );
}

export default function Works() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        <div className="rt-title-row">
          <Link href="/" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">施工事例・ビフォーアフター</h1>
        </div>

        <div className="rt-intro">
          <Camera size={16} strokeWidth={2.2} />
          越谷市・春日部市エリアで対応した実際の施工写真です。つまみを左右にドラッグすると、施工前後を比較できます。
        </div>

        <h2 className="rt-work-sec"><Sparkles size={19} strokeWidth={2.3} />ハウスクリーニングの事例</h2>
        <div className="rt-works">
          {CLEANING.map((c, i) => <CaseCard key={i} c={c} />)}
        </div>

        <h2 className="rt-work-sec"><Wrench size={19} strokeWidth={2.3} />リフォームの事例</h2>
        <div className="rt-works">
          {REFORM.map((c, i) => <CaseCard key={i} c={c} />)}
        </div>

        <div className="rt-cmp-hint"><ChevronLeft size={13} strokeWidth={2.6} />つまみを左右にドラッグして比較<ChevronRight size={13} strokeWidth={2.6} /></div>

        <div style={{ height: 128 }} />
      </div>

      <div className="rt-bottom">
        <Link href="/simulator" className="rt-book"><ChevronRight size={20} strokeWidth={2.3} style={{ display: "none" }} />料金を確認して予約する<ChevronRight size={20} strokeWidth={2.6} /></Link>
        <BottomNav active="home" />
      </div>
    </div>
  );
}

const styles = `
.rt-header{border-bottom:1px solid var(--line);}
.rt-title-row{display:flex;align-items:center;gap:10px;padding:16px 2px 14px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;}
.rt-page-title{font-size:22px;font-weight:900;letter-spacing:.01em;margin:0;}
.rt-intro{display:flex;align-items:flex-start;gap:8px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-intro svg{color:var(--red);flex:none;margin-top:1px;}
.rt-work-sec{display:flex;align-items:center;gap:7px;font-size:17px;font-weight:900;margin:6px 0 12px;}
.rt-work-sec svg{color:var(--red);}
.rt-works{display:flex;flex-direction:column;gap:14px;margin-bottom:22px;}
.rt-work{background:#fff;border:1px solid var(--line);border-radius:16px;padding:13px;box-shadow:var(--shadow);}
.rt-work-body{padding-top:11px;}
.rt-work-title{font-size:15px;font-weight:900;}
.rt-work-desc{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;margin:4px 0 10px;}
.rt-work-link{display:inline-flex;align-items:center;gap:3px;font-size:12.5px;font-weight:800;color:var(--red);text-decoration:none;border:1.5px solid var(--red);border-radius:10px;padding:9px 13px;}
.rt-cmp{position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;background:#EDF1F3;}
.rt-cmp-layer{position:absolute;inset:0;}
.rt-cmp-badge{position:absolute;top:9px;z-index:3;font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:6px;}
.rt-cmp-before{left:9px;background:rgba(40,44,48,.82);}
.rt-cmp-after{right:9px;background:var(--red);}
.rt-cmp-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-1.5px);z-index:4;box-shadow:0 0 0 1px rgba(0,0,0,.1);}
.rt-cmp-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;color:var(--red);box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:ew-resize;}
.rt-cmp-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink-3);margin:2px 0 10px;}
.rt-cmp-hint svg{color:var(--red);}
.rt-photo{width:100%;height:100%;object-fit:cover;display:block;}
.rt-book{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;padding:16px 14px;font-size:16px;font-weight:900;letter-spacing:.03em;cursor:pointer;text-decoration:none;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-book:hover{background:var(--red-deep);}
`;
