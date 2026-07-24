import type { Metadata } from "next";
import FollowingListPage from "../../_components/FollowingListPage";

export const metadata: Metadata = {
  title: "Đang theo dõi — OriGami",
  description: "Danh sách creators bạn đang theo dõi trên OriGami.",
};

export default function Page() {
  return <FollowingListPage />;
}
