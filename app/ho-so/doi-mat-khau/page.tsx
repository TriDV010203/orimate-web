import { Suspense } from "react";
import ChangePasswordPage from "@/app/_components/ChangePasswordPage";

export const metadata = {
  title: "Đổi mật khẩu | OriGami",
  description: "Thay đổi mật khẩu tài khoản của bạn",
};

export default function Page() {
  return (
    <Suspense>
      <ChangePasswordPage />
    </Suspense>
  );
}
