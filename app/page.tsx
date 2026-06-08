// app/page.tsx — Route trang chủ (/)
// Next.js App Router yêu cầu file này tên là page.tsx
// Toàn bộ UI được tách sang _components/HomePage.tsx

import type { Metadata } from "next";
import HomePage from "./_components/HomePage";

export const metadata: Metadata = {
  title: "OriGami — Nền tảng cộng đồng gấp giấy hàng đầu Việt Nam",
  description:
    "Khám phá hàng nghìn bài hướng dẫn gấp giấy Origami. Học từ cộng đồng, chia sẻ thành quả và tham gia dự án gia đình sáng tạo.",
};

export default function Page() {
  return <HomePage />;
}
