import type { Metadata } from "next";
import LibraryPage from "../_components/LibraryPage";

export const metadata: Metadata = {
  title: "Thư viện hướng dẫn — OriGami",
  description: "Khám phá hàng nghìn bài hướng dẫn gấp giấy Origami từ dễ đến khó. Lọc theo danh mục, độ khó, miễn phí hoặc VIP.",
};

export default function Page() {
  return <LibraryPage />;
}
