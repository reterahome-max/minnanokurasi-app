import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint v9 flat config（next/core-web-vitals 準拠）。
 * react-hooks v6 の React Compiler 系推奨ルール（set-state-in-effect / purity）は、
 * 既存の確立パターン（storage からの復元・購読フォールバック・イベントハンドラ内の Date.now 等）を
 * 過剰検出するため warn に降格（機能バグではなく最適化アドバイスのため）。
 */
export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];
