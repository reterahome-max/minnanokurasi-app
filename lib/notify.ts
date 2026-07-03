/**
 * 管理者への新着メール通知（クライアント → /api/notify）。
 * 送信失敗は本処理に影響させない（fire-and-forget）。
 * 実際の送信は API Route が Resend 経由で行い、RESEND_API_KEY 未設定なら無害にスキップ。
 */
export async function notifyAdmin(payload: {
  kind: "予約" | "見積依頼" | "メッセージ";
  title: string;
  lines?: string[];
}): Promise<void> {
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
