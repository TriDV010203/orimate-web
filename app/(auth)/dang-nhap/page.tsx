// app/(auth)/dang-nhap/page.tsx — Route trang đăng nhập (/dang-nhap)
// Next.js App Router yêu cầu file này tên là page.tsx
// Toàn bộ UI được tách sang _components/LoginPage.tsx

import type { Metadata } from "next";
import LoginPage from "../../_components/LoginPage";

export const metadata: Metadata = {
  title: "Đăng nhập | OriGami",
  description: "Đăng nhập vào tài khoản OriGami để tiếp tục hành trình gấp giấy của bạn.",
};

export default function Page() {
  return <LoginPage />;
}
