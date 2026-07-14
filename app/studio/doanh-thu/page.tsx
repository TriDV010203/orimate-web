import type { Metadata } from "next";
import RevenueStudioPage from "../../_components/RevenueStudioPage";

export const metadata: Metadata = {
  title: "Doanh thu Creator — OriGami",
  description: "Xem thống kê doanh thu và lịch sử đăng ký VIP của kênh bạn.",
};

export default function Page() {
  return <RevenueStudioPage />;
}
