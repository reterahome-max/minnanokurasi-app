import { Image as ImageIcon } from "lucide-react";
import { IMAGES } from "@/lib/images";

/**
 * 共通写真コンポーネント。
 * - srcKey で lib/images.ts の URL を参照（未設定はプレースホルダー）。
 * - badge を渡すと Before/After バッジを重ねる。
 * 見た目は各 jsx の .rt-photo / .rt-ph に一致。
 */
export default function Photo({
  srcKey,
  alt,
  badge,
}: {
  srcKey: string;
  alt: string;
  badge?: "Before" | "After";
}) {
  const src = IMAGES[srcKey];
  const badgeEl = badge ? (
    <span className={"rt-ba-badge " + (badge === "After" ? "rt-ba-after" : "rt-ba-before")}>
      {badge}
    </span>
  ) : null;

  if (src) {
    return (
      <>
        {badgeEl}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="rt-photo" src={src} alt={alt} loading="lazy" />
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
