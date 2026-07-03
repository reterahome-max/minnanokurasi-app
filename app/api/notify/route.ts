import { NextRequest, NextResponse } from "next/server";
import { COMPANY } from "@/lib/company";

/**
 * 管理者への新着メール通知エンドポイント。
 * Resend の REST API を使用（SDK不要）。環境変数：
 *   RESEND_API_KEY … Resend の APIキー（未設定なら送信せずスキップ）
 *   NOTIFY_FROM    … 差出人（省略時は Resend のテスト差出人）
 *   NOTIFY_TO      … 宛先（省略時は COMPANY.email）
 * 宛先は管理者アドレス固定なので、外部から叩かれても被害は限定的。
 */
export const runtime = "nodejs";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, skipped: "no_api_key" });

  let body: { kind?: string; title?: string; lines?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const kind = String(body.kind ?? "通知").slice(0, 40);
  const title = String(body.title ?? "").slice(0, 120);
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 20).map((l) => String(l).slice(0, 300)) : [];

  const from = process.env.NOTIFY_FROM || "RE:TERA HOME <onboarding@resend.dev>";
  const to = process.env.NOTIFY_TO || COMPANY.email;

  const html =
    `<div style="font-family:sans-serif;line-height:1.7">` +
    `<h2 style="margin:0 0 8px">【新着】${esc(kind)}</h2>` +
    (title ? `<p style="margin:0 0 10px;font-weight:bold">${esc(title)}</p>` : "") +
    (lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "") +
    `<p style="margin-top:14px">管理画面で確認：<a href="${COMPANY.url}/admin">${COMPANY.url}/admin</a></p>` +
    `</div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: `【新着${kind}】${title}`.slice(0, 120), html }),
    });
    if (!r.ok) return NextResponse.json({ ok: false, error: await r.text() }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
