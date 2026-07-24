import type { Metadata } from "next";
import AdminEditTutorialPage from "../../../../../../_components/AdminEditTutorialPage";

export const metadata: Metadata = {
  title: "Sửa bài hướng dẫn — OriGami",
  description: "Admin/Manager chỉnh sửa nội dung bài hướng dẫn bất kỳ, áp dụng ngay.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditTutorialPage tutorialId={id} />;
}
