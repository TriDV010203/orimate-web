// app/huong-dan/[id]/page.tsx — Route động: /huong-dan/[slug]
// Next.js App Router: [id] là dynamic segment (dùng slug của tutorial)
// Toàn bộ UI được tách sang _components/TutorialDetailPage.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import TutorialDetailPage from "../../_components/TutorialDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

// SEO metadata động cho trang chi tiết hướng dẫn
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Hướng dẫn gấp giấy | OriGami`,
    description: `Xem hướng dẫn gấp giấy Origami chi tiết từng bước tại OriGami. Slug: ${id}`,
    openGraph: {
      title: `Hướng dẫn Origami — OriGami`,
      description: "Học nghệ thuật gấp giấy Origami qua các bước hướng dẫn chi tiết.",
      type: "article",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <TutorialDetailPage slug={id} />
    </Suspense>
  );
}
