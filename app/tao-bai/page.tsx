import type { Metadata } from "next";
import { Suspense } from "react";
import CreatePostPage from "../_components/CreatePostPage";

export const metadata: Metadata = {
  title: "Tạo bài viết — OriGami Cộng đồng",
  description: "Chia sẻ tác phẩm Origami của bạn với cộng đồng OriGami.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreatePostPage />
    </Suspense>
  );
}
