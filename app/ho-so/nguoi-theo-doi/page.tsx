import type { Metadata } from "next";
import FollowersListPage from "../../_components/FollowersListPage";

export const metadata: Metadata = {
  title: "Người theo dõi — OriGami",
  description: "Danh sách người đang theo dõi bạn trên OriGami.",
};

export default function Page() {
  return <FollowersListPage />;
}
