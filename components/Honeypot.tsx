"use client";

/**
 * ハニーポット（ボット対策）。
 * 人間には見えない・フォーカスも当たらない入力欄。ボットは機械的に埋めるため、
 * 値が入っていたら送信処理を黙って中断する（ゲスト送信フォーム共通）。
 * 使い方：const [hp, setHp] = useState(""); 送信関数の先頭で if (hp) return;
 */
export default function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="company_website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
    />
  );
}
