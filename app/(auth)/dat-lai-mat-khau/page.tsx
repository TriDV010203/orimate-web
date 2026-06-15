// app/(auth)/dat-lai-mat-khau/page.tsx — Route trang Đặt lại mật khẩu (/dat-lai-mat-khau?token=xxx)
// useSearchParams cần Suspense boundary

import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPage from "../../_components/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | OriGami",
  description: "Tạo mật khẩu mới cho tài khoản OriGami của bạn.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
