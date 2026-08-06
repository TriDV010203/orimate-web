import type { Metadata } from "next";
import AdminTutorialReviewPage from "@/app/_components/AdminTutorialReviewPage";

export const metadata: Metadata = {
  title: "Xét duyệt bài hướng dẫn — OriGami",
  description: "Xem chi tiết và xét duyệt bài hướng dẫn đang chờ phê duyệt.",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTutorialReviewPage tutorialId={id} />;
}
