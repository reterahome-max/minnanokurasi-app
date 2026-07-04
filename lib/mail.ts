import nodemailer from "nodemailer";
import { COMPANY } from "./company";

/**
 * サーバ専用のメール送信（Gmail SMTP）。
 * 環境変数 GMAIL_USER / GMAIL_APP_PASSWORD が未設定なら送信せず false を返す（ドーマント）。
 * API Route / Cron から共通利用する。
 */
export const mailConfigured = () =>
  !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return false;
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transporter.sendMail({
    from: `${COMPANY.name} <${user}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return true;
}

/** HTMLエスケープ（メール本文用） */
export const escapeHtml = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
