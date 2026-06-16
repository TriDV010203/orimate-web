// app/(auth)/quen-mat-khau/page.tsx — Route trang Quên mật khẩu (/quen-mat-khau)

import type { Metadata } from "next";
import ForgotPasswordPage from "../../_components/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Quên mật khẩu | OriGami",
  description: "Đặt lại mật khẩu tài khoản OriGami của bạn. Chúng tôi sẽ gửi liên kết khôi phục qua email.",
};

export default function Page() {
  return <ForgotPasswordPage />;
}
