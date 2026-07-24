import type { Metadata } from "next";
import StudioPage from "../_components/StudioPage";

export const metadata: Metadata = {
  title: "Creator Studio — OriGami",
  description: "Quản lý và tạo bài hướng dẫn Origami của bạn trong Creator Studio.",
};

export default function Page() {
  return <StudioPage />;
}
