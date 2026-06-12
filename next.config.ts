import type { NextConfig } from "next";

// Proxy tới HTTP port để tránh bị redirect 307 và vấn đề SSL self-signed cert
// BE cần tắt UseHttpsRedirection trong Development (xem Program.cs)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5104";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
