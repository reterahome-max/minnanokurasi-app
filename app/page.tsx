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
import Photo from "@/components/Photo";
import BeforeAfter from "@/components/BeforeAfter";
import { getService, calcBill, serviceGroups, groupForService, num, CATEGORIES as CATS } from "@/lib/pricing";
import { REFORM_MENU } from "@/lib/reformPricing";
import { fetchMonthAvailability } from "@/lib/firestore";
import { today, defaultAvail, shortDateLabel } from "@/lib/booking";
import { COMPANY, isServiceArea, mapUrl } from "@/lib/company";

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
      <style dangerouslySetInnerHTML={{ __html: styles }} />
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
        </section>

        {/* ⑦ よくあるご質問 */}
        <section className="rt-faq-sec">
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

const styles = `
/* shared CTA */
.rt-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--red);color:#fff;border:none;
  border-radius:12px;padding:15px;font-size:16px;font-weight:900;letter-spacing:.04em;cursor:pointer;box-shadow:var(--shadow-md);transition:background .15s;text-decoration:none;}
.rt-cta:hover{background:var(--red-deep);}
.rt-sec-h{font-size:21px;font-weight:900;letter-spacing:.01em;margin:0 0 3px;}
.rt-sec-sub{font-size:12px;color:var(--ink-2);font-weight:600;margin:0 0 14px;line-height:1.5;}

/* area */
.rt-area-row{display:flex;gap:9px;margin-bottom:12px;}
.rt-area-btn{display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12.5px;font-weight:800;border-radius:12px;padding:0 12px;height:46px;white-space:nowrap;cursor:pointer;}
.rt-area-cv{margin-left:2px;}
.rt-zip{flex:1;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);border-radius:12px;padding-left:11px;height:46px;overflow:hidden;}
.rt-zip-ico{color:var(--ink-3);flex:none;}
.rt-zip-input{flex:1;min-width:0;border:none;outline:none;background:none;font-size:12.5px;color:var(--ink);font-family:inherit;}
.rt-zip-input::placeholder{color:var(--ink-3);}
.rt-zip-btn{flex:none;height:100%;border:none;background:var(--red);color:#fff;font-size:14px;font-weight:800;padding:0 18px;cursor:pointer;letter-spacing:.08em;}
.rt-zip-btn:hover{background:var(--red-deep);}
.rt-zip-msg{display:flex;align-items:flex-start;gap:6px;font-size:12px;font-weight:700;color:var(--ink-2);background:#fff;border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin:-4px 0 12px;line-height:1.5;}
.rt-zip-msg svg{flex:none;margin-top:2px;color:var(--ink-3);}
.rt-zip-msg.ok{color:var(--green);background:var(--green-soft);border-color:var(--green-soft);}
.rt-zip-msg.ok svg{color:var(--green);}

/* hero */
.rt-hero{position:relative;border-radius:18px;overflow:hidden;background:#fff;border:1px solid var(--line);margin-bottom:14px;box-shadow:var(--shadow);}
.rt-hero-photo{position:absolute;top:0;right:0;width:52%;height:100%;z-index:1;}
.rt-hero-photo::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(100deg,#fff 4%,rgba(255,255,255,0) 46%);pointer-events:none;}
.rt-hero-photo .rt-photo{object-position:62% 16%;}
.rt-hero-inner{position:relative;z-index:2;padding:18px 16px 16px;}
.rt-hero-ribbon{font-size:11.5px;font-weight:700;color:var(--ink-2);margin-bottom:8px;}
.rt-hero-h1{font-size:33px;font-weight:900;line-height:1.15;margin:0 0 10px;letter-spacing:.01em;}
.rt-hero-red{color:var(--red);}
.rt-hero-sub{font-size:12.5px;line-height:1.6;color:var(--ink-2);font-weight:600;margin:0 0 12px;}
.rt-hero-cats{display:flex;gap:16px;margin:2px 0 15px;}
.rt-hero-cat{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:10.5px;font-weight:800;color:var(--ink);text-decoration:none;}
.rt-hero-cat-img{width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #fff;box-shadow:var(--shadow-md);position:relative;display:block;}
.rt-trust{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
.rt-trust-card{background:rgba(255,255,255,.96);border-radius:12px;padding:10px 9px;display:flex;flex-direction:column;gap:6px;box-shadow:var(--shadow);}
.rt-trust-ico{width:34px;height:34px;border-radius:50%;border:2px dotted var(--gold);color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;}
.rt-trust-t{font-size:11.5px;font-weight:800;line-height:1.25;}
.rt-trust-d{font-size:9.5px;color:var(--ink-2);line-height:1.4;font-weight:600;}
.rt-trust-pct{font-size:19px;font-weight:900;line-height:1;}
.rt-trust-pct span{font-size:11px;margin-left:1px;}
.rt-stars{display:flex;align-items:center;gap:1px;color:var(--gold);margin-top:2px;}
.rt-star-half{position:relative;width:5.5px;overflow:hidden;display:inline-flex;}

/* simulator */
.rt-sim{background:linear-gradient(180deg,var(--red-soft-2),var(--red-soft));border:1px solid #F5DAD8;border-radius:18px;padding:15px 14px;margin-bottom:14px;}
.rt-sim-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:13px;}
.rt-sim-left{display:flex;align-items:center;gap:10px;}
.rt-sim-ico{width:42px;height:42px;border-radius:11px;background:#fff;color:var(--red);display:flex;align-items:center;justify-content:center;flex:none;box-shadow:var(--shadow);}
.rt-sim-title{font-size:15.5px;font-weight:900;margin:0;}
.rt-sim-note{font-size:11px;font-weight:800;color:var(--red);margin-top:2px;}
.rt-sim-total{text-align:right;flex:none;}
.rt-sim-total-l{font-size:10.5px;color:var(--ink-2);font-weight:700;}
.rt-sim-total-v{font-size:27px;font-weight:900;color:var(--red);line-height:1.05;letter-spacing:-.01em;}
.rt-sim-total-v span{font-size:15px;margin-left:1px;}
.rt-selects{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px;}
.rt-select{display:flex;flex-direction:column;gap:4px;}
.rt-select:nth-child(1){grid-column:1/2;}.rt-select:nth-child(2){grid-column:2/3;}.rt-select:nth-child(3){grid-column:1/3;}
.rt-select-l{font-size:10.5px;font-weight:700;color:var(--ink-2);padding-left:2px;}
.rt-select-box{position:relative;display:flex;align-items:center;}
.rt-select-box select{appearance:none;-webkit-appearance:none;width:100%;background:#fff;border:1px solid #E7D3D2;border-radius:10px;padding:11px 30px 11px 12px;font-size:13.5px;font-weight:700;color:var(--ink);font-family:inherit;cursor:pointer;}
.rt-select-box svg{position:absolute;right:10px;color:var(--ink-3);pointer-events:none;}
.rt-sim-checks{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 14px;margin-top:12px;}
.rt-sim-checks span{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--ink-2);}
.rt-sim-checks svg{color:var(--red);}

/* slot */
.rt-slot{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px;box-shadow:var(--shadow);}
.rt-slot-ico{width:46px;height:46px;border-radius:12px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-slot-body{flex:1;min-width:0;}
.rt-slot-t{font-size:13px;font-weight:900;margin-bottom:2px;}
.rt-slot-big{font-size:15px;font-weight:700;line-height:1.3;}
.rt-slot-big b{color:var(--red);font-weight:900;}
.rt-slot-sub{font-size:11px;color:var(--ink-2);font-weight:600;margin-top:3px;}
.rt-slot-sub b{color:var(--red);font-size:14px;}
.rt-slot-sub span{color:var(--ink-3);}
.rt-slot-btn{flex:none;display:flex;align-items:center;gap:2px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:11.5px;font-weight:800;border-radius:10px;padding:8px 10px;cursor:pointer;line-height:1.25;text-align:left;text-decoration:none;}

/* categories */
.rt-cats-h{font-size:17px;font-weight:900;letter-spacing:.01em;margin:4px 0 11px;}
.rt-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:18px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.rt-cats::-webkit-scrollbar{display:none;}
.rt-cat{flex:none;width:62px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--ink-2);font-size:11px;font-weight:700;padding:6px 2px;border-bottom:2.5px solid transparent;}
.rt-cat-on{color:var(--red);border-bottom-color:var(--red);}

/* popular */
.rt-pop{margin-bottom:22px;}
.rt-pop-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.rt-pop-title{display:flex;align-items:center;gap:7px;font-size:17px;font-weight:900;margin:0;}
.rt-crown{color:#F0B400;}
.rt-pop-all{display:flex;align-items:center;gap:2px;background:none;border:none;color:var(--ink-2);font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;}
.rt-cards{display:flex;gap:11px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:none;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}
.rt-cards::-webkit-scrollbar{display:none;}
.rt-card{flex:none;width:208px;background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;scroll-snap-align:start;box-shadow:var(--shadow);}
.rt-card-photo{position:relative;height:118px;overflow:hidden;}
.rt-card-rank{position:absolute;top:8px;left:8px;z-index:2;color:#fff;font-size:11px;font-weight:800;padding:3px 9px;border-radius:6px;}
.rt-card-body{padding:11px 12px 12px;}
.rt-card-title{font-size:14px;font-weight:800;line-height:1.35;margin-bottom:4px;}
.rt-card-desc{font-size:11px;color:var(--ink-3);font-weight:600;margin-bottom:9px;}
.rt-card-foot{display:flex;align-items:flex-end;justify-content:space-between;}
.rt-card-price{font-size:21px;font-weight:900;color:var(--red);line-height:1;}
.rt-card-price span{font-size:13px;margin-left:1px;}
.rt-card-go{width:30px;height:30px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-dots{display:flex;justify-content:center;gap:6px;margin-top:12px;}
.rt-dot{width:7px;height:7px;border-radius:50%;background:#D7DADE;}
.rt-dot-on{background:var(--red);width:18px;border-radius:4px;}

/* before/after */
.rt-ba-sec{margin-bottom:22px;}
.rt-ba-tabs{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;padding-bottom:2px;}
.rt-ba-tabs::-webkit-scrollbar{display:none;}
.rt-ba-tab{flex:none;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:10px 18px;font-size:13px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-ba-tab-on{background:var(--red);border-color:var(--red);color:#fff;}
.rt-ba-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px;box-shadow:var(--shadow);}
.rt-ba-title{font-size:15px;font-weight:900;margin-bottom:6px;}
.rt-ba-desc{font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.5;margin-bottom:10px;}
.rt-ba-checks{list-style:none;margin:0 0 13px;padding:0;display:flex;flex-direction:column;gap:6px;}
.rt-ba-checks li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--ink);}
.rt-ba-checks svg{color:var(--red);flex:none;}
.rt-ba-imgs{margin-bottom:8px;}
.rt-cmp{position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;user-select:none;touch-action:pan-y;cursor:ew-resize;background:#EDF1F3;}
.rt-cmp-layer{position:absolute;inset:0;}
.rt-cmp-badge{position:absolute;top:9px;left:9px;z-index:3;font-size:10.5px;font-weight:800;color:#fff;padding:3px 9px;border-radius:6px;}
.rt-cmp-badge-r{left:auto;right:9px;}
.rt-cmp-handle{position:absolute;top:0;bottom:0;width:3px;background:#fff;transform:translateX(-1.5px);z-index:4;box-shadow:0 0 0 1px rgba(0,0,0,.1);}
.rt-cmp-knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;color:var(--red);box-shadow:0 3px 12px rgba(0,0,0,.28);cursor:ew-resize;}
.rt-cmp-hint{display:flex;align-items:center;justify-content:center;gap:5px;font-size:11px;font-weight:700;color:var(--ink-3);margin-bottom:13px;}
.rt-cmp-hint svg{color:var(--red);}
.rt-ba-arrow{color:var(--ink-3);flex:none;}
.rt-ba-before{background:rgba(40,44,48,.82);}
.rt-ba-after{background:var(--red);}
.rt-ba-link{display:inline-flex;align-items:center;gap:3px;background:none;border:none;color:var(--red);font-size:13px;font-weight:800;cursor:pointer;padding:0;text-decoration:none;}
.rt-ba-more{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:12px;background:#fff;border:1.5px solid var(--red);border-radius:12px;padding:13px;font-size:13.5px;font-weight:800;color:var(--red);text-decoration:none;}
.rt-ba-more:hover{background:var(--red-soft);}

/* flow */
.rt-flow-sec{margin-bottom:20px;}
.rt-flow{display:flex;flex-direction:column;gap:11px;margin-bottom:14px;}
.rt-flow-row{display:flex;align-items:stretch;gap:10px;}
.rt-flow-num{flex:none;width:30px;height:30px;border-radius:50%;border:2px solid var(--red);color:var(--red);
  display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;background:#fff;margin-top:14px;}
.rt-flow-card{flex:1;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:13px;box-shadow:var(--shadow);}
.rt-flow-ico{flex:none;width:48px;height:48px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-flow-body{flex:1;min-width:0;}
.rt-flow-t{font-size:15px;font-weight:900;margin-bottom:3px;}
.rt-flow-d{font-size:11.5px;color:var(--ink-2);font-weight:600;line-height:1.55;}
.rt-speed{display:flex;align-items:center;gap:11px;background:var(--red-soft-2);border:1px solid #F3DEDC;border-radius:14px;padding:14px;}
.rt-speed-ico{flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid var(--ink-3);color:var(--ink-2);display:flex;align-items:center;justify-content:center;}
.rt-speed-body{flex:1;min-width:0;}
.rt-speed-t{font-size:13.5px;font-weight:900;color:var(--red);margin-bottom:3px;line-height:1.3;}
.rt-speed-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-speed-badge{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;border:1.5px solid var(--red);color:var(--red);border-radius:10px;padding:8px 10px;font-size:10.5px;font-weight:800;text-align:center;line-height:1.3;}

/* faq */
.rt-faq-sec{margin-bottom:20px;}
.rt-faq-search{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:0 13px;height:48px;margin-bottom:12px;box-shadow:var(--shadow);}
.rt-faq-sico{color:var(--ink-3);flex:none;}
.rt-faq-input{flex:1;min-width:0;border:none;outline:none;background:none;font-size:13px;color:var(--ink);font-family:inherit;}
.rt-faq-input::placeholder{color:var(--ink-3);}
.rt-faq-chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;padding-bottom:2px;}
.rt-faq-chips::-webkit-scrollbar{display:none;}
.rt-faq-chip{flex:none;background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:700;color:var(--ink-2);cursor:pointer;}
.rt-faq-chip-on{border-color:var(--red);color:var(--red);background:var(--red-soft);}
.rt-faq-list{display:flex;flex-direction:column;gap:9px;}
.rt-faq-item{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:border-color .2s;}
.rt-faq-item[data-open="true"]{border-color:var(--red);}
.rt-faq-q{width:100%;display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:15px 14px;text-align:left;}
.rt-faq-mark{flex:none;color:var(--red);font-size:17px;font-weight:900;}
.rt-faq-qt{flex:1;font-size:14px;font-weight:800;line-height:1.4;}
.rt-faq-cv{flex:none;color:var(--ink-3);transition:transform .25s;}
.rt-faq-a{overflow:hidden;transition:max-height .28s ease;}
.rt-faq-a-in{display:flex;gap:9px;padding:0 14px 15px 14px;}
.rt-faq-amark{flex:none;width:20px;height:20px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;margin-top:1px;}
.rt-faq-a-in p{margin:0;font-size:12.5px;line-height:1.7;color:var(--ink-2);font-weight:500;}

/* message */
.rt-msg{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px 14px;box-shadow:var(--shadow);}
.rt-msg-ico{flex:none;width:48px;height:48px;border-radius:50%;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-msg-body{flex:1;min-width:0;}
.rt-msg-t{font-size:14px;font-weight:900;margin-bottom:3px;line-height:1.3;}
.rt-msg-d{font-size:11px;color:var(--ink-2);font-weight:600;line-height:1.5;}
.rt-msg-btn{flex:none;display:flex;align-items:center;gap:2px;background:#fff;border:1.5px solid var(--red);color:var(--red);font-size:12px;font-weight:800;border-radius:10px;padding:10px 12px;cursor:pointer;text-decoration:none;}

/* footer */
.rt-footer{padding:22px 2px 8px;border-top:1px solid var(--line);margin-top:22px;}
.rt-footer-links{display:flex;flex-wrap:wrap;gap:8px 16px;margin-bottom:12px;}
.rt-footer-links a{font-size:12px;font-weight:700;color:var(--ink-2);text-decoration:none;}
.rt-footer-links a:hover{color:var(--red);}
.rt-footer-note{font-size:11px;color:var(--ink-3);font-weight:600;line-height:1.6;margin-bottom:6px;}
.rt-footer-copy{font-size:10.5px;color:var(--ink-3);font-weight:600;}

/* bottom CTA（電話 / 予約 の2分割） */
.rt-cta2{display:grid;grid-template-columns:1fr 1fr;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-cta2 a{display:flex;align-items:center;justify-content:center;gap:6px;padding:15px 8px;font-size:15px;font-weight:900;letter-spacing:.02em;text-decoration:none;}
.rt-cta2 a svg{flex:none;}
.rt-cta2-tel{background:#fff;color:var(--red);border-top:2.5px solid var(--red);}
.rt-cta2-book{background:var(--red);color:#fff;}
.rt-cta2-book:hover{background:var(--red-deep);}
`;
