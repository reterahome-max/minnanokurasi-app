/**
 * RE:TERA HOME — Firebase 初期化
 * ───────────────────────────────────────────────
 * Web 設定は公開情報のため NEXT_PUBLIC_* を使用。
 * .env.local にプレースホルダーのままだと未設定とみなし、各データ層はサンプルへフォールバックします
 * （= キー未設定でもデザイン・予約フローはそのまま動作）。
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** プレースホルダー（YOUR_... / 空）でない実キーが入っているか */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("YOUR_") &&
  !!firebaseConfig.projectId &&
  !firebaseConfig.projectId.startsWith("YOUR_");

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;
let authInstance: Auth | undefined;

let appCheckStarted = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // App Check（BOT・スパム対策）：reCAPTCHA v3 サイトキーが設定されていれば有効化。
  // コンソールで App Check を Enforce すると、未検証クライアントの読み書きを遮断できる。
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (siteKey && typeof window !== "undefined" && !appCheckStarted) {
    appCheckStarted = true;
    import("firebase/app-check")
      .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
        initializeAppCheck(app!, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
      })
      .catch(() => { /* App Check 初期化失敗は致命ではない */ });
  }
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!dbInstance) dbInstance = getFirestore(a);
  return dbInstance;
}

export function getAuthInstance(): Auth | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!authInstance) authInstance = getAuth(a);
  return authInstance;
}
