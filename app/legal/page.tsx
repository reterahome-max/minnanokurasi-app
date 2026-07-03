"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, Receipt } from "lucide-react";

/**
 * RE:TERA HOME — 法務ページ（利用規約 / プライバシーポリシー / 特定商取引法表記）
 * RETERA_Legal.jsx を移植。本文はドラフト。施行前に専門家確認。事業者情報の【　】は要差し替え。
 */
const TABS = [
  { id: "terms", label: "利用規約", icon: FileText },
  { id: "privacy", label: "プライバシー", icon: Shield },
  { id: "tokushoho", label: "特商法表記", icon: Receipt },
];

const TERMS = [
  { h: "第1条（適用）", b: "本規約は、RE:TERA HOME（以下「当社」）が提供するハウスクリーニング等のサービス（以下「本サービス」）の利用に関し、利用者と当社との間の一切の関係に適用されます。" },
  { h: "第2条（予約・契約の成立）", b: "本サービスの予約は、利用者が所定の手続きで申し込み、当社が予約確定の通知を行った時点で契約が成立します。空き状況により、ご希望に添えない場合があります。" },
  { h: "第3条（料金・支払い）", b: "料金はアプリ内に税込で表示します。表示金額以外の追加料金は原則発生しません。ただし、特殊な汚れ・破損リスク・駐車場代等が生じる場合は、作業前に説明し同意を得たうえで対応します。" },
  { h: "第4条（キャンセル）", b: "前日までのご連絡によるキャンセル・変更は無料です。当日キャンセルは、所定のキャンセル料が発生する場合があります。詳細は予約時にご案内します。" },
  { h: "第5条（作業の範囲・免責）", b: "当社は善良な管理者の注意をもって作業を行います。経年劣化・構造上の問題に起因する不具合、利用者の申告漏れによる損害について、当社は責任を負わない場合があります。" },
  { h: "第6条（損害賠償）", b: "当社の責に帰すべき事由により利用者に損害が生じた場合、当社は加入する損害保険の範囲で対応します。" },
  { h: "第7条（禁止事項）", b: "利用者は、虚偽の申告、第三者へのなりすまし、当社業務の妨害、その他法令・公序良俗に反する行為を行ってはなりません。" },
  { h: "第8条（規約の変更）", b: "当社は、必要に応じて本規約を変更できます。変更後の規約は、アプリ内に表示した時点から効力を生じます。" },
];
const PRIVACY = [
  { h: "1. 取得する情報", b: "氏名、住所、電話番号、メールアドレス、予約・決済に関する情報、アプリの利用履歴等を取得します。" },
  { h: "2. 利用目的", b: "予約の受付・確認・連絡、サービス提供、お支払い処理、お問い合わせ対応、品質向上およびご案内のために利用します。" },
  { h: "3. 第三者提供", b: "法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。決済代行・地図・通知等の委託先には、目的の範囲で必要な情報を提供することがあります。" },
  { h: "4. 安全管理", b: "個人情報への不正アクセス・漏えい・滅失を防ぐため、適切な安全管理措置を講じます。" },
  { h: "5. 開示・訂正・削除", b: "ご本人からの求めに応じ、保有する個人情報の開示・訂正・利用停止・削除に対応します。お問い合わせ窓口までご連絡ください。" },
  { h: "6. お問い合わせ窓口", b: "個人情報の取扱いに関するお問い合わせは、アプリ内のメッセージまたは下記事業者情報の連絡先までお願いします。" },
];
const TOKUSHOHO = [
  { k: "販売事業者", v: "【事業者名（屋号・法人名）】" },
  { k: "運営責任者", v: "【代表者氏名】" },
  { k: "所在地", v: "【〒・住所】" },
  { k: "連絡先", v: "【電話番号】 ／ 【メールアドレス】" },
  { k: "対応エリア", v: "埼玉県越谷市・春日部市 ほか近隣エリア" },
  { k: "販売価格", v: "各サービスページに税込で表示" },
  { k: "商品代金以外の必要料金", v: "原則なし（駐車場代等が生じる場合は事前にご案内）" },
  { k: "支払い方法", v: "現金、クレジットカード、QR・電子決済" },
  { k: "支払い時期", v: "作業完了後（事前決済の場合は予約確定時）" },
  { k: "役務の提供時期", v: "ご予約日時に作業を実施" },
  { k: "キャンセル・返品", v: "前日まで無料。当日キャンセルは所定のキャンセル料が発生する場合があります。" },
];

export default function Legal() {
  const [tab, setTab] = useState("terms");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="rt-shell">
        <header className="rt-mini-header">
          <Link href="/mypage" className="rt-back"><ArrowLeft size={22} strokeWidth={2.4} /></Link>
          <div className="rt-mini-title">規約・ポリシー</div>
        </header>

        <div className="rt-tabs">
          {TABS.map((t) => { const Icon = t.icon; return (
            <button key={t.id} className={"rt-tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>
              <Icon size={16} strokeWidth={2.2} />{t.label}
            </button>
          ); })}
        </div>

        <div className="rt-updated">最終更新日：2026年6月29日</div>

        {tab === "terms" && (
          <div className="rt-doc">
            <h1 className="rt-doc-title">利用規約</h1>
            {TERMS.map((s, i) => (
              <div className="rt-art" key={i}><div className="rt-art-h">{s.h}</div><p className="rt-art-b">{s.b}</p></div>
            ))}
          </div>
        )}

        {tab === "privacy" && (
          <div className="rt-doc">
            <h1 className="rt-doc-title">プライバシーポリシー</h1>
            <p className="rt-doc-lead">RE:TERA HOME は、お客様の個人情報を適切に取り扱い、保護に努めます。</p>
            {PRIVACY.map((s, i) => (
              <div className="rt-art" key={i}><div className="rt-art-h">{s.h}</div><p className="rt-art-b">{s.b}</p></div>
            ))}
          </div>
        )}

        {tab === "tokushoho" && (
          <div className="rt-doc">
            <h1 className="rt-doc-title">特定商取引法に基づく表記</h1>
            <div className="rt-table">
              {TOKUSHOHO.map((r, i) => (
                <div className="rt-tr" key={i}><div className="rt-th">{r.k}</div><div className="rt-td">{r.v}</div></div>
              ))}
            </div>
            <div className="rt-warn">※【　】の項目は、開業情報に合わせて必ず差し替えてください。</div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const styles = `
.rt-shell{min-height:100vh;}
.rt-mini-header{display:flex;align-items:center;gap:9px;padding:14px 2px;}
.rt-back{background:none;border:none;color:var(--ink);cursor:pointer;display:flex;padding:2px;flex:none;}
.rt-mini-title{font-size:18px;font-weight:900;}
.rt-tabs{display:flex;gap:7px;margin-bottom:12px;}
.rt-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;background:#fff;border:1.5px solid var(--line);border-radius:11px;padding:11px 6px;font-size:12px;font-weight:800;color:var(--ink-2);cursor:pointer;}
.rt-tab.on{border-color:var(--red);color:var(--red);background:var(--red-soft);}
.rt-updated{font-size:11px;color:var(--ink-3);font-weight:600;margin-bottom:14px;padding-left:2px;}
.rt-doc{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--shadow);}
.rt-doc-title{font-size:19px;font-weight:900;margin:0 0 14px;}
.rt-doc-lead{font-size:12.5px;color:var(--ink-2);font-weight:600;line-height:1.7;margin:0 0 16px;}
.rt-art{margin-bottom:18px;}
.rt-art:last-child{margin-bottom:0;}
.rt-art-h{font-size:14px;font-weight:900;margin-bottom:6px;}
.rt-art-b{font-size:12.5px;color:var(--ink-2);font-weight:500;line-height:1.8;margin:0;}
.rt-table{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden;}
.rt-tr{display:flex;border-bottom:1px solid var(--line);}
.rt-tr:last-child{border-bottom:none;}
.rt-th{flex:none;width:124px;background:#FAFBFB;padding:12px;font-size:12px;font-weight:800;color:var(--ink);border-right:1px solid var(--line);}
.rt-td{flex:1;padding:12px;font-size:12px;color:var(--ink-2);font-weight:600;line-height:1.6;}
.rt-warn{font-size:11px;color:var(--red);font-weight:700;margin-top:13px;line-height:1.5;}
`;
