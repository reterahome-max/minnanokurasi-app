import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * サーバ専用の Firebase Admin（Firestore）。cron 等の特権処理から利用。
 * 環境変数 FIREBASE_SERVICE_ACCOUNT にサービスアカウントJSON（文字列）を設定する。
 * 未設定なら null（＝ドーマント）。※クライアントには絶対に読み込ませない。
 */
let db: Firestore | null = null;

export function getAdminDb(): Firestore | null {
  if (db) return db;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  let sa: { project_id?: string; client_email?: string; private_key?: string };
  try {
    sa = JSON.parse(raw);
  } catch {
    return null;
  }
  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n"); // 環境変数での改行エスケープ対策
  const app: App = getApps().length ? getApps()[0]! : initializeApp({ credential: cert(sa as never) });
  db = getFirestore(app);
  return db;
}
