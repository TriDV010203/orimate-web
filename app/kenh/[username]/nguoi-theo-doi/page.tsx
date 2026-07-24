import type { Metadata } from "next";
import FollowersListPage from "../../../_components/FollowersListPage";

export const metadata: Metadata = {
  title: "Người theo dõi — OriGami",
  description: "Danh sách người đang theo dõi creator này trên OriGami.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <FollowersListPage userId={username} />;
}
