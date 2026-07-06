import { NextRequest, NextResponse } from "next/server";
import { sendMail, mailConfigured, escapeHtml } from "@/lib/mail";
import { COMPANY } from "@/lib/company";

/**
 * メール送信エンドポイント（Gmail SMTP / lib/mail）。
 * GMAIL_USER / GMAIL_APP_PASSWORD 未設定なら送信せずスキップ（ドーマント）。ドメイン認証は不要。
 * 宛先：audience:"admin"（既定）→ COMPANY.email、audience:"customer" → 検証済みの to。
 * 本文はサーバ側でテンプレート化（公開エンドポイントのため任意本文は受け付けない）。
 */
export const runtime = "nodejs";

const isEmail = (s: unknown) => typeof s === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 254;

/* ── 悪用対策 ─────────────────────────────────────
 * 公開エンドポイントのため、①同一オリジンのブラウザ呼び出しのみ許可（Origin検証）、
 * ②IPごとのレート制限（10通/時・インスタンス内メモリ）を敷く。
 * サーバレスでインスタンスが分かれても、Origin検証が主防御・レート制限は増幅の抑止。 */
const ALLOWED_HOSTS = new Set([new URL(COMPANY.url).host, "localhost:3000"]);

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false; // ブラウザの fetch は必ず Origin を送る。無しは直叩きとみなす
  try {
    return ALLOWED_HOSTS.has(new URL(origin).host);
  } catch {
    return false;
  }
}

const RATE_LIMIT = 10;                 // 通/ウィンドウ
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1時間
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) { hits.set(ip, arr); return true; }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // メモリ暴走防止（雑でよい）
  return false;
}

export async function POST(req: NextRequest) {
  if (!mailConfigured()) return NextResponse.json({ ok: false, skipped: "no_smtp_config" });
  if (!originAllowed(req)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let body: { audience?: string; to?: string; kind?: string; title?: string; lines?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const audience = body.audience === "customer" ? "customer" : "admin";
  const kind = String(body.kind ?? "通知").slice(0, 40);
  const title = String(body.title ?? "").slice(0, 160);
  const lines = Array.isArray(body.lines) ? body.lines.slice(0, 20).map((l) => String(l).slice(0, 300)) : [];

  const to = audience === "customer" ? body.to : COMPANY.email;
  if (audience === "customer" && !isEmail(to)) {
    return NextResponse.json({ ok: false, error: "invalid_to" }, { status: 400 });
  }

  const subject =
    audience === "customer"
      ? `【${COMPANY.name}】ご予約ありがとうございます`
      : `【新着${kind}】${title}`.slice(0, 120);

  const heading = audience === "customer" ? "ご予約を承りました" : `【新着】${kind}`;
  const footer =
    audience === "customer"
      ? `<p style="margin-top:16px;font-size:12px;color:#666">ご予約内容の確認・変更は <a href="${COMPANY.url}/orders">マイページ</a> から。<br>${COMPANY.name}｜${COMPANY.tel}｜${COMPANY.area}</p>`
      : `<p style="margin-top:14px">管理画面で確認：<a href="${COMPANY.url}/admin">${COMPANY.url}/admin</a></p>`;

  const html =
    `<div style="font-family:sans-serif;line-height:1.7;color:#222">` +
    `<h2 style="margin:0 0 8px">${escapeHtml(heading)}</h2>` +
    (title ? `<p style="margin:0 0 10px;font-weight:bold">${escapeHtml(title)}</p>` : "") +
    (lines.length ? `<ul>${lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>` : "") +
    footer +
    `</div>`;

  try {
    await sendMail({ to: to as string, subject, html });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
