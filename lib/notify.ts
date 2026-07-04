/**
 * メール通知（クライアント → /api/notify → Gmail SMTP）。
 * 送信失敗は本処理に影響させない（fire-and-forget）。
 * 実際の送信は API Route が行い、GMAIL_USER / GMAIL_APP_PASSWORD 未設定なら無害にスキップ。
 */
async function postNotify(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* 通知は補助機能。失敗しても予約/送信自体は完了させる。 */
  }
}

/** 管理者（COMPANY.email）へ新着通知 */
export function notifyAdmin(payload: {
  kind: "予約" | "見積依頼" | "メッセージ" | "法人問い合わせ";
  title: string;
  lines?: string[];
}): Promise<void> {
  return postNotify({ audience: "admin", ...payload });
}

/** お客様へ予約確定の控えメール（メール未入力なら送らない） */
export function notifyCustomer(payload: {
  to?: string | null;
  title: string;
  lines?: string[];
}): Promise<void> {
  if (!payload.to) return Promise.resolve();
  return postNotify({ audience: "customer", kind: "予約確定", ...payload });
}
