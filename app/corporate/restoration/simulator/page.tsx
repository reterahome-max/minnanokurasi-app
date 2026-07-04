"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Minus, X, Copy, ChevronDown, Check, AlertCircle,
  Building2, ClipboardList, CheckCircle2, Camera, MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import {
  CORP_CATEGORIES, corpMenusByCat, getCorpMenu, estimate, lineSubtotal,
  CORP_ADJUSTMENTS, type CorpCatKey,
} from "@/lib/corporatePricing";
import { createRestorationEstimate } from "@/lib/firestore";
import { notifyAdmin } from "@/lib/notify";
import { COMPANY } from "@/lib/company";

/**
 * RE:TERA HOME — 法人向け 原状回復シミュレーター（仕様書 優先度A）
 * 複数メニューをカートに積んで概算を積算し、見積依頼まで。金額は lib/corporatePricing（独立・税抜）。
 * 途中で戻っても消えないよう sessionStorage に保持。デザインは既存トンマナ＋ネイビーテーマ。
 */
const FLOORPLANS = ["1R", "1K", "1DK", "1LDK", "2K", "2DK", "2LDK", "3K", "3DK", "3LDK", "4LDK以上", "戸建て", "店舗", "事務所", "その他"];
const PLACES = ["物件全体", "玄関", "廊下", "LDK", "洋室1", "洋室2", "洋室3", "和室", "キッチン", "浴室", "洗面所", "トイレ", "収納", "ベランダ", "共用部"];
const TIER_LABEL: Record<string, string> = { photo: "写真確認", site: "現地調査", contract: "契約", excluded: "対象外" };
const STORE = "retera_corp_restoration";
const yen = (n: number) => n.toLocaleString("ja-JP");
const uid = () => Math.random().toString(36).slice(2, 9);

type Line = { lineId: string; menuId: string; qty: number; location: string };
type Prop = { propertyName: string; roomNumber: string; floorPlan: string; floorArea: string; dueDate: string; note: string };
type Req = { company: string; name: string; tel: string; email: string };

export default function RestorationSimulator() {
  const [prop, setProp] = useState<Prop>({ propertyName: "", roomNumber: "", floorPlan: "", floorArea: "", dueDate: "", note: "" });
  const [cart, setCart] = useState<Line[]>([]);
  const [adj, setAdj] = useState<string[]>([]);
  const [req, setReq] = useState<Req>({ company: "", name: "", tel: "", email: "" });
  const [openCat, setOpenCat] = useState<CorpCatKey | null>("clean");
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 復元
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) { const d = JSON.parse(raw); setProp(d.prop ?? prop); setCart(d.cart ?? []); setAdj(d.adj ?? []); setReq(d.req ?? req); }
    } catch { /* noop */ }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 保存
  useEffect(() => {
    if (!loaded) return;
    try { sessionStorage.setItem(STORE, JSON.stringify({ prop, cart, adj, req })); } catch { /* noop */ }
  }, [prop, cart, adj, req, loaded]);

  const result = useMemo(() => estimate({ lines: cart.map((c) => ({ menuId: c.menuId, qty: c.qty })), adjustmentCodes: adj }), [cart, adj]);

  const addMenu = (menuId: string) => setCart((c) => [...c, { lineId: uid(), menuId, qty: 1, location: "" }]);
  const dupLine = (id: string) => setCart((c) => { const i = c.findIndex((x) => x.lineId === id); if (i < 0) return c; const n = { ...c[i], lineId: uid(), location: "" }; const cp = [...c]; cp.splice(i + 1, 0, n); return cp; });
  const rmLine = (id: string) => setCart((c) => c.filter((x) => x.lineId !== id));
  const setQty = (id: string, q: number) => setCart((c) => c.map((x) => (x.lineId === id ? { ...x, qty: Math.max(1, q) } : x)));
  const setLoc = (id: string, v: string) => setCart((c) => c.map((x) => (x.lineId === id ? { ...x, location: v } : x)));
  const toggleAdj = (code: string) => setAdj((a) => (a.includes(code) ? a.filter((x) => x !== code) : [...a, code]));
  const countFor = (menuId: string) => cart.filter((c) => c.menuId === menuId).length;

  const submit = async () => {
    if (sending) return;
    const r = { company: req.company.trim(), name: req.name.trim(), tel: req.tel.trim(), email: req.email.trim() };
    if (cart.length === 0) { setErr("施工メニューを1つ以上選択してください。"); return; }
    if (!r.company || !r.name || r.tel.replace(/[^0-9]/g, "").length < 10) { setErr("会社名・ご担当者名・電話番号（10桁以上）は必須です。"); return; }
    setErr(null); setSending(true);
    const items = cart.map((c) => {
      const m = getCorpMenu(c.menuId)!;
      return { name: m.name, unit: m.unit, qty: c.qty, location: c.location.trim(), subtotal: lineSubtotal(m, c.qty), tier: m.tier };
    });
    try {
      await createRestorationEstimate({ ...r, property: prop, items, adjustments: adj, totals: result });
      notifyAdmin({
        kind: "原状回復見積",
        title: `${r.company}／${prop.propertyName || "物件未記入"} ${prop.roomNumber}（概算 税抜${yen(result.preTax)}円）`,
        lines: [
          `担当：${r.name}／${r.tel}${r.email ? `／${r.email}` : ""}`,
          `間取り：${prop.floorPlan || "-"}　面積：${prop.floorArea || "-"}㎡　希望完了：${prop.dueDate || "-"}`,
          `項目：${items.length}件（写真確認${result.photoCount}／別途${result.siteCount}）`,
          `概算：税抜${yen(result.preTax)}円 / 税込${yen(result.total)}円`,
          ...items.slice(0, 30).map((it) => `・${it.name}${it.location ? `（${it.location}）` : ""} ${it.qty}${it.unit}${it.subtotal != null ? ` = ${yen(it.subtotal)}円` : "（別途）"}`),
        ],
      });
      try { sessionStorage.removeItem(STORE); } catch { /* noop */ }
      setDone(true);
    } catch {
      setErr("送信に失敗しました。通信環境をご確認のうえ、もう一度お試しください。");
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="rt-shell"><div className="rt-fin">
          <div className="rt-fin-ico"><CheckCircle2 size={44} strokeWidth={2} /></div>
          <h1 className="rt-fin-t">見積り依頼を受け付けました</h1>
          <p className="rt-fin-d">内容を確認のうえ、担当より正式見積りをご案内します。<br />ありがとうございました。</p>
          <Link href="/corporate" className="rt-fin-btn">法人トップへ戻る</Link>
        </div></div>
      </div>
    );
  }

  return (
    <div className="theme-navy" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <Header tag="法人 原状回復" />
        <div className="rt-title-row">
          <Link href="/corporate" className="rt-back" aria-label="戻る"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <h1 className="rt-page-title">原状回復シミュレーター</h1>
        </div>
        <div className="rt-lead"><Building2 size={16} strokeWidth={2.2} />施工メニューをまとめて選び、数量を入れると工事全体の概算（税抜）がその場で出ます。正式見積りは現地調査後にご案内します。</div>

        {/* 物件情報 */}
        <h2 className="rt-h">物件情報</h2>
        <div className="rt-block">
          <div className="rt-grid2">
            <label className="rt-f"><span>物件名</span><input className="rt-in" value={prop.propertyName} onChange={(e) => setProp({ ...prop, propertyName: e.target.value })} placeholder="◯◯マンション" /></label>
            <label className="rt-f"><span>部屋番号</span><input className="rt-in" value={prop.roomNumber} onChange={(e) => setProp({ ...prop, roomNumber: e.target.value })} placeholder="203" /></label>
            <label className="rt-f"><span>間取り</span><div className="rt-sel"><select value={prop.floorPlan} onChange={(e) => setProp({ ...prop, floorPlan: e.target.value })}><option value="">選択</option>{FLOORPLANS.map((p) => <option key={p} value={p}>{p}</option>)}</select><ChevronDown size={15} /></div></label>
            <label className="rt-f"><span>専有面積(㎡)</span><input className="rt-in" type="number" inputMode="decimal" value={prop.floorArea} onChange={(e) => setProp({ ...prop, floorArea: e.target.value })} placeholder="45" /></label>
            <label className="rt-f"><span>希望完了日</span><input className="rt-in" type="date" value={prop.dueDate} onChange={(e) => setProp({ ...prop, dueDate: e.target.value })} /></label>
          </div>
          <label className="rt-f" style={{ marginTop: 12 }}><span>備考</span><textarea className="rt-in rt-ta" rows={2} value={prop.note} onChange={(e) => setProp({ ...prop, note: e.target.value })} placeholder="管理番号・現況メモなど（任意）" /></label>
        </div>

        {/* メニュー選択 */}
        <h2 className="rt-h">施工メニューを選ぶ<span className="rt-h-sub">タップで追加・同じ項目を複数登録可</span></h2>
        <div className="rt-acc">
          {CORP_CATEGORIES.map((c) => {
            const menus = corpMenusByCat(c.key).filter((m) => m.tier !== "excluded");
            const open = openCat === c.key;
            const inCat = cart.filter((l) => getCorpMenu(l.menuId)?.cat === c.key).length;
            return (
              <div className="rt-acc-item" key={c.key}>
                <button className="rt-acc-head" onClick={() => setOpenCat(open ? null : c.key)}>
                  <span className="rt-acc-t">{c.label}</span>
                  {inCat > 0 && <span className="rt-acc-badge">{inCat}</span>}
                  <ChevronDown size={18} strokeWidth={2.4} className={"rt-acc-cv" + (open ? " open" : "")} />
                </button>
                {open && (
                  <div className="rt-menus">
                    {menus.map((m) => {
                      const n = countFor(m.id);
                      const priceText = m.price == null ? "別途見積" : `${yen(m.price)}円／${m.unit}`;
                      return (
                        <button key={m.id} className={"rt-menu" + (n > 0 ? " on" : "")} onClick={() => addMenu(m.id)}>
                          <div className="rt-menu-body">
                            <div className="rt-menu-name">{m.name}{TIER_LABEL[m.tier] && <span className={"rt-tier t-" + m.tier}>{TIER_LABEL[m.tier]}</span>}</div>
                            <div className="rt-menu-price">{priceText}</div>
                          </div>
                          <div className="rt-menu-add">{n > 0 ? <span className="rt-menu-n">{n}</span> : <Plus size={18} strokeWidth={2.6} />}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 明細 */}
        {cart.length > 0 && (
          <>
            <h2 className="rt-h">選択中の明細<span className="rt-h-sub">{cart.length}項目</span></h2>
            <div className="rt-lines">
              {cart.map((l) => {
                const m = getCorpMenu(l.menuId)!;
                const sub = lineSubtotal(m, l.qty);
                const fixed = m.unit === "一式" || m.unit === "込み" || m.unit === "標準量込み";
                return (
                  <div className="rt-line" key={l.lineId}>
                    <div className="rt-line-top">
                      <div className="rt-line-name">{m.name}{TIER_LABEL[m.tier] && <span className={"rt-tier t-" + m.tier}>{TIER_LABEL[m.tier]}</span>}</div>
                      <div className="rt-line-act">
                        <button onClick={() => dupLine(l.lineId)} aria-label="複製"><Copy size={15} strokeWidth={2.2} /></button>
                        <button onClick={() => rmLine(l.lineId)} aria-label="削除"><X size={16} strokeWidth={2.4} /></button>
                      </div>
                    </div>
                    <input className="rt-in rt-loc" list="rt-places" value={l.location} onChange={(e) => setLoc(l.lineId, e.target.value)} placeholder="施工場所（任意・例：LDK）" />
                    <div className="rt-line-bottom">
                      {!fixed ? (
                        <div className="rt-step">
                          <button onClick={() => setQty(l.lineId, l.qty - 1)} disabled={l.qty <= 1}><Minus size={16} strokeWidth={2.4} /></button>
                          <input className="rt-step-in" type="number" inputMode="numeric" value={l.qty} onChange={(e) => setQty(l.lineId, Number(e.target.value) || 1)} /><span className="rt-step-u">{m.unit}</span>
                          <button onClick={() => setQty(l.lineId, l.qty + 1)}><Plus size={16} strokeWidth={2.4} /></button>
                        </div>
                      ) : <div className="rt-fixed">一式</div>}
                      <div className="rt-line-sub">{sub == null ? <span className="rt-sub-quote">別途見積</span> : <>{yen(sub)}<b>円</b></>}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <datalist id="rt-places">{PLACES.map((p) => <option key={p} value={p} />)}</datalist>

            {/* 追加条件 */}
            <h2 className="rt-h">追加条件<span className="rt-h-sub">該当があれば選択</span></h2>
            <div className="rt-adjs">
              {CORP_ADJUSTMENTS.map((a) => {
                const on = adj.includes(a.code);
                return (
                  <button key={a.code} className={"rt-adj" + (on ? " on" : "")} onClick={() => toggleAdj(a.code)}>
                    <span className={"rt-adj-c" + (on ? " on" : "")}>{on && <Check size={11} strokeWidth={3} />}</span>{a.name}
                    <span className="rt-adj-v">{a.type === "percent" ? `+${a.value}%` : a.value ? `+${yen(a.value)}円` : "実費"}</span>
                  </button>
                );
              })}
            </div>

            {/* 概算結果 */}
            <h2 className="rt-h">概算結果</h2>
            <div className="rt-result">
              <div className="rt-res-head">
                <div className="rt-res-l">概算金額（税抜）</div>
                <div className="rt-res-v">{yen(result.preTax)}<b>円</b></div>
                <div className="rt-res-tax">税込 {yen(result.total)}円</div>
              </div>
              <div className="rt-res-rows">
                <div className="rt-res-row"><span>自動計算</span><span>{yen(result.autoSubtotal)}円</span></div>
                {result.minAdjustment > 0 && <div className="rt-res-row"><span>最低施工料金 調整</span><span>+{yen(result.minAdjustment)}円</span></div>}
                <div className="rt-res-row"><span>諸経費（5%）</span><span>+{yen(result.overhead)}円</span></div>
                {result.optionTotal > 0 && <div className="rt-res-row"><span>追加条件</span><span>+{yen(result.optionTotal)}円</span></div>}
                <div className="rt-res-div" />
                <div className="rt-res-row bold"><span>税抜合計</span><span>{yen(result.preTax)}円</span></div>
                <div className="rt-res-row"><span>消費税（10%）</span><span>{yen(result.tax)}円</span></div>
              </div>
              {(result.photoCount > 0 || result.siteCount > 0) && (
                <div className="rt-res-notes">
                  {result.photoCount > 0 && <div><Camera size={13} strokeWidth={2.3} />写真・型番確認後に確定：{result.photoCount}項目（参考 {yen(result.photoSubtotal)}円）</div>}
                  {result.siteCount > 0 && <div><MapPin size={13} strokeWidth={2.3} />現地調査が必要：{result.siteCount}項目（別途見積り）</div>}
                </div>
              )}
              <div className="rt-res-disc">※ 概算です。正式なお見積りは現地調査・写真確認後にご提示します。</div>
            </div>

            {/* ご依頼者情報 */}
            <h2 className="rt-h">ご依頼者情報</h2>
            <div className="rt-block">
              {err && <div className="rt-err"><AlertCircle size={15} strokeWidth={2.4} />{err}</div>}
              <div className="rt-grid2">
                <label className="rt-f"><span>会社名・屋号 <b>必須</b></span><input className="rt-in" value={req.company} onChange={(e) => setReq({ ...req, company: e.target.value })} placeholder="株式会社◯◯" /></label>
                <label className="rt-f"><span>ご担当者名 <b>必須</b></span><input className="rt-in" value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} placeholder="山田 太郎" /></label>
                <label className="rt-f"><span>電話番号 <b>必須</b></span><input className="rt-in" type="tel" value={req.tel} onChange={(e) => setReq({ ...req, tel: e.target.value })} placeholder="09012345678" /></label>
                <label className="rt-f"><span>メール</span><input className="rt-in" type="email" value={req.email} onChange={(e) => setReq({ ...req, email: e.target.value })} placeholder="example@company.co.jp" /></label>
              </div>
            </div>
            <div style={{ height: 96 }} />
          </>
        )}
        {cart.length === 0 && <div className="rt-empty"><ClipboardList size={26} strokeWidth={1.8} />上のメニューから施工項目を追加してください。</div>}
      </div>

      {/* 固定カート */}
      {cart.length > 0 && (
        <div className="rt-cartbar">
          <div className="rt-cartbar-info"><span>選択 {cart.length}項目</span><b>概算 税抜 {yen(result.preTax)}円</b></div>
          <button className="rt-cartbar-btn" onClick={submit} disabled={sending}>{sending ? "送信中…" : "この内容で見積り依頼"}</button>
        </div>
      )}
    </div>
  );
}

const styles = `
.theme-navy{--red:#33517D;--red-deep:#2a4568;--red-soft:#E9EEF6;--red-soft-2:#F3F6FB;}
.rt-header{border-bottom:1px solid var(--line);}
.rt-title-row{display:flex;align-items:center;gap:10px;padding:14px 2px 10px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;}
.rt-page-title{font-size:22px;font-weight:900;margin:0;}
.rt-lead{display:flex;align-items:flex-start;gap:8px;background:var(--navy);color:#fff;border-radius:12px;padding:12px;margin-bottom:18px;font-size:12px;font-weight:600;line-height:1.6;}
.rt-lead svg{flex:none;margin-top:1px;}
.rt-h{font-size:16px;font-weight:900;margin:4px 0 11px;display:flex;align-items:baseline;gap:8px;}
.rt-h-sub{font-size:11px;font-weight:700;color:var(--ink-3);}
.rt-block{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:20px;box-shadow:var(--shadow);}
.rt-grid2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.rt-f{display:flex;flex-direction:column;gap:5px;}
.rt-f>span{font-size:11.5px;font-weight:800;color:var(--ink-2);}
.rt-f b{color:var(--red);font-size:10px;background:var(--red-soft);padding:2px 6px;border-radius:5px;margin-left:4px;}
.rt-in{width:100%;background:#fff;border:1px solid #E1E4E7;border-radius:10px;padding:11px 12px;font-size:16px;color:var(--ink);font-family:inherit;outline:none;}
.rt-in:focus{border-color:var(--red);}
.rt-ta{resize:vertical;line-height:1.5;}
.rt-sel{position:relative;display:flex;align-items:center;}
.rt-sel select{width:100%;appearance:none;-webkit-appearance:none;background:#fff;border:1px solid #E1E4E7;border-radius:10px;padding:11px 30px 11px 12px;font-size:16px;font-family:inherit;color:var(--ink);}
.rt-sel svg{position:absolute;right:10px;color:var(--ink-3);pointer-events:none;}
.rt-acc{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
.rt-acc-item{background:#fff;border:1px solid var(--line);border-radius:13px;overflow:hidden;box-shadow:var(--shadow);}
.rt-acc-head{width:100%;display:flex;align-items:center;gap:9px;padding:14px;background:none;border:none;cursor:pointer;text-align:left;}
.rt-acc-t{flex:1;font-size:14px;font-weight:800;}
.rt-acc-badge{min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:var(--red);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.rt-acc-cv{color:var(--ink-3);transition:transform .2s;}
.rt-acc-cv.open{transform:rotate(180deg);}
.rt-menus{border-top:1px solid var(--line);}
.rt-menu{width:100%;display:flex;align-items:center;gap:10px;padding:12px 14px;background:none;border:none;border-bottom:1px solid var(--line);cursor:pointer;text-align:left;}
.rt-menu:last-child{border-bottom:none;}
.rt-menu.on{background:var(--red-soft-2);}
.rt-menu-body{flex:1;min-width:0;}
.rt-menu-name{font-size:13px;font-weight:700;line-height:1.4;}
.rt-menu-price{font-size:11.5px;color:var(--ink-2);font-weight:700;margin-top:2px;}
.rt-tier{font-size:9.5px;font-weight:800;color:#fff;padding:1px 6px;border-radius:5px;margin-left:6px;vertical-align:middle;}
.t-photo{background:var(--gold);}.t-site{background:var(--navy);}.t-contract{background:var(--ink-3);}
.rt-menu-add{flex:none;width:30px;height:30px;border-radius:8px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center;}
.rt-menu-n{font-size:13px;font-weight:900;}
.rt-lines{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.rt-line{background:#fff;border:1px solid var(--line);border-radius:13px;padding:12px;box-shadow:var(--shadow);}
.rt-line-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:9px;}
.rt-line-name{font-size:13.5px;font-weight:800;line-height:1.4;}
.rt-line-act{display:flex;gap:4px;flex:none;}
.rt-line-act button{background:none;border:none;color:var(--ink-3);cursor:pointer;padding:3px;display:flex;}
.rt-loc{margin-bottom:9px;font-size:14px;padding:9px 11px;}
.rt-line-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;}
.rt-step{display:flex;align-items:center;gap:2px;background:#F4F5F6;border-radius:10px;padding:3px;}
.rt-step button{width:36px;height:34px;border:none;background:#fff;border-radius:8px;color:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.rt-step button:disabled{color:var(--ink-3);opacity:.5;}
.rt-step-in{width:52px;border:none;background:none;text-align:center;font-size:16px;font-weight:900;font-family:inherit;color:var(--ink);outline:none;}
.rt-step-u{font-size:12px;font-weight:700;color:var(--ink-2);padding-right:8px;}
.rt-fixed{font-size:13px;font-weight:800;color:var(--ink-2);background:#F4F5F6;border-radius:10px;padding:9px 16px;}
.rt-line-sub{font-size:17px;font-weight:900;color:var(--red);}
.rt-line-sub b{font-size:12px;margin-left:1px;}
.rt-sub-quote{font-size:12px;font-weight:800;color:var(--ink-3);}
.rt-adjs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
.rt-adj{display:flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:9px 12px;font-size:12px;font-weight:700;color:var(--ink);cursor:pointer;}
.rt-adj.on{border-color:var(--red);background:var(--red-soft-2);color:var(--red);}
.rt-adj-c{width:16px;height:16px;border-radius:5px;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;flex:none;}
.rt-adj-c.on{background:var(--red);border-color:var(--red);color:#fff;}
.rt-adj-v{font-size:10.5px;font-weight:800;color:var(--ink-3);}
.rt-result{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:20px;box-shadow:var(--shadow);}
.rt-res-head{border-bottom:1px solid var(--line);padding-bottom:13px;margin-bottom:13px;}
.rt-res-l{font-size:12px;font-weight:800;color:var(--ink-2);}
.rt-res-v{font-size:32px;font-weight:900;color:var(--red);line-height:1.1;}
.rt-res-v b{font-size:17px;margin-left:2px;}
.rt-res-tax{font-size:12px;font-weight:700;color:var(--ink-2);}
.rt-res-rows{display:flex;flex-direction:column;gap:8px;}
.rt-res-row{display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;color:var(--ink-2);}
.rt-res-row.bold{font-size:14px;font-weight:900;color:var(--ink);}
.rt-res-div{height:1px;background:var(--line);margin:4px 0;}
.rt-res-notes{margin-top:13px;padding-top:13px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:7px;}
.rt-res-notes div{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--ink-2);}
.rt-res-notes svg{color:var(--red);flex:none;}
.rt-res-disc{font-size:10.5px;color:var(--ink-3);font-weight:600;margin-top:11px;line-height:1.5;}
.rt-err{display:flex;align-items:center;gap:7px;background:#FDE9E7;border:1px solid #F5C4C0;color:var(--err);border-radius:9px;padding:10px 12px;font-size:12px;font-weight:700;margin-bottom:12px;}
.rt-empty{display:flex;flex-direction:column;align-items:center;gap:9px;padding:36px 20px;color:var(--ink-3);font-size:12.5px;font-weight:700;text-align:center;}
.rt-cartbar{position:fixed;left:0;right:0;bottom:0;max-width:var(--maxw,480px);margin:0 auto;background:#fff;border-top:1px solid var(--line);display:flex;align-items:center;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -3px 14px rgba(20,28,38,.1);}
.rt-cartbar-info{flex:1;min-width:0;}
.rt-cartbar-info span{font-size:11px;font-weight:700;color:var(--ink-3);display:block;}
.rt-cartbar-info b{font-size:15px;font-weight:900;color:var(--red);}
.rt-cartbar-btn{flex:none;background:var(--red);color:#fff;border:none;border-radius:12px;padding:13px 18px;font-size:14px;font-weight:900;cursor:pointer;}
.rt-cartbar-btn:disabled{opacity:.6;}
.rt-fin{text-align:center;padding:60px 16px;}
.rt-fin-ico{width:88px;height:88px;border-radius:50%;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
.rt-fin-t{font-size:21px;font-weight:900;margin:0 0 12px;}
.rt-fin-d{font-size:13px;color:var(--ink-2);font-weight:600;line-height:1.7;margin:0 0 22px;}
.rt-fin-btn{display:inline-flex;background:#33517D;color:#fff;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:800;text-decoration:none;}
`;
