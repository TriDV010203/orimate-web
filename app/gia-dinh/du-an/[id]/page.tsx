import type { Metadata } from "next";
import ProjectWorkboardPage from "../../../_components/ProjectWorkboardPage";

export const metadata: Metadata = {
  title: "Bảng dự án gia đình — OriGami",
  description: "Theo dõi tiến độ và hoàn thành các bước trong dự án Origami gia đình.",
};

export default function Page() {
  return <ProjectWorkboardPage />;
}
