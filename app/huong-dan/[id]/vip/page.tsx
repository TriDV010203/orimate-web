import type { Metadata } from "next";
import VIPPreviewPage from "../../../_components/VIPPreviewPage";

export const metadata: Metadata = {
  title: "Nội dung VIP — OriGami",
  description: "Đăng ký gói VIP để truy cập toàn bộ hướng dẫn chi tiết từ các creator hàng đầu.",
};

export default function Page() {
  return <VIPPreviewPage />;
}
