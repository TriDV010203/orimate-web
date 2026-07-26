import type { Metadata } from "next";
import AdminRevenuePage from "../../../_components/AdminRevenuePage";

export const metadata: Metadata = {
  title: "Doanh thu VIP — OriGami Admin",
  description: "Theo dõi doanh thu, hoa hồng và xác nhận giao dịch VIP toàn nền tảng.",
};

export default function Page() {
  return <AdminRevenuePage />;
}
