import type { Metadata } from "next";
import WeeklyChallengePage from "../_components/WeeklyChallengePage";

export const metadata: Metadata = {
  title: "Thử thách hàng tuần — OriGami",
  description: "Cùng cộng đồng chinh phục những mẫu gấp khó hơn mỗi tuần, tích luỹ điểm thưởng và leo bảng xếp hạng.",
};

export default function Page() {
  return <WeeklyChallengePage />;
}
