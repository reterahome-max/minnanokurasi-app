"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, FileText, Users, Percent, ClipboardList, Phone, Check, ChevronRight,
  ChevronLeft, ChevronDown, RefreshCw, CalendarClock, Wallet, Layers, Calculator, Crown,
  Sparkles, Grid3x3, DoorOpen, Droplets, Zap, Wrench, ShieldCheck,
} from "lucide-react";
import Photo from "@/components/Photo";
import BeforeAfter from "@/components/BeforeAfter";
import BottomNav from "@/components/BottomNav";
import AudienceTabs from "@/components/AudienceTabs";
import { COMPANY, mapUrl } from "@/lib/company";
import { CORP_CATEGORIES, corpMenusByCat, type CorpCatKey } from "@/lib/corporatePricing";
import { homeStyles } from "../homeStyles";

/**
 * RE:TERA HOME — 法人・管理会社向けホーム（BtoB）
 * 一般ホーム（/）とまったく同じUI・レイアウトを共有スタイル（homeStyles）で再現し、
 * theme-navy で色味だけ淡ネイビーに切り替える（デザイン非改変）。
 * メニュー内容は原状回復・空室クリーニング等の法人向けに差し替え、
 * 下部に法人プラン紹介（メリット／定期プラン／導入の流れ）も残す。
 */

// 空室クリーニング（間取り別・一式）を単価表から取得してミニ概算に使用
const ROOMS = corpMenusByCat("clean").filter(
  (m) => m.unit === "一式" && m.name.startsWith("空室クリーニング") && !m.name.includes("戸建て")
);

const CAT_ICONS: Record<CorpCatKey, typeof Sparkles> = {
  clean: Sparkles, wall: Layers, floor: Grid3x3, fixture: DoorOpen, water: Droplets, electric: Zap, other: Wrench,
};

// 代表メニュー（単価表より・表示用）
const POPULAR = [
  { title: "空室クリーニング", desc: "1LDK・2DK（45㎡まで）", price: 40000, unit: "円〜", img: "vacancy" },
  { title: "クロス張替え", desc: "量産クロス（50㎡以上）", price: 980, unit: "円〜/㎡", img: "cloth" },
  { title: "CF張り替え", desc: "既存撤去込み", price: 3500, unit: "円〜/㎡", img: "cf" },
  { title: "水回りクリーニング", desc: "浴室ほか単品対応", price: 16000, unit: "円〜", img: "bath" },
];

// 施工事例（原状回復まわりの実写真）
const BA = [
  { tab: "空室クリーニング", title: "退去後の空室クリーニング", desc: "水回り・床・建具まで、次の入居に向けてまるごと洗浄。", checks: ["キッチン・浴室・トイレの徹底洗浄", "床のワックス仕上げも対応"], before: "ba_vacancy_before", after: "ba_vacancy_after" },
  { tab: "クロス張替え", title: "クロス（壁紙）張替え", desc: "ヤニ・汚れ・破れをリセット。量産クロスは数量割引も。", checks: ["量産クロス 50㎡以上は 980円/㎡", "アクセントクロスもご相談可"], before: "ba_cloth_before", after: "ba_cloth_after" },
  { tab: "床（CF）", title: "クッションフロア張り替え", desc: "傷・へこみの目立つ床材を一新。原状回復の定番。", checks: ["既存撤去込みで施工", "トイレ・洗面所の部分張替えも"], before: "ba_cf_before", after: "ba_cf_after" },
  { tab: "水回り", title: "水回りクリーニング", desc: "水垢・カビを分解洗浄し、清潔な状態へ回復。", checks: ["浴室・キッチン・洗面所に対応", "エプロン内部・鏡のウロコも"], before: "ba_water_before", after: "ba_water_after" },
];

const FLOW = [
  { n: "1", icon: Calculator, t: "概算をチェック", d: "間取りと作業内容をシミュレーターで選ぶと、税抜の概算がその場でわかります。" },
  { n: "2", icon: FileText, t: "見積を依頼", d: "物件情報とご連絡先を送信（登録不要）。専任担当が受付します。" },
  { n: "3", icon: ClipboardList, t: "写真確認・現地調査", d: "写真または現地調査のうえ、正式なお見積りをご提示します。" },
  { n: "4", icon: RefreshCw, t: "着工・請求書払い", d: "スケジュールを調整して施工。月締め請求書払いに対応します。" },
];

const MERITS = [
  { icon: Building2, t: "複数物件をまとめて依頼", d: "管理戸数が多くても、一括で受付・スケジュール調整します。" },
  { icon: FileText, t: "請求書・後払いに対応", d: "月締め請求書払いに対応。経理処理もスムーズです。" },
  { icon: Users, t: "専任担当がつきます", d: "窓口を一本化。やり取りの手間を最小限に。" },
  { icon: Percent, t: "数量割引", d: "戸数・頻度に応じた法人価格をご用意します。" },
];
const USECASES = [
  "入居前・退去後の空室クリーニング",
  "定期巡回でのエアコン・水回り清掃",
  "原状回復に伴うまとめ清掃",
  "複数拠点・店舗の定期メンテナンス",
];

const yen = (n: number) => n.toLocaleString("ja-JP");

export default function CorporateHome() {
  const router = useRouter();
  const [roomIdx, setRoomIdx] = useState(2); // 既定：1LDK・2DK
  const [qty, setQty] = useState(1);
  const [baTab, setBaTab] = useState(0);
  const [cat, setCat] = useState(-1);

  const room = ROOMS[roomIdx];
  const total = (room?.price ?? 0) * qty;
  const ba = BA[baTab];

  return (
    <div className="theme-navy" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: homeStyles + navyExtra }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/" className="rt-back" aria-label="ホームへ戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">法人・管理会社の方へ</div>
        </header>

        {/* 個人 / 法人 切り替え（リンク型・SEO安全） */}
        <AudienceTabs active="corporate" />

        {/* ヒーロー */}
        <section className="rt-hero">
          <div className="rt-hero-photo">
            <Photo srcKey="vacancy" alt="越谷市・春日部市の賃貸物件の原状回復" priority />
          </div>
          <div className="rt-hero-inner">
            <div className="rt-hero-ribbon">＼ 越谷市・春日部市の管理会社・オーナー様へ ／</div>
            <h1 className="rt-hero-h1">賃貸の<span className="rt-hero-red">原状回復</span>を、<br />まるごとおまかせ。</h1>
            <p className="rt-hero-sub">空室クリーニング・クロス・床・設備の原状回復を<br />ワンストップで対応します。</p>
            <div className="rt-hero-cats">
              <Link href="/corporate/restoration" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="vacancy" alt="原状回復" /></span>原状回復
              </Link>
              <Link href="/corporate/restoration/simulator" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="bath" alt="空室クリーニング" /></span>空室清掃
              </Link>
              <Link href="/corporate/contact" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="ac" alt="定期プラン" /></span>定期プラン
              </Link>
            </div>
            <div className="rt-trust">
              <div className="rt-trust-card">
                <div className="rt-trust-ico"><FileText size={18} strokeWidth={2.6} /></div>
                <div><div className="rt-trust-t">請求書・後払い</div><div className="rt-trust-d">月締め請求書払いに対応</div></div>
              </div>
              <div className="rt-trust-card">
                <div className="rt-trust-ico"><Building2 size={18} strokeWidth={2.6} /></div>
                <div><div className="rt-trust-t">複数物件を一括</div><div className="rt-trust-d">戸数が多くてもまとめて対応</div></div>
              </div>
              <div className="rt-trust-card">
                <div className="rt-trust-ico"><ShieldCheck size={18} strokeWidth={2.6} /></div>
                <div><div className="rt-trust-t">損害保険加入</div><div className="rt-trust-d">万が一の時も安心</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ① 概算シミュレーター */}
        <section className="rt-sim">
          <div className="rt-sim-head">
            <div className="rt-sim-left">
              <div className="rt-sim-ico"><Calculator size={22} strokeWidth={2.2} /></div>
              <div><h2 className="rt-sim-title">かんたん概算シミュレーター</h2><div className="rt-sim-note">空室清掃の目安が30秒で</div></div>
            </div>
            <div className="rt-sim-total">
              <div className="rt-sim-total-l">概算（税抜）</div>
              <div className="rt-sim-total-v">{yen(total)}<span>円〜</span></div>
            </div>
          </div>
          <div className="rt-selects">
            <label className="rt-select">
              <span className="rt-select-l">間取りを選ぶ</span>
              <div className="rt-select-box">
                <select value={roomIdx} onChange={(e) => setRoomIdx(Number(e.target.value))}>
                  {ROOMS.map((r, i) => <option key={r.id} value={i}>{r.name.replace("空室クリーニング ", "")}</option>)}
                </select><ChevronDown size={16} />
              </div>
            </label>
            <label className="rt-select">
              <span className="rt-select-l">戸数</span>
              <div className="rt-select-box">
                <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}戸</option>)}
                </select><ChevronDown size={16} />
              </div>
            </label>
          </div>
          <Link href="/corporate/restoration/simulator" className="rt-cta">くわしく概算する（原状回復）<ChevronRight size={20} strokeWidth={2.6} /></Link>
          <div className="rt-sim-checks">
            <span><Check size={13} strokeWidth={3} />表示は税抜のめやす</span>
            <span><Check size={13} strokeWidth={3} />写真確認で正式見積</span>
            <span><Check size={13} strokeWidth={3} />複数物件まとめてOK</span>
          </div>
        </section>

        {/* ② カテゴリ */}
        <h2 className="rt-cats-h">カテゴリから選ぶ</h2>
        <p className="rt-cats-sub">原状回復の作業カテゴリから、概算メニューをすぐに確認できます。</p>
        <div className="rt-cats">
          {CORP_CATEGORIES.map((c, i) => {
            const Icon = CAT_ICONS[c.key];
            return (
              <button
                key={c.key}
                className={"rt-cat" + (i === cat ? " rt-cat-on" : "")}
                onClick={() => { setCat(i); router.push("/corporate/restoration/simulator"); }}
              >
                <Icon size={24} strokeWidth={2.1} /><span>{c.label.split("・")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ③ 代表メニュー */}
        <section className="rt-pop">
          <div className="rt-pop-head">
            <h2 className="rt-pop-title"><Crown size={20} strokeWidth={2.4} className="rt-crown" />代表メニュー</h2>
            <Link href="/corporate/restoration/simulator" className="rt-pop-all">すべて見る <ChevronRight size={15} strokeWidth={2.6} /></Link>
          </div>
          <div className="rt-cards">
            {POPULAR.map((p, i) => (
              <Link href="/corporate/restoration/simulator" className="rt-card" key={i} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rt-card-photo">
                  <Photo srcKey={p.img} alt={p.title} />
                </div>
                <div className="rt-card-body">
                  <div className="rt-card-title">{p.title}</div>
                  <div className="rt-card-desc">{p.desc}</div>
                  <div className="rt-card-foot">
                    <div className="rt-card-price">{yen(p.price)}<span>{p.unit}</span></div>
                    <div className="rt-card-go"><ChevronRight size={18} strokeWidth={2.6} /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ④ ビフォーアフター */}
        <section className="rt-ba-sec">
          <h2 className="rt-sec-h">ビフォーアフター</h2>
          <p className="rt-sec-sub">原状回復の仕上がりを、実際の施工写真でご確認ください。</p>
          <div className="rt-ba-tabs">
            {BA.map((b, i) => (
              <button key={i} className={"rt-ba-tab" + (i === baTab ? " rt-ba-tab-on" : "")} onClick={() => setBaTab(i)}>{b.tab}</button>
            ))}
          </div>
          <div className="rt-ba-card">
            <div className="rt-ba-info">
              <div className="rt-ba-title">{ba.title}</div>
              <div className="rt-ba-desc">{ba.desc}</div>
              <ul className="rt-ba-checks">
                {ba.checks.map((c, i) => <li key={i}><Check size={14} strokeWidth={3} />{c}</li>)}
              </ul>
            </div>
            <div className="rt-ba-imgs">
              <BeforeAfter beforeKey={ba.before} afterKey={ba.after} alt={ba.title} beforeSuffix=" 施工前" afterSuffix=" 施工後" beforeBadgeClass="rt-ba-before" afterBadgeClass="rt-cmp-badge-r rt-ba-after" />
            </div>
            <div className="rt-cmp-hint"><ChevronLeft size={13} strokeWidth={2.6} />つまみを左右にドラッグして比較<ChevronRight size={13} strokeWidth={2.6} /></div>
            <Link href="/corporate/restoration/simulator" className="rt-ba-link">このメニューの概算を見る <ChevronRight size={15} strokeWidth={2.6} /></Link>
          </div>
          <Link href="/works" className="rt-ba-more">施工事例をもっと見る（ビフォーアフター）<ChevronRight size={16} strokeWidth={2.6} /></Link>
        </section>

        {/* ⑤ ご利用の流れ */}
        <section className="rt-flow-sec">
          <h2 className="rt-sec-h">ご依頼の流れ</h2>
          <p className="rt-sec-sub">概算から着工まで、シンプルなステップでご依頼いただけます。</p>
          <div className="rt-flow">
            {FLOW.map((f, i) => {
              const Icon = f.icon;
              return (
                <div className="rt-flow-row" key={i}>
                  <div className="rt-flow-num">{f.n}</div>
                  <div className="rt-flow-card">
                    <div className="rt-flow-ico"><Icon size={22} strokeWidth={2.1} /></div>
                    <div className="rt-flow-body">
                      <div className="rt-flow-t">{f.t}</div>
                      <div className="rt-flow-d">{f.d}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ⑥ 法人プランの特長 */}
        <h2 className="rt-sec-h">法人プランの特長</h2>
        <p className="rt-sec-sub">管理会社・オーナー様の運用に合わせたBtoBサポート。</p>
        <div className="rt-merits">
          {MERITS.map((m, i) => { const Icon = m.icon; return (
            <div className="rt-merit" key={i}>
              <div className="rt-merit-ico"><Icon size={22} strokeWidth={2.1} /></div>
              <div className="rt-merit-t">{m.t}</div>
              <div className="rt-merit-d">{m.d}</div>
            </div>
          ); })}
        </div>

        <div className="rt-usecase">
          <div className="rt-usecase-h"><ClipboardList size={18} strokeWidth={2.2} />こんなご依頼に</div>
          <ul className="rt-usecase-list">
            {USECASES.map((u, i) => <li key={i}><Check size={15} strokeWidth={3} />{u}</li>)}
          </ul>
        </div>

        {/* ⑦ 定期プラン */}
        <h2 className="rt-sec-h">定期プランのご案内</h2>
        <p className="rt-sec-sub">月次・隔月などの定期清掃で、物件の美観と資産価値をキープ。</p>
        <div className="rt-plan-card">
          <div className="rt-plan-grid">
            <div className="rt-plan-item"><CalendarClock size={18} strokeWidth={2.2} /><div><b>スケジュール一括管理</b><span>訪問日を固定化し、都度依頼の手間をゼロに。</span></div></div>
            <div className="rt-plan-item"><Wallet size={18} strokeWidth={2.2} /><div><b>定期割引・請求書払い</b><span>頻度に応じた法人価格。月締め請求書に対応。</span></div></div>
            <div className="rt-plan-item"><Layers size={18} strokeWidth={2.2} /><div><b>スポット併用OK</b><span>定期＋退去時のスポット清掃も同じ窓口で。</span></div></div>
          </div>
          <div className="rt-plan-note">頻度・戸数によりお見積り。まずはお気軽にご相談ください。</div>
        </div>

        {/* ⑧ 法人メニュー */}
        <h2 className="rt-sec-h">法人メニュー</h2>
        <p className="rt-sec-sub">目的に合わせて、最適な窓口をお選びください。</p>
        <div className="rt-cmenu">
          <Link href="/corporate/restoration" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><ClipboardList size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">原状回復・退去後清掃</div><div className="rt-cmenu-d">対応範囲の紹介と、概算がわかる見積シミュレーター</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          <Link href="/corporate/contact" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><Layers size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">複数物件をまとめて依頼</div><div className="rt-cmenu-d">物件を何件でも追加して一括でお申し込み</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          <Link href="/corporate/contact" className="rt-cmenu-row">
            <div className="rt-cmenu-ico"><RefreshCw size={20} strokeWidth={2.1} /></div>
            <div className="rt-cmenu-body"><div className="rt-cmenu-t">定期プランを相談する</div><div className="rt-cmenu-d">月次・隔月の定期清掃をお見積り</div></div>
            <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
          </Link>
          {COMPANY.tel && (
            <a href={`tel:${COMPANY.tel.replace(/[^0-9+]/g, "")}`} className="rt-cmenu-row">
              <div className="rt-cmenu-ico"><Phone size={20} strokeWidth={2.1} /></div>
              <div className="rt-cmenu-body"><div className="rt-cmenu-t">電話で相談する</div><div className="rt-cmenu-d">{COMPANY.tel}（{COMPANY.area}）</div></div>
              <ChevronRight size={18} strokeWidth={2.4} className="rt-cmenu-cv" />
            </a>
          )}
        </div>

        {/* ⑨ 相談 */}
        <div className="rt-contact">
          <div className="rt-contact-t">まずはお気軽にご相談ください</div>
          <div className="rt-contact-d">物件数・ご希望をお聞かせいただければ、法人プランをお見積りします（登録不要）。</div>
          <Link href="/corporate/contact" className="rt-contact-btn"><FileText size={18} strokeWidth={2.2} />法人問い合わせフォーム<ChevronRight size={17} strokeWidth={2.6} className="rt-contact-cv" /></Link>
        </div>

        {/* フッター */}
        <footer className="rt-footer">
          <div className="rt-footer-links">
            <Link href="/corporate/restoration">原状回復</Link>
            <Link href="/corporate/restoration/simulator">概算シミュレーター</Link>
            <Link href="/works">施工事例</Link>
            <a href={mapUrl()} target="_blank" rel="noopener noreferrer">地図で見る</a>
            <Link href="/">個人のお客様へ</Link>
            <Link href="/legal">利用規約・プライバシー</Link>
            <Link href="/corporate/contact">お問い合わせ</Link>
          </div>
          <div className="rt-footer-note">{COMPANY.name}｜対応エリア：{COMPANY.area}</div>
          <div className="rt-footer-copy">© {new Date().getFullYear()} {COMPANY.name}</div>
        </footer>

        <div style={{ height: 132 }} />
      </div>

      {/* 固定フッター */}
      <div className="rt-bottom">
        <div className="rt-cta2">
          <a href={`tel:${COMPANY.tel.replace(/[^0-9+]/g, "")}`} className="rt-cta2-tel">
            <Phone size={19} strokeWidth={2.4} /><span>お電話で相談</span>
          </a>
          <Link href="/corporate/restoration/simulator" className="rt-cta2-book">
            <Calculator size={19} strokeWidth={2.4} /><span>概算を出す</span><ChevronRight size={18} strokeWidth={2.6} />
          </Link>
        </div>
        <BottomNav active="home" />
      </div>
    </div>
  );
}

// 一般ホームのCSS（homeStyles）に、法人紹介ブロック用の追加スタイルとネイビー変数を重ねる。
const navyExtra = `
.theme-navy{--red:#33517D;--red-deep:#2a4568;--red-soft:#E9EEF6;--red-soft-2:#F3F6FB;}
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-merits{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:22px;}
.rt-merit{background:#fff;border:1px solid var(--line);border-radius:15px;padding:15px;box-shadow:var(--shadow);}
.rt-merit-ico{width:44px;height:44px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
.rt-merit-t{font-size:14px;font-weight:900;line-height:1.3;margin-bottom:5px;}
.rt-merit-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-usecase{background:var(--navy);border-radius:16px;padding:18px;margin-bottom:22px;color:#fff;}
.rt-usecase-h{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:900;margin-bottom:13px;}
.rt-usecase-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
.rt-usecase-list li{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;}
.rt-usecase-list svg{color:#fff;background:var(--red);border-radius:50%;padding:2px;flex:none;}
.rt-plan-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-plan-grid{display:flex;flex-direction:column;gap:11px;}
.rt-plan-item{display:flex;align-items:flex-start;gap:10px;}
.rt-plan-item svg{color:var(--red);flex:none;margin-top:2px;}
.rt-plan-item b{display:block;font-size:13px;font-weight:800;margin-bottom:2px;}
.rt-plan-item span{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-plan-note{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:13px;padding-top:12px;border-top:1px solid var(--line);}
.rt-cmenu{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-bottom:22px;box-shadow:var(--shadow);}
.rt-cmenu-row{display:flex;align-items:center;gap:12px;padding:15px 14px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;}
.rt-cmenu-row:last-child{border-bottom:none;}
.rt-cmenu-ico{flex:none;width:42px;height:42px;border-radius:11px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-cmenu-body{flex:1;min-width:0;}
.rt-cmenu-t{font-size:14px;font-weight:800;}
.rt-cmenu-d{font-size:11px;color:var(--ink-3);font-weight:600;margin-top:2px;}
.rt-cmenu-cv{color:var(--ink-3);flex:none;}
.rt-contact{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px 16px;text-align:center;box-shadow:var(--shadow);margin-bottom:8px;}
.rt-contact-t{font-size:17px;font-weight:900;margin-bottom:6px;}
.rt-contact-d{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;margin-bottom:16px;}
.rt-contact-btn{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;border-radius:13px;padding:15px;font-size:15px;font-weight:900;cursor:pointer;text-decoration:none;}
.rt-contact-btn:hover{background:var(--red-deep);}
.rt-contact-cv{position:absolute;right:15px;}
`;
