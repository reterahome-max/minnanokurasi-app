"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Photo from "@/components/Photo";

/**
 * ビフォーアフター比較スライダー（つまみを左右にドラッグで切替）。
 * 見た目のクラスはページ側 CSS（.rt-cmp 系）に一致。バッジクラスはページ差分を props で受ける。
 */
export default function BeforeAfter({
  beforeKey,
  afterKey,
  alt,
  beforeSuffix = " 施工前",
  afterSuffix = " 施工後",
  beforeBadgeClass = "rt-cmp-before",
  afterBadgeClass = "rt-cmp-after",
}: {
  beforeKey: string;
  afterKey: string;
  alt: string;
  beforeSuffix?: string;
  afterSuffix?: string;
  beforeBadgeClass?: string;
  afterBadgeClass?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((x: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      move("touches" in e ? e.touches[0].clientX : e.clientX);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [move]);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    move("touches" in e ? e.touches[0].clientX : e.clientX);
  };

  // キーボード操作（矢印キーで5%ずつ）
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
    if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
  };

  return (
    <div className="rt-cmp" ref={ref}>
      <div className="rt-cmp-layer"><Photo srcKey={afterKey} alt={alt + afterSuffix} /></div>
      <div className="rt-cmp-layer" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Photo srcKey={beforeKey} alt={alt + beforeSuffix} />
      </div>
      <span className={"rt-cmp-badge " + beforeBadgeClass}>Before</span>
      <span className={"rt-cmp-badge " + afterBadgeClass}>After</span>
      <div className="rt-cmp-handle" style={{ left: `${pos}%` }}>
        <button
          className="rt-cmp-knob"
          onMouseDown={start}
          onTouchStart={start}
          onKeyDown={onKey}
          aria-label="スライドして施工前後を比較"
          role="slider"
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <ChevronLeft size={14} strokeWidth={3} style={{ marginRight: -3 }} />
          <ChevronRight size={14} strokeWidth={3} style={{ marginLeft: -3 }} />
        </button>
      </div>
    </div>
  );
}
