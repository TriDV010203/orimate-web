import type { Metadata } from "next";
import AdminDashboardPage from "../../_components/AdminDashboardPage";

export const metadata: Metadata = {
  title: "Tổng quan quản trị — OriGami",
  description: "Bảng điều khiển quản trị hệ thống OriGami.",
};

export default function Page() {
  return <AdminDashboardPage />;
}
