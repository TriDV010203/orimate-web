// import type { NextConfig } from "next";

// // Proxy tới BE đã deploy (orimate.runasp.net chỉ chạy HTTP, không có SSL)
// // Set NEXT_PUBLIC_API_URL=http://localhost:5104 trong .env.local nếu muốn chạy BE local khi dev
// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://orimate.runasp.net";

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
//     remotePatterns: [
//       // Backend đã deploy (ảnh cover tutorial, avatar)
//       { protocol: "http", hostname: "orimate.runasp.net" },
//       // Backend localhost (khi dev local)
//       { protocol: "http", hostname: "localhost", port: "5104" },
//       { protocol: "https", hostname: "localhost", port: "5104" },
//       // Cloudinary, Imgur, các hosting ảnh phổ biến
//       { protocol: "https", hostname: "res.cloudinary.com" },
//       { protocol: "https", hostname: "i.imgur.com" },
//       { protocol: "https", hostname: "**.blob.core.windows.net" },
//       { protocol: "https", hostname: "**.amazonaws.com" },
//       // Cho phép mọi https domain (development convenience)
//       { protocol: "https", hostname: "**" },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

// Proxy tới HTTP port để tránh bị redirect 307 và vấn đề SSL self-signed cert
// BE cần tắt UseHttpsRedirection trong Development (xem Program.cs)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5104";

const nextConfig: NextConfig = {
  // Thêm đoạn devIndicators này vào để tắt biểu tượng góc màn hình
  devIndicators: {
    appIsrStatus: false, 
    buildActivity: false, 
  },
  
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
    // Áp dụng cho MỌI <Image> trong app, không cần truyền loader={} thủ công nữa.
    loader: "custom",
    loaderFile: "./lib/cloudinaryLoader.ts",
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
    // Next.js 16 bắt buộc khai báo whitelist các mức quality được phép dùng
    // qua prop quality={} trên <Image>, nếu không sẽ tự làm tròn về giá trị
    // gần nhất trong danh sách mặc định ([75]).
    qualities: [75, 80],
  },
};

export default nextConfig;

