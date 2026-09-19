//

// // Proxy tới BE đã deploy (orimate.runasp.net chỉ chạy HTTP, không có SSL)
// // Trong môi trường dev, luôn ưu tiên backend local để tránh vô tình gọi API online.
// const API_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://localhost:5104"
//     : process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5104";

// const nextConfig: NextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${API_URL}/api/:path*`,
//       },
//     ];
//   },
//   images: {
//     // Bypass Next.js built-in Image Optimization API — Cloudinary tự xử lý
//     // resize/format qua URL params (f_auto,c_limit,w_,q_) trong lib/cloudinaryLoader.ts.
//     loader: "custom",
//     loaderFile: "./lib/cloudinaryLoader.ts",
//     remotePatterns: [
//       // Backend đã deploy (ảnh cover tutorial, avatar)
//       //{ protocol: "http", hostname: "orimate.runasp.net" },
//       // Backend localhost (khi dev local)
//       { protocol: "http", hostname: "localhost", port: "5104" },
//       { protocol: "https", hostname: "localhost", port: "5104" },
//       // Cloudinary, Imgur, các hosting ảnh phổ biến
//       { protocol: "https", hostname: "res.cloudinary.com" },
//       { protocol: "https", hostname: "i.imgur.com" },
//       { protocol: "https", hostname: "**.blob.core.windows.net" },
//       { protocol: "https", hostname: "**.amazonaws.com" },
//       { protocol: "https", hostname: "**" },
//     ],
//     // Next.js 16 bắt buộc khai báo whitelist các mức quality được phép dùng
//     qualities: [75, 80],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

// Proxy tới BE đã deploy (orimate.runasp.net chỉ chạy HTTP, không có SSL)
// Set NEXT_PUBLIC_API_URL=http://localhost:5104 trong .env.local nếu muốn chạy BE local khi dev
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://orimate.runasp.net";

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
    // Bypass Next.js built-in Image Optimization API — Cloudinary tự xử lý
    // resize/format qua URL params (f_auto,c_limit,w_,q_) trong lib/cloudinaryLoader.ts.
    loader: "custom",
    loaderFile: "./lib/cloudinaryLoader.ts",
    remotePatterns: [
      // Backend đã deploy (ảnh cover tutorial, avatar)
      { protocol: "http", hostname: "orimate.runasp.net" },
      // Backend localhost (khi dev local)
      { protocol: "http", hostname: "localhost", port: "5104" },
      { protocol: "https", hostname: "localhost", port: "5104" },
      // Cloudinary, Imgur, các hosting ảnh phổ biến
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "**.blob.core.windows.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**" },
    ],
    // Next.js 16 bắt buộc khai báo whitelist các mức quality được phép dùng
    qualities: [75, 80],
  },
};

export default nextConfig;