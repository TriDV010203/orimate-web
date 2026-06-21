import type { Metadata } from "next";
import WishlistPage from "../_components/WishlistPage";

export const metadata: Metadata = {
  title: "Danh sách yêu thích — OriGami",
  description: "Xem lại các bài hướng dẫn Origami bạn đã lưu.",
};

export default function Page() {
  return <WishlistPage />;
}
