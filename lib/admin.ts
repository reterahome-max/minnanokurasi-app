/**
 * RE:TERA HOME — 管理者判定（単一データソース）
 * ここに登録したメールアドレスのアカウントだけが /admin を閲覧できる。
 * ※ firestore.rules の isAdmin() と必ず同期させること（サーバ側の実権限はルールが決める）。
 */
import { COMPANY } from "./company";

/** 管理者として扱うメールアドレス（小文字で登録） */
export const ADMIN_EMAILS: string[] = [COMPANY.email.toLowerCase()];

export const isAdminEmail = (email?: string | null): boolean =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());
