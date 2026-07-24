import type { Metadata } from "next";
import CommunityFeedPage from "../_components/CommunityFeedPage";

export const metadata: Metadata = {
  title: "Cộng đồng — OriGami",
  description: "Chia sẻ tác phẩm Origami, kết nối với cộng đồng nghệ sĩ gấp giấy toàn quốc.",
};

export default function Page() {
  return <CommunityFeedPage />;
}
