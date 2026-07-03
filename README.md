# RE:TERA HOME

ハウスクリーニング予約アプリ（越谷市・春日部市対応）。Artifact デザインを 1px 崩さず Next.js に移植した本番実装です。

スタック：**Next.js 14（App Router）/ TypeScript / Tailwind / Firebase / Vercel**

---

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # Firebase キーを設定（未設定でもサンプルで動作）
npm run dev                        # http://localhost:3000
```

`npm run build` で本番ビルド、`npm run start` で本番サーバー起動。

---

## ディレクトリ構成

```
app/                  各画面（App Router）
  page.tsx            ホーム
  simulator/          料金シミュレーター
  booking/date|info|confirm|complete/   予約フロー
  globals.css         共通 :root 変数・フォント・共通部品 CSS（デザイン固定）
components/           Header / BottomNav / Photo / states
context/BookingContext.tsx   予約フローの状態（画面間で受け渡し）
lib/pricing.ts        価格マスター（単一データソース・calcBill）
lib/booking.ts        予約フロー共通定数（カレンダー・時間帯・支払い）
lib/firebase.ts       Firebase 初期化（キー未設定ならサンプルへフォールバック）
lib/firestore.ts      Firestore データ層（availability 読取 / bookings 作成）
scripts/seed.ts       Firestore 初期データ投入
firestore.rules       Firestore セキュリティルール
```

設計原則（A方式）：各画面の `<style>` はそのまま保持し、`:root`・ヘッダー・ボトムナビ・写真のみ共通化。色・サイズは一切変更しない。

---

## Firebase（STEP5）

1. Firebase コンソールでプロジェクト作成 → Firestore を有効化。
2. Web アプリを登録し、設定値を `.env.local` に記入（`NEXT_PUBLIC_FIREBASE_*`）。
3. セキュリティルールを `firestore.rules` の内容で公開（コンソール or `firebase deploy --only firestore:rules`）。
4. 初期データ投入：

   ```bash
   npx tsx scripts/seed.ts
   ```

   `services`（価格マスター）と `availability`（空き枠サンプル）が作成されます。

### Firestore コレクション

| コレクション | 用途 |
|---|---|
| `services` | 価格マスター（`lib/pricing` の初期データ） |
| `availability` | 日付→空き枠（doc id = `YYYY-MM-DD`、`{ month, day, remaining, mark }`） |
| `bookings` | 予約（確認画面の確定で作成、`availability` を1減算）。`userId` 付きで、`/orders`・`/mypage` は本人予約を表示 |
| `surveys` | リフォーム現地調査の申し込み（`/reform/survey` で作成） |
| `users` / `messages` | 今後 |

> `/orders`・`/mypage` はログイン中ユーザーの実データを表示します（Firebase 未設定時はサンプル表示）。`firestore.rules` で `bookings` の読み取りは `userId == request.auth.uid` の本人のみに限定。

キーがプレースホルダー（`YOUR_...`）のままでも、`/booking/date` はサンプル空き枠で表示され、`/booking/confirm` は決定的な予約番号でフローが完結します（Firestore へは書き込みません）。

---

## Vercel デプロイ（STEP7）

1. GitHub にリポジトリを作成して push（`.env.local` は `.gitignore` 済み）。
2. Vercel で当該リポジトリをインポート。
3. **Settings → Environment Variables** に `.env.local` と同じ `NEXT_PUBLIC_FIREBASE_*` を登録（Production / Preview / Development）。
4. デプロイ。ビルドは `next build`。

> 環境変数を更新したら再デプロイが必要です。
