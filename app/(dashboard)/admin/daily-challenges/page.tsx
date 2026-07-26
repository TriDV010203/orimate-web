import type { Metadata } from "next";
import AdminDailyChallengesPage from "../../../_components/AdminDailyChallengesPage";

export const metadata: Metadata = {
  title: "Thử thách ngày — Quản trị OriGami",
  description: "Đặt lịch và theo dõi Thử thách ngày.",
};

export default function Page() {
  return <AdminDailyChallengesPage />;
}
