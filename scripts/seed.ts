/**
 * RE:TERA HOME — Firestore 初期データ投入スクリプト
 * ───────────────────────────────────────────────
 * services（価格マスター）と availability（空き枠サンプル）を投入します。
 *
 * 実行（実キーを .env.local に設定後）：
 *   npx tsx scripts/seed.ts
 *
 * 注意：書き込みには Firestore ルールの許可が必要です。
 *   セットアップ時は「テストモード」で作成するか、一時的に書き込みを許可してください。
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { SERVICES } from "../lib/pricing";
import { AVAIL, CAL_YEAR, CAL_MONTH } from "../lib/booking";

// .env.local を簡易パースして process.env へ
function loadEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* .env.local が無ければ既存の環境変数を使用 */
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
const remainingFromMark = (mark: string) => (mark === "○" ? 5 : mark === "△" ? 2 : 0);

async function main() {
  loadEnv();
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (!config.apiKey || config.apiKey.startsWith("YOUR_") || !config.projectId) {
    console.error("✗ Firebase キーが未設定です。.env.local に実キーを設定してください。");
    process.exit(1);
  }

  const db = getFirestore(initializeApp(config));

  // services
  for (const s of SERVICES) {
    await setDoc(doc(db, "services", s.id), s);
    console.log("  services/" + s.id);
  }

  // availability（サンプル月）
  const month = `${CAL_YEAR}-${pad(CAL_MONTH)}`;
  for (const [dayStr, mark] of Object.entries(AVAIL)) {
    const day = Number(dayStr);
    const id = `${CAL_YEAR}-${pad(CAL_MONTH)}-${pad(day)}`;
    await setDoc(doc(db, "availability", id), {
      month,
      day,
      mark,
      remaining: remainingFromMark(mark),
    });
    console.log("  availability/" + id);
  }

  console.log(`\n✓ 投入完了：services ${SERVICES.length}件 / availability ${Object.keys(AVAIL).length}件`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
