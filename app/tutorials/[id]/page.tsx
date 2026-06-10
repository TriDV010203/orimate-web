// app/tutorials/[id]/page.tsx — Route động: /tutorials/1, /tutorials/2, ...
// Next.js App Router: [id] là dynamic segment
// Toàn bộ UI được tách sang _components/TutorialDetailPage.tsx

import type { Metadata } from "next";
import TutorialDetailPage from "../../_components/TutorialDetailPage";

// SEO metadata cho trang chi tiết hướng dẫn
export const metadata: Metadata = {
  title: "Hạc giấy truyền thống | OriGami",
  description:
    "Học cách gấp hạc giấy truyền thống Nhật Bản chỉ với 8 bước đơn giản. Phù hợp cho người mới bắt đầu. Miễn phí hoàn toàn.",
  openGraph: {
    title: "Hạc giấy truyền thống — Origami 8 bước dễ làm",
    description: "Gấp hạc giấy biểu tượng may mắn của Nhật Bản. Hướng dẫn chi tiết từng bước.",
    type: "article",
  },
};

export default function Page() {
  return <TutorialDetailPage />;
}
