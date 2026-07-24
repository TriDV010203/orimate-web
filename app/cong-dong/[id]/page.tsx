import type { Metadata } from "next";
import PostDetailPage from "../../_components/PostDetailPage";

export const metadata: Metadata = {
  title: "Bài viết — OriGami Cộng đồng",
  description: "Xem chi tiết bài viết và bình luận trên cộng đồng OriGami.",
};

export default function Page() {
  return <PostDetailPage />;
}
