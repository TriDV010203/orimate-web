import type { Metadata } from "next";
import AdminLearningPathFormPage from "../../../../../_components/AdminLearningPathFormPage";

export const metadata: Metadata = {
  title: "Sửa lộ trình học — OriGami",
  description: "Sửa nội dung và danh sách bài của lộ trình học.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminLearningPathFormPage pathId={id} />;
}
