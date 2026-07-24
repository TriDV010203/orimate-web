import type { Metadata } from "next";
import FollowingListPage from "../../../_components/FollowingListPage";

export const metadata: Metadata = {
  title: "Đang theo dõi — OriGami",
  description: "Danh sách creator mà người dùng này đang theo dõi trên OriGami.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <FollowingListPage userId={username} />;
}
