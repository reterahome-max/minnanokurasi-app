import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sendMail, mailConfigured, escapeHtml } from "@/lib/mail";
import { COMPANY } from "@/lib/company";
import { getService } from "@/lib/pricing";

/**
 * 前日リマインド（Vercel Cron から日次実行）。
 * 「明日ご訪問予定」の予約を Firebase Admin SDK で抽出し、お客様へメール送信、
 * reminderSent フラグで二重送信を防ぐ。
 * 保護：CRON_SECRET が必須。Vercel Cron は Authorization: Bearer <CRON_SECRET> を自動付与する。
 * 依存：GMAIL_*（送信）／FIREBASE_SERVICE_ACCOUNT（読み取り）。未設定なら安全にスキップ。
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const pad = (n: number) => String(n).padStart(2, "0");

// 実行時刻(UTC)から JST の「明日」を求める
function tomorrowJST() {
  const jst = new Date(Date.now() + 9 * 3600 * 1000);
  jst.setUTCDate(jst.getUTCDate() + 1);
  const y = jst.getUTCFullYear(), m = jst.getUTCMonth() + 1, d = jst.getUTCDate();
  return { key: `${y}-${pad(m)}-${pad(d)}` };
}

async function run() {
  if (!mailConfigured()) return { ok: false, error: "no_smtp_config" };
  const db = getAdminDb();
  if (!db) return { ok: false, error: "admin_not_configured" };

  const { key } = tomorrowJST();
  const snap = await db.collection("bookings").where("dateKey", "==", key).get();

  let sent = 0, skipped = 0;
  for (const doc of snap.docs) {
    const b = doc.data() as Record<string, unknown>;
    const customer = (b.customer ?? {}) as { name?: string; email?: string; addr?: string; building?: string; zip?: string };
    const email = customer.email;
    if (b.status === "cancelled" || b.reminderSent === true || !email) { skipped++; continue; }

    const isReform = !!(b.reform && (b.reform as { items?: unknown[] }).items?.length);
    const svc = getService(String(b.serviceId ?? ""));
    const svcLabel = isReform
      ? `リフォーム工事 × ${(b.reform as { items: unknown[] }).items.length}件`
      : `${svc?.title ?? b.serviceId}${b.qty ? ` × ${b.qty}${svc?.unitLabel ?? ""}` : ""}`;
    const addr = [customer.zip && `〒${customer.zip}`, customer.addr, customer.building].filter(Boolean).join(" ");

    const html =
      `<div style="font-family:sans-serif;line-height:1.7;color:#222">` +
      `<h2 style="margin:0 0 8px">明日ご訪問予定のお知らせ</h2>` +
      `<p style="margin:0 0 10px">${escapeHtml(customer.name ?? "お客様")} 様<br>明日、下記のご予約でお伺いします。よろしくお願いいたします。</p>` +
      `<ul>` +
      `<li>内容：${escapeHtml(svcLabel)}</li>` +
      `<li>日時：${escapeHtml(String(b.dateLabel ?? ""))}</li>` +
      (addr ? `<li>場所：${escapeHtml(addr)}</li>` : "") +
      `<li>予約番号：${escapeHtml(String(b.bookingNo ?? ""))}</li>` +
      `</ul>` +
      `<p style="font-size:12px;color:#666;margin-top:14px">ご都合が悪くなった場合は、お早めに <a href="${COMPANY.url}/messages">メッセージ</a> またはお電話（${COMPANY.tel}）でご連絡ください。<br>${COMPANY.name}｜${COMPANY.area}</p>` +
      `</div>`;

    try {
      await sendMail({ to: email, subject: `【${COMPANY.name}】明日ご訪問予定のご予約リマインド`, html });
      await doc.ref.update({ reminderSent: true, reminderSentAt: new Date().toISOString() });
      sent++;
    } catch {
      skipped++;
    }
  }
  return { ok: true, date: key, total: snap.size, sent, skipped };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "no_cron_secret" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result);
}
