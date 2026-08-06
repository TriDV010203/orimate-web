import type { Metadata } from "next";
import AdminLearningPathModesPage from "../../../_components/AdminLearningPathModesPage";

export const metadata: Metadata = {
  title: "Chế độ lộ trình — OriGami",
  description: "Quản lý các chế độ lộ trình học và bài test mở khoá.",
};

export default function Page() {
  return <AdminLearningPathModesPage />;
}
