// app/lo-trinh/[slug]/page.tsx — Route động: /lo-trinh/[slug]
// Toàn bộ UI được tách sang _components/LearningPathDetailPage.tsx

import type { Metadata } from "next";
import LearningPathDetailPage from "../../_components/LearningPathDetailPage";
import { getPathBySlug } from "../../_components/learningPathsData";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  return {
    title: path ? `${path.title} — Lộ trình OriGami` : "Lộ trình học — OriGami",
    description: path?.tagline ?? "Lộ trình học gấp giấy OriGami.",
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <LearningPathDetailPage slug={slug} />;
}
