import type { Metadata } from "next";
import AdminSettingsPage from "../../../_components/AdminSettingsPage";

export const metadata: Metadata = {
  title: "Cấu hình hệ thống — OriGami",
  description: "Quản lý từ khóa bị chặn trên nền tảng.",
};

export default function Page() {
  return <AdminSettingsPage />;
}
