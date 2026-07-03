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
  type User,
} from "firebase/auth";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
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

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("認証が未設定です。Firebase キーを設定してください。");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) throw new Error("認証が未設定です。Firebase キーを設定してください。");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
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
      value={{ user, loading, configured: isFirebaseConfigured, signIn, signUp, signOutUser, resetPassword }}
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
