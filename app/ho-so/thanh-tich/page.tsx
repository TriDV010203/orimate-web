import type { Metadata } from "next";
import AchievementsPage from "../../_components/AchievementsPage";

export const metadata: Metadata = {
  title: "Thành tựu — Quang Minh",
  description:
    "Khám phá 24 thành tựu Origami của Quang Minh — những tác phẩm đặc sắc được ghi lại trên hành trình nghệ thuật gấp giấy.",
};

export default function AchievementsRoute() {
  return <AchievementsPage />;
}
