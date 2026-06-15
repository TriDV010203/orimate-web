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
  images: {
    remotePatterns: [
      // Backend localhost (ảnh cover tutorial, avatar)
      { protocol: "http", hostname: "localhost", port: "5104" },
      { protocol: "https", hostname: "localhost", port: "5104" },
      // Cloudinary, Imgur, các hosting ảnh phổ biến
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.blob.core.windows.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      // Cho phép mọi https domain (development convenience)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

