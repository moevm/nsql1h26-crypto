import type { NextConfig } from "next";

const getBackendApiOrigin = (): string => {
  const value = process.env.BACKEND_API_ORIGIN;

  if (!value) {
    throw new Error("Missing required environment variable: BACKEND_API_ORIGIN");
  }

  return value.replace(/\/$/, "");
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
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
