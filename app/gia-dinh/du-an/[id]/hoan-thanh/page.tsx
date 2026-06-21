import type { Metadata } from "next";
import ProjectCompletionPage from "../../../../_components/ProjectCompletionPage";

export const metadata: Metadata = {
  title: "Hoàn thành dự án — OriGami Gia đình",
  description: "Đánh dấu hoàn thành dự án gia đình và chia sẻ kỷ niệm.",
};

export default function Page() {
  return <ProjectCompletionPage />;
}
