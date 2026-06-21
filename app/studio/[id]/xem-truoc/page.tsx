import type { Metadata } from "next";
import TutorialPreviewStudioPage from "../../../_components/TutorialPreviewStudioPage";

export const metadata: Metadata = {
  title: "Xem trước bài hướng dẫn — Creator Studio",
  description: "Xem trước bài hướng dẫn trước khi gửi để duyệt.",
};

export default function Page() {
  return <TutorialPreviewStudioPage />;
}
