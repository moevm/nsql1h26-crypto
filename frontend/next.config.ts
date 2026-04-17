import type { NextConfig } from "next";

const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";

const getBackendApiOrigin = (): string => {
  const value = process.env.BACKEND_API_ORIGIN;

  if (!value) {
    throw new Error("Missing required environment variable: BACKEND_API_ORIGIN");
  }

  return value.replace(/\/$/, "");
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (apiMode !== "backend") {
      return [];
    }

    const backendApiOrigin = getBackendApiOrigin();

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiOrigin}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
