import NextImage from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { IMAGES } from "@/lib/images";

/**
 * 共通写真コンポーネント。
 * - srcKey で lib/images.ts の URL を参照（未設定はプレースホルダー）。
 * - badge を渡すと Before/After バッジを重ねる。
 * - next/image による最適化配信（WebP/AVIF・srcset）。CSSは従来どおり .rt-photo が適用され見た目不変。
 * - priority はファーストビュー画像（ヒーロー等）にのみ指定し LCP を改善する。
 * 見た目は各 jsx の .rt-photo / .rt-ph に一致。
 */

// 画像の固有サイズ（CLS防止用。表示サイズはCSS .rt-photo が決める）
const DIMS: Record<string, { w: number; h: number }> = {
  hero: { w: 1122, h: 1402 },
};
const DEFAULT_DIM = { w: 1448, h: 1086 };

export default function Photo({
  srcKey,
  alt,
  badge,
  priority = false,
}: {
  srcKey: string;
  alt: string;
  badge?: "Before" | "After";
  priority?: boolean;
}) {
  const src = IMAGES[srcKey];
  const { w, h } = DIMS[srcKey] ?? DEFAULT_DIM;
  const badgeEl = badge ? (
    <span className={"rt-ba-badge " + (badge === "After" ? "rt-ba-after" : "rt-ba-before")}>
      {badge}
    </span>
  ) : null;

  if (src) {
    return (
      <>
        {badgeEl}
        <NextImage
          className="rt-photo"
          src={src}
          alt={alt}
          width={w}
          height={h}
          priority={priority}
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </>
    );
  }

  return (
    <>
      {badgeEl}
      <div className="rt-photo rt-ph" role="img" aria-label={alt}>
        <ImageIcon size={24} strokeWidth={1.8} />
        <span>写真</span>
      </div>
    </>
  );
}
