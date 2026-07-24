import type { Metadata } from "next";
import AdminLearningPathsPage from "../../../_components/AdminLearningPathsPage";

export const metadata: Metadata = {
  title: "Lộ trình học — OriGami",
  description: "Danh sách lộ trình học, biên soạn từ các bài hướng dẫn Admin/Manager đã đăng.",
};

export default function Page() {
  return <AdminLearningPathsPage />;
}
