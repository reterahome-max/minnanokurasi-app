"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuthInstance, getDb, isFirebaseConfigured } from "@/lib/firebase";

/** 新規登録プロフィール（姓名・ふりがな分割） */
export interface SignupProfile {
  sei: string;
  mei: string;
  seiKana: string;
  meiKana: string;
  tel: string;
  email: string;
  pw: string;
}

/**
 * Firebase Auth をラップする Context。
 * Firebase 未設定（プレースホルダーキー）時は「ゲストのみ」モードで動作し、
 * ガードも無効化される（= 開発中もデザイン確認できる）。
 */
interface AuthCtx {
  user: User | null;
  loading: boolean;
  /** 実キーが設定され Auth が利用可能か */
  configured: boolean;
  /** remember=true でブラウザに保存（local）、false はセッションのみ */
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  /** 新規登録：createUser＋displayName＋Firestore users 保存 */
  register: (profile: SignupProfile) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // 未設定時はローディングなし（即ゲスト）
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email: string, password: string, remember = false) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("認証が未設定です。Firebase キーを設定してください。");
    // 「パスワードを保存する」＝ local persistence、外す＝session のみ
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    } catch {
      /* persistence 未対応環境は無視 */
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (p: SignupProfile) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("認証が未設定です。Firebase キーを設定してください。");
    const cred = await createUserWithEmailAndPassword(auth, p.email, p.pw);
    await updateProfile(cred.user, { displayName: `${p.sei} ${p.mei}` });
    // Firestore users に保存（ルール未反映でも登録自体は成功させる）
    try {
      const db = getDb();
      if (db) {
        await setDoc(doc(db, "users", cred.user.uid), {
          sei: p.sei, mei: p.mei, seiKana: p.seiKana, meiKana: p.meiKana,
          tel: p.tel, email: p.email, createdAt: serverTimestamp(),
        });
      }
    } catch {
      /* users 書き込み失敗は無視（Auth 登録は完了済み） */
    }
  };

  const signOutUser = async () => {
    const auth = getAuthInstance();
    if (!auth) return;
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("認証が未設定です。Firebase キーを設定してください。");
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <Ctx.Provider
      value={{ user, loading, configured: isFirebaseConfigured, signIn, register, signOutUser, resetPassword }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
