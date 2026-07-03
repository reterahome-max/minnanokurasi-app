/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // lucide-react のバンドルを使用アイコンのみに絞る
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // CSP は Firebase Auth/Firestore・Next の inline hydration と干渉しやすいため
          // 導入時は Report-Only で検証してから enforce する（現段階では未設定）。
        ],
      },
    ];
  },
};

export default nextConfig;
