/**
 * RE:TERA HOME — Firestore 初期データ投入スクリプト
 * ───────────────────────────────────────────────
 * services（価格マスター）と availability（今月〜+2ヶ月の空き枠）を投入します。
 * 空き枠は平日=5枠（○）・日曜=0枠（×）で生成。過去日・当日は除外。
 *
 * 実行（実キーを .env.local に設定後）：
 *   npx tsx scripts/seed.ts
 *
 * 注意：firestore.rules は availability の create を拒否するため、
 *   実行時は一時的にルールを緩めるか、コンソールから投入してください。
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { SERVICES } from "../lib/pricing";
import { today, addMonths, daysInMonthOf, BOOKING_HORIZON_MONTHS } from "../lib/booking";

function loadEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* .env.local が無ければ既存の環境変数を使用 */ }
}

const pad = (n: number) => String(n).padStart(2, "0");

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

  // availability（今月〜+N ヶ月）
  const t = today();
  let count = 0;
  for (let n = 0; n <= BOOKING_HORIZON_MONTHS; n++) {
    const { year, month } = addMonths(t.year, t.month, n);
    const days = daysInMonthOf(year, month);
    for (let d = 1; d <= days; d++) {
      if (n === 0 && d <= t.day) continue; // 過去日・当日は除外
      const dow = new Date(year, month - 1, d).getDay();
      const remaining = dow === 0 ? 0 : 5;
      const id = `${year}-${pad(month)}-${pad(d)}`;
      await setDoc(doc(db, "availability", id), {
        month: `${year}-${pad(month)}`,
        day: d,
        remaining,
        mark: remaining <= 0 ? "×" : remaining <= 2 ? "△" : "○",
      });
      count++;
    }
    console.log(`  availability ${year}-${pad(month)} 完了`);
  }

  console.log(`\n✓ 投入完了：services ${SERVICES.length}件 / availability ${count}件`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
