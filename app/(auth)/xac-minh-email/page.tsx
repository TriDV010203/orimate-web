// app/(auth)/xac-minh-email/page.tsx — Route trang Xác minh email (/xac-minh-email?token=xxx)
// useSearchParams cần Suspense boundary

import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailPage from "../../_components/VerifyEmailPage";

export const metadata: Metadata = {
  title: "Xác minh email | OriGami",
  description: "Xác minh địa chỉ email để kích hoạt tài khoản OriGami của bạn.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPage />
    </Suspense>
  );
}
