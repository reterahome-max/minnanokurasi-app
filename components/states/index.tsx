import {
  Loader2,
  Inbox,
  WifiOff,
  CalendarX,
  SearchX,
  RotateCcw,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

/**
 * RE:TERA HOME — 状態表示コンポーネント集（Loading / Skeleton / Empty / Error / ImageFallback）
 * RETERA_States.jsx から分解。見た目は不変（CSS は globals.css の state ブロック）。
 *
 * 使い方の例：
 *   if (loading) return <Loading label="空き状況を読み込み中" />;
 *   if (error)   return <ErrorState onRetry={refetch} />;
 *   if (!items.length) return <Empty preset="orders" />;
 *   return <List items={items} />;
 */

/* ───────── ローディング（スピナー） ───────── */
export function Loading({ label = "読み込み中" }: { label?: string }) {
  return (
    <div className="rt-state">
      <Loader2 className="rt-spin" size={34} strokeWidth={2.2} />
      <div className="rt-state-t">{label}</div>
    </div>
  );
}

/* ───────── スケルトン（カードリスト用） ───────── */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="rt-skel-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="rt-skel-card" key={i}>
          <div className="rt-skel-thumb" />
          <div className="rt-skel-body">
            <div className="rt-skel-line w70" />
            <div className="rt-skel-line w45" />
            <div className="rt-skel-line w30 tall" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── 空表示（プリセット切替） ───────── */
type EmptyPreset = "orders" | "search" | "slots" | "history";

const EMPTY_PRESETS = {
  orders: { icon: Inbox, title: "ご予約はまだありません", desc: "気になるサービスから、かんたんに予約できます。", cta: "サービスを探す" as string | null },
  search: { icon: SearchX, title: "該当する結果が見つかりません", desc: "別のキーワードやカテゴリでお試しください。", cta: null as string | null },
  slots: { icon: CalendarX, title: "この日は空きがありません", desc: "別の日付を選ぶか、キャンセル待ちにご登録ください。", cta: "キャンセル待ちに登録" as string | null },
  history: { icon: RotateCcw, title: "ご利用履歴はまだありません", desc: "初めてのご利用、お待ちしております。", cta: "サービスを探す" as string | null },
};

export function Empty({
  preset = "orders",
  title,
  desc,
  cta,
  onCta,
}: {
  preset?: EmptyPreset;
  title?: string;
  desc?: string;
  cta?: string | null;
  onCta?: () => void;
}) {
  const p = EMPTY_PRESETS[preset] || EMPTY_PRESETS.orders;
  const Icon = p.icon;
  const label = cta ?? p.cta;
  return (
    <div className="rt-state">
      <div className="rt-state-ico">
        <Icon size={30} strokeWidth={1.8} />
      </div>
      <div className="rt-state-t">{title ?? p.title}</div>
      <div className="rt-state-d">{desc ?? p.desc}</div>
      {label && (
        <button className="rt-state-btn" onClick={onCta}>
          {label}
          <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      )}
    </div>
  );
}

/* ───────── エラー（再試行） ───────── */
export function ErrorState({
  title = "読み込みに失敗しました",
  desc = "通信環境をご確認のうえ、もう一度お試しください。",
  onRetry,
  offline,
}: {
  title?: string;
  desc?: string;
  onRetry?: () => void;
  offline?: boolean;
}) {
  const Icon = offline ? WifiOff : RotateCcw;
  return (
    <div className="rt-state">
      <div className="rt-state-ico err">
        <Icon size={30} strokeWidth={1.8} />
      </div>
      <div className="rt-state-t">{title}</div>
      <div className="rt-state-d">{desc}</div>
      <button className="rt-state-btn solid" onClick={onRetry}>
        <RotateCcw size={16} strokeWidth={2.4} />
        再読み込み
      </button>
    </div>
  );
}

/* ───────── 画像読み込み失敗フォールバック ───────── */
export function ImageFallback() {
  return (
    <div className="rt-img-fb">
      <ImageIcon size={22} strokeWidth={1.8} />
      <span>画像を読み込めませんでした</span>
    </div>
  );
}
