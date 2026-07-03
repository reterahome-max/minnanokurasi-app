"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight, ChevronDown, Plus, Minus, Check, Clock,
  Wind, Sparkles, LayoutGrid, Home, Package, ShieldCheck, Fan, Droplets, UserCheck,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useBooking } from "@/context/BookingContext";
import {
  getService, OPTIONS, calcBill, serviceGroups, groupForService,
} from "@/lib/pricing";

/**
 * RE:TERA HOME — 料金シミュレーター（全サービス対応 / type分岐）
 * RETERA_Simulator.jsx を移植。サービス選択は serviceGroups() から生成し、
 * type==="ac"（種類×台数＋オプション）/ "flat"（数量のみ）でUIを出し分ける。
 * 金額・サービスは lib/pricing 単一データソース。選択は BookingContext に保持。
 * ?serviceId=&qty= クエリがあれば初期値に反映（ホーム簡易シミュレーターから引き継ぎ）。
 */

// エアコン種類のアイコン
const VARIANT_ICONS: Record<string, typeof Wind> = {
  ac_wall: Wind, ac_auto: Sparkles, ac_ceiling: LayoutGrid,
};
// オプションのアイコン
const OPT_ICONS: Record<string, typeof ShieldCheck> = {
  anti_mold: ShieldCheck, outdoor: Fan, drain: Droplets,
};

const TABS = [
  { label: "エアコンクリーニング", icon: Wind },
  { label: "ハウスクリーニング", icon: Home },
  { label: "空室清掃・引越前後", icon: Package },
];

const yen = (n: number) => n.toLocaleString("ja-JP");

function SimulatorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { serviceId, qty, optionIds, set, toggleOption } = useBooking();

  // クエリ（ホームから引き継ぎ）を初回のみ反映
  useEffect(() => {
    const qid = searchParams.get("serviceId");
    if (qid && getService(qid)) {
      const qqty = Number(searchParams.get("qty"));
      set({ serviceId: qid, qty: qqty > 0 ? qqty : 1, optionIds: [] });
    }
    // 初回のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = serviceGroups();
  const group = groupForService(serviceId) ?? groups[0];
  const svc = getService(serviceId)!;
  const isAc = group.type === "ac";
  const unitLabel = svc.unitLabel;
  const effectiveOptionIds = isAc ? optionIds : [];
  const bill = calcBill(serviceId, qty, effectiveOptionIds);
  const chosenOpts = OPTIONS.filter((o) => effectiveOptionIds.includes(o.id));

  // TABS は選択サービスの大分類を表示（非操作・デザイン据え置き）
  const activeTab = isAc ? 0 : svc.cat === "空室" ? 2 : 1;

  // サービス切替：種類は先頭、数量1、オプションクリア
  const onServiceChange = (key: string) => {
    const g = groups.find((x) => x.key === key);
    if (!g) return;
    const newId = g.type === "ac" ? g.variants![0].id : g.service!.id;
    set({ serviceId: newId, qty: 1, optionIds: [] });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header />

        {/* ステップ */}
        <div className="rt-steps">
          <div className="rt-step"><div className="rt-step-n done">1</div><div className="rt-step-l">サービス</div></div>
          <div className="rt-step-line on" />
          <div className="rt-step"><div className="rt-step-n on">2</div><div className="rt-step-l on">条件</div></div>
          <div className="rt-step-line" />
          <div className="rt-step"><div className="rt-step-n">3</div><div className="rt-step-l">料金確認</div></div>
        </div>

        {/* タブ（大分類・表示のみ） */}
        <div className="rt-tabs">
          {TABS.map((t, i) => { const Icon = t.icon; return (
            <div key={i} className={"rt-tab" + (i === activeTab ? " rt-tab-on" : "")}><Icon size={18} strokeWidth={2.2} />{t.label}</div>
          ); })}
        </div>

        {/* サービスを選ぶ */}
        <div className="rt-q"><span className="rt-q-t">サービスを選ぶ</span><span className="rt-req">必須</span></div>
        <div className="rt-select-box rt-svc-box">
          <select value={group.key} onChange={(e) => onServiceChange(e.target.value)}>
            {groups.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
          <ChevronDown size={16} />
        </div>

        {/* 種類（ac のみ） */}
        {isAc && (
          <>
            <div className="rt-q"><span className="rt-q-t">エアコンの種類を選ぶ</span><span className="rt-req">必須</span></div>
            <div className="rt-types">
              {group.variants!.map((v) => { const Icon = VARIANT_ICONS[v.id] ?? Wind; const on = v.id === serviceId; return (
                <button key={v.id} className={"rt-type" + (on ? " rt-type-on" : "")} onClick={() => set({ serviceId: v.id })}>
                  {on && <div className="rt-type-check"><Check size={13} strokeWidth={3} /></div>}
                  <Icon size={30} strokeWidth={1.6} className="rt-type-ico" />
                  <span>{v.short}</span>
                </button>
              ); })}
            </div>
          </>
        )}

        {/* 台数 / 数量 */}
        <div className="rt-q"><span className="rt-q-t">{isAc ? "台数を選ぶ" : "数量を選ぶ"}</span><span className="rt-req">必須</span></div>
        <div className="rt-stepper">
          <button className="rt-step-btn" onClick={() => set({ qty: Math.max(1, qty - 1) })} disabled={qty <= 1}><Minus size={20} strokeWidth={2.4} /></button>
          <div className="rt-step-val">{qty}<span> {unitLabel}</span></div>
          <button className="rt-step-btn" onClick={() => set({ qty: Math.min(9, qty + 1) })}><Plus size={20} strokeWidth={2.4} /></button>
        </div>

        {/* オプション（ac のみ） */}
        {isAc && (
          <>
            <div className="rt-q"><span className="rt-q-t">オプションを追加する</span><span className="rt-any">任意</span></div>
            <div className="rt-opts">
              {OPTIONS.map((o) => { const Icon = OPT_ICONS[o.id]; const on = optionIds.includes(o.id); return (
                <div key={o.id} className="rt-opt">
                  <div className="rt-opt-ico"><Icon size={20} strokeWidth={2} /></div>
                  <div className="rt-opt-body"><div className="rt-opt-name">{o.name}</div><div className="rt-opt-desc">{o.desc}</div></div>
                  <div className="rt-opt-price">+{yen(o.price)}円/台</div>
                  <button className={"rt-toggle" + (on ? " rt-toggle-on" : "")} onClick={() => toggleOption(o.id)} aria-label={o.name}>
                    <span className="rt-toggle-knob" />
                  </button>
                </div>
              ); })}
              <div className="rt-time"><div className="rt-time-ico"><Clock size={20} strokeWidth={2.2} /></div><div><div className="rt-time-t">作業時間の目安</div><div className="rt-time-d">約 60〜90分（{qty}台）<span>※設置状況により前後する場合があります</span></div></div></div>
            </div>
          </>
        )}

        {/* 内訳 */}
        <div className="rt-bill">
          <div className="rt-bill-h">料金の内訳</div>
          {bill.lines.map((l, i) => (
            <div className="rt-bill-row" key={i}><div className="rt-bill-l">{l.label}<br /><span>{l.detail}</span></div><div className="rt-bill-v">{yen(l.amount)}円</div></div>
          ))}
          <div className="rt-bill-div" />
          <div className="rt-bill-sub"><span>小計（税抜）</span><span>{yen(bill.net)}円</span></div>
          <div className="rt-bill-sub"><span>消費税（10%）</span><span>{yen(bill.tax)}円</span></div>
          <div className="rt-bill-div" />
          <div className="rt-bill-total"><span>合計（税込）</span><span className="rt-bill-total-v">{yen(bill.totalIncl)}<b>円</b></span></div>
          <div className="rt-bill-note">表示価格はすべて税込です<br />追加料金は一切かかりません</div>
        </div>

        {/* 安心バッジ */}
        <div className="rt-assure">
          <div className="rt-assure-card"><div className="rt-assure-ico">¥</div><div><div className="rt-assure-t">追加料金なし</div><div className="rt-assure-d">事前のお見積り金額から追加料金は一切ありません</div></div></div>
          <div className="rt-assure-card"><div className="rt-assure-ico"><UserCheck size={20} strokeWidth={2.2} /></div><div><div className="rt-assure-t">訪問時に内容確認</div><div className="rt-assure-d">作業前にスタッフが内容をご確認し、安心して作業開始</div></div></div>
        </div>
        <div className="rt-assure-foot"><ShieldCheck size={15} strokeWidth={2.4} />清掃箇所や汚れ具合による追加料金は一切ありません。</div>

        <div style={{ height: 96 }} />
      </div>

      <div className="rt-bottom">
        <button className="rt-cta-bar" onClick={() => { set({ reform: null }); router.push("/booking/date"); }}>この内容で日時を選ぶ<ChevronRight size={20} strokeWidth={2.6} /></button>
        <BottomNav active="simulator" />
      </div>
    </div>
  );
}

export default function Simulator() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg)", minHeight: "100vh" }} />}>
      <SimulatorInner />
    </Suspense>
  );
}

const styles = `
.rt-steps{display:flex;align-items:center;padding:14px 8px 18px;}
.rt-step{display:flex;flex-direction:column;align-items:center;gap:6px;flex:none;}
.rt-step-n{width:30px;height:30px;border-radius:50%;background:#E3E6E8;color:var(--ink-3);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;}
.rt-step-n.on{background:var(--red);color:#fff;}
.rt-step-n.done{background:#fff;border:2px solid var(--red);color:var(--red);}
.rt-step-l{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-step-l.on{color:var(--ink);}
.rt-step-line{flex:1;height:2px;background:#E3E6E8;margin:0 4px 22px;}
.rt-step-line.on{background:var(--red);}
.rt-tabs{display:flex;gap:6px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:5px;margin-bottom:20px;overflow-x:auto;scrollbar-width:none;}
.rt-tabs::-webkit-scrollbar{display:none;}
.rt-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;background:none;border:none;border-radius:9px;padding:11px 8px;font-size:12px;font-weight:800;color:var(--ink-3);cursor:default;}
.rt-tab-on{background:var(--red-soft);color:var(--red);}
.rt-q{display:flex;align-items:center;gap:8px;margin-bottom:11px;}
.rt-q-t{font-size:17px;font-weight:900;}
.rt-req{font-size:10px;font-weight:800;color:var(--red);background:var(--red-soft);padding:3px 8px;border-radius:6px;}
.rt-any{font-size:10px;font-weight:700;color:var(--ink-3);}
.rt-select-box{position:relative;display:flex;align-items:center;}
.rt-select-box select{appearance:none;-webkit-appearance:none;width:100%;background:#fff;border:1px solid #E7D3D2;border-radius:10px;padding:13px 32px 13px 14px;font-size:14px;font-weight:800;color:var(--ink);font-family:inherit;cursor:pointer;}
.rt-select-box svg{position:absolute;right:12px;color:var(--ink-3);pointer-events:none;}
.rt-svc-box{margin-bottom:22px;}
.rt-types{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:22px;}
.rt-type{position:relative;display:flex;flex-direction:column;align-items:center;gap:9px;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:18px 6px;cursor:pointer;font-size:12px;font-weight:800;color:var(--ink);}
.rt-type-on{border-color:var(--red);background:var(--red-soft-2);}
.rt-type-ico{color:var(--ink-2);}
.rt-type-on .rt-type-ico{color:var(--red);}
.rt-type-check{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;}
.rt-stepper{display:flex;align-items:center;background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px;margin-bottom:22px;width:230px;}
.rt-step-btn{flex:none;width:54px;height:50px;border-radius:11px;border:none;background:#F4F5F6;color:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-step-btn:disabled{color:var(--ink-3);opacity:.5;}
.rt-step-val{flex:1;text-align:center;font-size:24px;font-weight:900;}
.rt-step-val span{font-size:15px;font-weight:700;color:var(--ink-2);}
.rt-opts{display:flex;flex-direction:column;gap:9px;margin-bottom:22px;}
.rt-opt{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px;box-shadow:var(--shadow);}
.rt-opt-ico{flex:none;width:40px;height:40px;border-radius:10px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-opt-body{flex:1;min-width:0;}
.rt-opt-name{font-size:13.5px;font-weight:800;}
.rt-opt-desc{font-size:10.5px;color:var(--ink-2);font-weight:600;margin-top:2px;}
.rt-opt-price{font-size:13px;font-weight:900;color:var(--red);flex:none;}
.rt-toggle{flex:none;width:48px;height:28px;border-radius:999px;border:none;background:#D7DADE;cursor:pointer;padding:0;position:relative;transition:background .2s;}
.rt-toggle-on{background:var(--red);}
.rt-toggle-knob{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.25);}
.rt-toggle-on .rt-toggle-knob{transform:translateX(20px);}
.rt-time{display:flex;align-items:center;gap:11px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px;}
.rt-time-ico{flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid var(--red);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-time-t{font-size:13.5px;font-weight:800;}
.rt-time-d{font-size:13px;font-weight:700;color:var(--ink);margin-top:2px;}
.rt-time-d span{display:block;font-size:10px;color:var(--ink-3);font-weight:600;margin-top:2px;}
.rt-bill{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:18px;box-shadow:var(--shadow);}
.rt-bill-h{font-size:15px;font-weight:900;margin-bottom:14px;}
.rt-bill-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:11px;}
.rt-bill-l{font-size:13px;font-weight:700;line-height:1.4;}
.rt-bill-l span{font-size:11px;color:var(--ink-3);font-weight:600;}
.rt-bill-v{font-size:14px;font-weight:800;flex:none;}
.rt-bill-div{height:1px;background:var(--line);margin:12px 0;}
.rt-bill-sub{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--ink-2);margin-bottom:8px;}
.rt-bill-total{display:flex;align-items:center;justify-content:space-between;}
.rt-bill-total span:first-child{font-size:15px;font-weight:900;}
.rt-bill-total-v{font-size:30px;font-weight:900;color:var(--red);line-height:1;}
.rt-bill-total-v b{font-size:16px;margin-left:1px;}
.rt-bill-note{text-align:center;font-size:11.5px;font-weight:700;color:var(--red);background:var(--red-soft);border-radius:10px;padding:11px;margin-top:14px;line-height:1.6;}
.rt-assure{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px;}
.rt-assure-card{display:flex;align-items:flex-start;gap:9px;background:#fff;border:1px solid var(--line);border-radius:13px;padding:13px;box-shadow:var(--shadow);}
.rt-assure-ico{flex:none;width:38px;height:38px;border-radius:50%;border:1.5px solid #F0CDCB;color:var(--red);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;}
.rt-assure-t{font-size:13px;font-weight:800;margin-bottom:3px;}
.rt-assure-d{font-size:10px;color:var(--ink-2);font-weight:600;line-height:1.45;}
.rt-assure-foot{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--ink-2);padding:8px 0;}
.rt-assure-foot svg{color:var(--red);}
.rt-cta-bar{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--red);color:#fff;border:none;padding:16px 14px;font-size:17px;font-weight:900;letter-spacing:.03em;cursor:pointer;box-shadow:0 -3px 14px rgba(20,28,38,.08);}
.rt-cta-bar:hover{background:var(--red-deep);}
`;
