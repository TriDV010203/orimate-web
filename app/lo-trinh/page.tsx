import type { Metadata } from "next";
import { Suspense } from "react";
import LearningPathsPage from "../_components/LearningPathsPage";

export const metadata: Metadata = {
  title: "Lộ trình học gấp giấy — OriGami",
  description: "Đi theo lộ trình học gấp giấy được đội ngũ OriGami chọn lọc, từ cơ bản đến nâng cao.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LearningPathsPage />
    </Suspense>
  );
}
