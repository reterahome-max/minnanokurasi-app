import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { COMPANY } from "@/lib/company";

/**
 * メール送信エンドポイント（Gmail SMTP / Nodemailer）。
 * 環境変数：
 *   GMAIL_USER          … 送信元 Gmail（例 reterahome@gmail.com）
 *   GMAIL_APP_PASSWORD  … Googleアカウントの「アプリパスワード」（16桁）
 * 未設定なら送信せずスキップ（＝ドーマント）。ドメイン認証は不要。
 *
 * 宛先：
 *   audience:"admin"（既定） … COMPANY.email（管理者）へ。予約/見積/メッセージの新着通知
 *   audience:"customer"      … to のお客様へ。予約確定の控え
 * 本文はサーバ側でテンプレート化（クライアントは構造化データのみ渡す）。
 * ※公開エンドポイントのため、宛先任意送信の悪用余地を抑える目的で本文は固定書式。
 */
export const runtime = "nodejs";

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const isEmail = (s: unknown) => typeof s === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 254;

export async function POST(req: NextRequest) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return NextResponse.json({ ok: false, skipped: "no_smtp_config" });

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

  // 宛先：管理者は固定、お客様はメール形式を検証
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
    `<h2 style="margin:0 0 8px">${esc(heading)}</h2>` +
    (title ? `<p style="margin:0 0 10px;font-weight:bold">${esc(title)}</p>` : "") +
    (lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "") +
    footer +
    `</div>`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `${COMPANY.name} <${user}>`,
      to,
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}
