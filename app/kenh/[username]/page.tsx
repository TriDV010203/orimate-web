import type { Metadata } from "next";
import CreatorChannelPage from "../../_components/CreatorChannelPage";

export const metadata: Metadata = {
  title: "Kênh Creator — OriGami",
  description: "Xem tất cả bài hướng dẫn và thông tin về creator này trên OriGami.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <CreatorChannelPage userId={username} />;
}
