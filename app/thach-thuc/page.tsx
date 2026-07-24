import type { Metadata } from "next";
import DailyChallengePage from "../_components/DailyChallengePage";

export const metadata: Metadata = {
  title: "Thử thách hàng ngày — OriGami",
  description: "Cùng cộng đồng gấp giấy mỗi ngày, giữ streak và leo bảng xếp hạng.",
};

export default function Page() {
  return <DailyChallengePage />;
}
