import type { Metadata } from "next";
import NotificationsPage from "../_components/NotificationsPage";

export const metadata: Metadata = {
  title: "Thông báo — OriGami",
  description: "Xem tất cả thông báo từ cộng đồng OriGami của bạn.",
};

export default function Page() {
  return <NotificationsPage />;
}
