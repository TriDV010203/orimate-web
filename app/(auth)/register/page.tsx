// app/(auth)/register/page.tsx — Route trang đăng ký (/register)
// Next.js App Router yêu cầu file này tên là page.tsx
// Toàn bộ UI được tách sang _components/RegisterPage.tsx

import type { Metadata } from "next";
import RegisterPage from "../../_components/RegisterPage";

export const metadata: Metadata = {
  title: "Đăng ký | OriGami",
  description: "Tạo tài khoản OriGami miễn phí. Tham gia cộng đồng gấp giấy lớn nhất Việt Nam.",
};

export default function Page() {
  return <RegisterPage />;
}
