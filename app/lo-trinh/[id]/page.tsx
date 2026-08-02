// app/lo-trinh/[id]/page.tsx — Route động: /lo-trinh/[id]
// Toàn bộ UI được tách sang _components/LearningPathDetailPage.tsx

import type { Metadata } from "next";
import LearningPathDetailPage from "../../_components/LearningPathDetailPage";
import { learningPathsApi } from "@/lib/api/learning-paths";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const path = await learningPathsApi.getById(id);
    return {
      title: `${path.title} — Lộ trình OriGami`,
      description: path.description,
    };
  } catch {
    return {
      title: "Lộ trình học — OriGami",
      description: "Lộ trình học gấp giấy OriGami.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <LearningPathDetailPage id={id} />;
}
