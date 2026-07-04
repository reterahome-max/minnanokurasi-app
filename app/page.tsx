"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Check,
  Calendar,
  Crown,
  ShieldCheck,
  Wind,
  ShowerHead,
  Fan,
  Utensils,
  Droplets,
  Waves,
  Sparkles,
  Wrench,
  CreditCard,
  Phone,
  Clock,
  Truck,
  MessageCircle,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AudienceTabs from "@/components/AudienceTabs";
import Photo from "@/components/Photo";
import BeforeAfter from "@/components/BeforeAfter";
import { getService, calcBill, serviceGroups, groupForService, num, CATEGORIES as CATS } from "@/lib/pricing";
import { REFORM_MENU } from "@/lib/reformPricing";
import { fetchMonthAvailability } from "@/lib/firestore";
import { today, defaultAvail, shortDateLabel } from "@/lib/booking";
import { COMPANY, isServiceArea, mapUrl } from "@/lib/company";
import { homeStyles } from "./homeStyles";

/**
 * RE:TERA HOME — ホーム画面（ヒーロー〜FAQ〜相談まで／UX順に統合）
 * RETERA_Home_full.jsx を移植。<style> はそのまま保持。
 * :root / ヘッダー / ボトムナビ / 写真は共通（globals.css + components）を使用。
 */

// ビフォーアフター比較スライダー（つまみを左右にドラッグで切替）

// カテゴリ名は lib/pricing の cat を単一の正とし、アイコンのみここで対応付け
const CAT_ICONS: Record<string, typeof Wind> = {
  エアコン: Wind, 浴室: ShowerHead, レンジフード: Fan, キッチン: Utensils,
  トイレ: Droplets, 洗面所: Waves, 空室: Sparkles,
};
// クリーニングのカテゴリ＋リフォーム入口（/reform へ遷移・並列カテゴリ）
const CATEGORIES = [
  ...CATS.map((label) => ({ label, icon: CAT_ICONS[label] ?? Sparkles })),
  { label: "リフォーム", icon: Wrench },
];

// 価格は lib/pricing を単一データソースに（描画時に getService から取得）
const POPULAR = [
  { id: "ac_wall", rank: "人気No.1", color: "var(--red)", title: "エアコンクリーニング（壁掛け）", desc: "カビ・ホコリを徹底洗浄", img: "ac" },
  { id: "bath", rank: "人気No.2", color: "#22A24A", title: "浴室クリーニング", desc: "カビ・水アカを徹底除去", img: "bath" },
  { id: "hood", rank: "人気No.3", color: "#EE8A00", title: "レンジフードクリーニング", desc: "油汚れをスッキリ除去", img: "hood" },
];

const BA = [
  { tab: "エアコン", id: "ac_wall", title: "エアコンクリーニング（壁掛け）", desc: "内部のカビ・ホコリを徹底洗浄。嫌なニオイを除去し、空気もクリーンに。",
    checks: ["カビ・ホコリを徹底除去", "冷暖房効率UPで電気代節約", "アレルギー・におい対策に効果的"], before: "ba_ac_before", after: "ba_ac_after" },
  { tab: "浴室", id: "bath", title: "浴室クリーニング", desc: "カビ・水アカ・石けんカスを徹底除去。清潔で快適なバスルームに。",
    checks: ["カビ・黒ずみを徹底除去", "水アカ・石けんカスを除去", "鏡や床もピカピカに"], before: "ba_bath_before", after: "ba_bath_after" },
  { tab: "レンジフード", id: "hood", title: "レンジフードクリーニング", desc: "油汚れをすっきり除去。換気効率が上がり、キッチン環境も快適に。",
    checks: ["頑固な油汚れを徹底除去", "換気効率UPで快適", "ニオイ・ベタつきを解消"], before: "ba_hood_before", after: "ba_hood_after" },
  { tab: "水回り", id: "", title: "水回りクリーニング", desc: "キッチン・洗面・トイレの水アカや汚れをまとめてリセット。",
    checks: ["水アカ・黒ずみを除去", "抗菌仕上げで清潔長持ち", "まとめて依頼でおトク"], before: "ba_water_before", after: "ba_water_after" },
];

const FLOW = [
  { n: 1, t: "ご予約", d: "Web・電話からご希望のサービスと日時を選んでご予約ください。ご質問やご相談もお気軽にどうぞ。", icon: Phone },
  { n: 2, t: "日程確定", d: "担当者よりご連絡し、日時を確定します。ご希望があれば、最短で当日・翌日のご案内も可能です。", icon: Calendar },
  { n: 3, t: "ご訪問・作業", d: "経験豊富なスタッフがご指定の日時にお伺いし、丁寧に作業します。養生や周辺の配慮も徹底します。", icon: Wrench },
  { n: 4, t: "仕上がり確認", d: "作業完了後、お客様と一緒に仕上がりをご確認いただきます。気になる箇所があれば、その場で対応します。", icon: Search },
  { n: 5, t: "お支払い", d: "ご確認後、現金・クレジットカード・電子決済でお支払い。領収書の発行も可能です。", icon: CreditCard },
];

const FAQ_CATS = ["すべて", "料金", "作業内容", "訪問前", "お支払い", "キャンセル"];
const FAQS = [
  { cat: "料金", q: "追加料金はありますか？", a: "基本的にお見積り金額以外の追加料金はかかりません。汚れの状況による追加料金や、駐車場代が発生する場合のみ、作業前にご説明・ご同意のうえで対応いたします。" },
  { cat: "訪問前", q: "駐車場がない場合はどうなりますか？", a: "近隣のコインパーキングを利用します。その場合の駐車料金はお客様のご負担となります。作業前に想定金額をご案内します。" },
  { cat: "作業内容", q: "作業時間はどのくらいですか？", a: "エアコンクリーニング（壁掛け）は約60〜90分が目安です。機種や汚れの状況により前後する場合があります。" },
  { cat: "お支払い", q: "支払い方法は何がありますか？", a: "現金、クレジットカード、各種QR決済に対応しています。訪問後、作業完了のご確認後にお支払いをお願いしています。" },
  { cat: "作業内容", q: "古いエアコンでも依頼できますか？", a: "10年以上経過したエアコンでも対応可能な場合が多いです。ただし、製造年や状態によってはお受けできない場合があります。" },
  { cat: "キャンセル", q: "予約のキャンセルはできますか？", a: "マイページやメッセージからいつでもご連絡ください。前日までのご連絡なら無料で変更・キャンセルできます。" },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rt-faq-item" data-open={open}>
      <button className="rt-faq-q" onClick={() => setOpen((o) => !o)}>
        <span className="rt-faq-mark">Q</span>
        <span className="rt-faq-qt">{q}</span>
        <ChevronDown size={18} strokeWidth={2.4} className="rt-faq-cv" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <div className="rt-faq-a" style={{ maxHeight: open ? 320 : 0 }}>
        <div className="rt-faq-a-in">
          <span className="rt-faq-amark">A</span>
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function RETERAHome() {
  const router = useRouter();
  const [cat, setCat] = useState(0);
  const [baTab, setBaTab] = useState(0);
  const [faqCat, setFaqCat] = useState(0);

  // 最短空き状況（availability から動的算出。未設定時は既定パターン）
  const [slotInfo, setSlotInfo] = useState<{ label: string; weekCount: number } | null>(null);
  useEffect(() => {
    const t = today();
    let active = true;
    fetchMonthAvailability(t.year, t.month)
      .then((a) => a ?? defaultAvail(t.year, t.month))
      .catch(() => defaultAvail(t.year, t.month))
      .then((avail) => {
        if (!active) return;
        const days = Object.keys(avail).map(Number).filter((d) => d > t.day).sort((a, b) => a - b);
        const open = days.filter((d) => avail[d] === "○" || avail[d] === "△");
        const earliest = open[0];
        const weekCount = open.filter((d) => d <= t.day + 7).length;
        setSlotInfo({
          label: earliest ? shortDateLabel(t.year, t.month, earliest) : "お問い合わせください",
          weekCount,
        });
      });
    return () => { active = false; };
  }, []);

  // 対応エリア判定（郵便番号の先頭3桁）
  const [zip, setZip] = useState("");
  const [areaMsg, setAreaMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const checkArea = () => {
    const d = zip.replace(/[-\s]/g, "");
    if (!/^\d{3,7}$/.test(d)) {
      setAreaMsg({ ok: false, text: "郵便番号を入力してください（例：343-0845）" });
      return;
    }
    setAreaMsg(
      isServiceArea(d)
        ? { ok: true, text: "対応エリアです（越谷市・春日部市）。このままご予約いただけます。" }
        : { ok: false, text: "エリア外の可能性があります。メッセージからお気軽にご相談ください。" }
    );
  };

  // 簡易シミュレーター（全サービス対応 / type分岐）
  const [simServiceId, setSimServiceId] = useState("ac_wall");
  const [simQty, setSimQty] = useState(1);
  const simGroups = serviceGroups();
  const simGroup = groupForService(simServiceId) ?? simGroups[0];
  const simSvc = getService(simServiceId)!;
  const simIsAc = simGroup.type === "ac";
  const total = calcBill(simServiceId, simQty, []).totalIncl.toLocaleString("ja-JP");
  const onSimServiceChange = (key: string) => {
    // リフォームは税抜の別エンジン。ここでは計算せず概算ページへ遷移。
    if (key.startsWith("reform:")) {
      router.push("/reform/" + key.slice("reform:".length));
      return;
    }
    const g = simGroups.find((x) => x.key === key);
    if (!g) return;
    setSimServiceId(g.type === "ac" ? g.variants![0].id : g.service!.id);
    setSimQty(1);
  };

  const ba = BA[baTab];
  const faqList = faqCat === 0 ? FAQS : FAQS.filter((f) => f.cat === FAQ_CATS[faqCat]);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: homeStyles }} />
      {/* FAQ構造化データ（画面のよくあるご質問と同一内容） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <div className="rt-shell">
        <Header />

        {/* 個人 / 法人 切り替え（リンク型・SEO安全） */}
        <AudienceTabs active="personal" />

        {/* エリア検索 */}
        <div className="rt-area-row">
          <button className="rt-area-btn" onClick={checkArea}>
            <MapPin size={16} strokeWidth={2.6} /> 対応エリアを確認する
            <ChevronDown size={16} strokeWidth={2.6} className="rt-area-cv" />
          </button>
          <div className="rt-zip">
            <Search size={16} strokeWidth={2.4} className="rt-zip-ico" />
            <input
              className="rt-zip-input"
              placeholder="郵便番号を入力（例：343-0845）"
              inputMode="numeric"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setAreaMsg(null); }}
              onKeyDown={(e) => e.key === "Enter" && checkArea()}
              aria-label="郵便番号"
            />
            <button className="rt-zip-btn" onClick={checkArea}>確認</button>
          </div>
        </div>
        {areaMsg && (
          <div className={"rt-zip-msg" + (areaMsg.ok ? " ok" : "")} role="status">
            {areaMsg.ok ? <Check size={13} strokeWidth={3} /> : <MapPin size={13} strokeWidth={2.4} />}
            {areaMsg.text}
          </div>
        )}

        {/* ヒーロー */}
        <section className="rt-hero">
          <div className="rt-hero-photo">
            <Photo srcKey="hero" alt="越谷市・春日部市で作業するRE:TERA HOMEのスタッフ" priority />
          </div>
          <div className="rt-hero-inner">
            <div className="rt-hero-ribbon">＼ 多くのお客様にご満足いただいています ／</div>
            <h1 className="rt-hero-h1">プロの技術で<br /><span className="rt-hero-red">快適</span>な暮らしを。</h1>
            <p className="rt-hero-sub">エアコン・水回りなどのハウスクリーニングは<br />RE:TERA HOMEにおまかせください。</p>
            <div className="rt-hero-cats">
              <Link href="/services?category=エアコン" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="ac" alt="エアコンクリーニング" /></span>エアコン
              </Link>
              <Link href="/services" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="bath" alt="ハウスクリーニング" /></span>クリーニング
              </Link>
              <Link href="/reform" className="rt-hero-cat">
                <span className="rt-hero-cat-img"><Photo srcKey="floor" alt="リフォーム" /></span>リフォーム
              </Link>
            </div>
            <div className="rt-trust">
              <div className="rt-trust-card">
                <div className="rt-trust-ico">¥</div>
                <div><div className="rt-trust-t">追加料金なし</div><div className="rt-trust-d">見積り後の追加請求は一切ありません</div></div>
              </div>
              <div className="rt-trust-card">
                <div className="rt-trust-ico"><MapPin size={18} strokeWidth={2.6} /></div>
                <div><div className="rt-trust-t">地域密着対応</div><div className="rt-trust-d">越谷市・春日部市に迅速対応</div></div>
              </div>
              <div className="rt-trust-card">
                <div className="rt-trust-ico"><ShieldCheck size={18} strokeWidth={2.6} /></div>
                <div><div className="rt-trust-t">損害保険加入</div><div className="rt-trust-d">万が一の時も安心の損害保険に加入済み</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ① 料金シミュレーター */}
        <section className="rt-sim">
          <div className="rt-sim-head">
            <div className="rt-sim-left">
              <div className="rt-sim-ico"><Calculator size={22} strokeWidth={2.2} /></div>
              <div><h2 className="rt-sim-title">かんたん料金シミュレーター</h2><div className="rt-sim-note">30秒で料金がわかります</div></div>
            </div>
            <div className="rt-sim-total">
              <div className="rt-sim-total-l">合計（税込）</div>
              <div className="rt-sim-total-v">{total}<span>円〜</span></div>
            </div>
          </div>
          <div className="rt-selects">
            <label className="rt-select">
              <span className="rt-select-l">サービスを選ぶ</span>
              <div className="rt-select-box">
                <select value={simGroup.key} onChange={(e) => onSimServiceChange(e.target.value)}>
                  <optgroup label="ハウスクリーニング・エアコン">
                    {simGroups.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
                  </optgroup>
                  <optgroup label="リフォーム（税抜・概算へ）">
                    {REFORM_MENU.map((r) => <option key={r.id} value={"reform:" + r.id}>{r.label}</option>)}
                  </optgroup>
                </select><ChevronDown size={16} />
              </div>
            </label>
            {simIsAc && (
              <label className="rt-select">
                <span className="rt-select-l">エアコンの種類</span>
                <div className="rt-select-box">
                  <select value={simServiceId} onChange={(e) => setSimServiceId(e.target.value)}>
                    {simGroup.variants!.map((v) => <option key={v.id} value={v.id}>{v.short}</option>)}
                  </select><ChevronDown size={16} />
                </div>
              </label>
            )}
            <label className="rt-select">
              <span className="rt-select-l">{simIsAc ? "台数" : "数量"}</span>
              <div className="rt-select-box">
                <select value={simQty} onChange={(e) => setSimQty(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}{simSvc.unitLabel}</option>)}
                </select><ChevronDown size={16} />
              </div>
            </label>
          </div>
          <Link href={`/simulator?serviceId=${simServiceId}&qty=${simQty}`} className="rt-cta">料金を確認する<ChevronRight size={20} strokeWidth={2.6} /></Link>
          <div className="rt-sim-checks">
            <span><Check size={13} strokeWidth={3} />追加料金なしの明朗会計</span>
            <span><Check size={13} strokeWidth={3} />見積り後のキャンセル無料</span>
            <span><Check size={13} strokeWidth={3} />即日〜3日以内の訪問も可能</span>
          </div>
        </section>

        {/* ② 最短空き状況 */}
        <section className="rt-slot">
          <div className="rt-slot-ico"><Calendar size={24} strokeWidth={2.2} /></div>
          <div className="rt-slot-body">
            <div className="rt-slot-t">最短空き状況</div>
            <div className="rt-slot-big">最短 <b>{slotInfo?.label ?? "確認中…"}</b> 訪問可能</div>
            <div className="rt-slot-sub">今週の空き <b>{slotInfo ? slotInfo.weekCount : "—"}</b> 日　<span>※空き状況は毎日更新されます</span></div>
          </div>
          <Link href="/booking/date" className="rt-slot-btn">空き状況を<br />確認する<ChevronRight size={14} strokeWidth={2.6} /></Link>
        </section>

        {/* ③ カテゴリ */}
        <h2 className="rt-cats-h">カテゴリから選ぶ</h2>
        <p className="rt-cats-sub">気になる場所から、サービスと料金をすぐに確認できます。</p>
        <div className="rt-cats">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={i}
                className={"rt-cat" + (i === cat ? " rt-cat-on" : "")}
                onClick={() => {
                  setCat(i);
                  if (c.label === "リフォーム") router.push("/reform");
                  else router.push("/services?category=" + encodeURIComponent(c.label));
                }}
              >
                <Icon size={24} strokeWidth={2.1} /><span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* ④ 人気のサービス */}
        <section className="rt-pop">
          <div className="rt-pop-head">
            <h2 className="rt-pop-title"><Crown size={20} strokeWidth={2.4} className="rt-crown" />人気のサービス</h2>
            <Link href="/services" className="rt-pop-all">すべて見る <ChevronRight size={15} strokeWidth={2.6} /></Link>
          </div>
          <div className="rt-cards">
            {POPULAR.map((p, i) => (
              <Link href={`/services/${p.id}`} className="rt-card" key={i} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rt-card-photo">
                  <span className="rt-card-rank" style={{ background: p.color }}>{p.rank}</span>
                  <Photo srcKey={p.img} alt={p.title} />
                </div>
                <div className="rt-card-body">
                  <div className="rt-card-title">{p.title}</div>
                  <div className="rt-card-desc">{p.desc}</div>
                  <div className="rt-card-foot">
                    <div className="rt-card-price">{num(getService(p.id)!.price)}<span>円〜</span></div>
                    <div className="rt-card-go"><ChevronRight size={18} strokeWidth={2.6} /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="rt-dots">{[0, 1, 2].map((d) => <span key={d} className={"rt-dot" + (d === 0 ? " rt-dot-on" : "")} />)}</div>
        </section>

        {/* ⑤ ビフォーアフター */}
        <section className="rt-ba-sec">
          <h2 className="rt-sec-h">ビフォーアフター</h2>
          <p className="rt-sec-sub">プロの仕上がりを、実際の写真でご確認ください。</p>
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
              <BeforeAfter beforeKey={ba.before} afterKey={ba.after} alt={ba.title} beforeSuffix=" 作業前" afterSuffix=" 作業後" beforeBadgeClass="rt-ba-before" afterBadgeClass="rt-cmp-badge-r rt-ba-after" />
            </div>
            <div className="rt-cmp-hint"><ChevronLeft size={13} strokeWidth={2.6} />つまみを左右にドラッグして比較<ChevronRight size={13} strokeWidth={2.6} /></div>
            <Link href={ba.id ? `/services/${ba.id}` : "/services"} className="rt-ba-link">このサービスを見る <ChevronRight size={15} strokeWidth={2.6} /></Link>
          </div>
          <Link href="/works" className="rt-ba-more">施工事例をもっと見る（ビフォーアフター）<ChevronRight size={16} strokeWidth={2.6} /></Link>
        </section>

        {/* ⑥ ご利用の流れ */}
        <section className="rt-flow-sec">
          <h2 className="rt-sec-h">ご利用の流れ</h2>
          <p className="rt-sec-sub">初めての方でも安心してご利用いただける、かんたんステップ。</p>
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
          <div className="rt-speed">
            <div className="rt-speed-ico"><Clock size={20} strokeWidth={2.2} /></div>
            <div className="rt-speed-body">
              <div className="rt-speed-t">最短当日・近隣エリアは即日確定も可能！</div>
              <div className="rt-speed-d">対応エリア内なら、当日中のご訪問も可能です。お急ぎの方はお気軽にご相談ください。</div>
            </div>
            <div className="rt-speed-badge"><Truck size={15} strokeWidth={2.2} />スピード対応<br />エリア拡大中！</div>
          </div>
          <Link href="/guide" className="rt-flow-guide">初めての方へ・ご利用ガイドを見る<ChevronRight size={16} strokeWidth={2.6} /></Link>
        </section>

        {/* ⑦ よくあるご質問 */}
        <section className="rt-faq-sec" id="faq">
          <h2 className="rt-sec-h">よくあるご質問</h2>
          <p className="rt-sec-sub">お客様からよくいただくご質問をまとめました。</p>
          <div className="rt-faq-search">
            <Search size={18} strokeWidth={2.4} className="rt-faq-sico" />
            <input className="rt-faq-input" placeholder="質問を検索する（例：料金、作業時間 など）" readOnly />
          </div>
          <div className="rt-faq-chips">
            {FAQ_CATS.map((c, i) => (
              <button key={i} className={"rt-faq-chip" + (i === faqCat ? " rt-faq-chip-on" : "")} onClick={() => setFaqCat(i)}>{c}</button>
            ))}
          </div>
          <div className="rt-faq-list">
            {faqList.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* ⑧ メッセージ相談 */}
        <section className="rt-msg">
          <div className="rt-msg-ico"><MessageCircle size={24} strokeWidth={2.2} /></div>
          <div className="rt-msg-body">
            <div className="rt-msg-t">解決しない場合はメッセージで相談</div>
            <div className="rt-msg-d">ご不明点はお気軽に。スタッフが丁寧にお答えします。</div>
          </div>
          <Link href="/messages" className="rt-msg-btn">メッセージを送る<ChevronRight size={15} strokeWidth={2.6} /></Link>
        </section>

        {/* フッター（会社情報・法務への導線） */}
        <footer className="rt-footer">
          <div className="rt-footer-links">
            <Link href="/guide">初めての方へ</Link>
            <Link href="/works">施工事例</Link>
            <a href={mapUrl()} target="_blank" rel="noopener noreferrer">地図で見る</a>
            {COMPANY.gbpReviewUrl && <a href={COMPANY.gbpReviewUrl} target="_blank" rel="noopener noreferrer">口コミを書く</a>}
            <Link href="/corporate">法人の方へ</Link>
            <Link href="/legal">利用規約・プライバシー</Link>
            <Link href="/legal">特定商取引法に基づく表記</Link>
            <Link href="/messages">お問い合わせ</Link>
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
          <Link href="/simulator" className="rt-cta2-book">
            <Calendar size={19} strokeWidth={2.4} /><span>今すぐ予約する</span><ChevronRight size={18} strokeWidth={2.6} />
          </Link>
        </div>
        <BottomNav active="home" />
      </div>
    </div>
  );
}
