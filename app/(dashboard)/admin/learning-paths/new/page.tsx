import type { Metadata } from "next";
import AdminLearningPathFormPage from "../../../../_components/AdminLearningPathFormPage";

export const metadata: Metadata = {
  title: "Tạo lộ trình học — OriGami",
  description: "Tạo lộ trình học mới từ các bài hướng dẫn Admin/Manager đã đăng.",
};

export default function Page() {
  return <AdminLearningPathFormPage />;
}
