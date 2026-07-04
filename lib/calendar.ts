/**
 * 予約をカレンダーに追加するためのユーティリティ。
 * Googleカレンダー用URL と、.ics ファイル本文を生成する。
 * 時間は枠(slot)から算出：開始 = 9 + slot*2 時、終了 = 開始 + 2 時（lib/booking の SLOTS と一致）。
 */
export interface CalEvent {
  title: string;
  year: number;
  month: number;
  day: number;
  slot: number;
  details: string;
  location: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (y: number, m: number, d: number, h: number) => `${y}${pad(m)}${pad(d)}T${pad(h)}0000`;

const range = (e: CalEvent) => {
  const startH = 9 + e.slot * 2;
  return { start: stamp(e.year, e.month, e.day, startH), end: stamp(e.year, e.month, e.day, startH + 2) };
};

/** Googleカレンダー「予定を作成」URL（日本時間） */
export function googleCalendarUrl(e: CalEvent): string {
  const { start, end } = range(e);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${start}/${end}`,
    details: e.details,
    location: e.location,
    ctz: "Asia/Tokyo",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** .ics ファイル本文（Apple/Outlook 等） */
export function icsContent(e: CalEvent): string {
  const { start, end } = range(e);
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RE:TERA HOME//booking//JA",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${start}-retera@minnanokurasi-app`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(e.details)}`,
    `LOCATION:${esc(e.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** .ics をダウンロードさせる（ブラウザ） */
export function downloadIcs(e: CalEvent, filename = "reservation.ics") {
  const blob = new Blob([icsContent(e)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
