import type { Metadata } from "next";
import VIPSubscribePage from "../../../_components/VIPSubscribePage";

export const metadata: Metadata = {
  title: "Đăng ký VIP — OriGami",
  description: "Đăng ký gói VIP để truy cập toàn bộ hướng dẫn chi tiết từ các creator hàng đầu.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <VIPSubscribePage tutorialSlug={id} />;
}
