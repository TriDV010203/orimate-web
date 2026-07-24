import type { Metadata } from "next";
import TutorialEditorPage from "../../_components/TutorialEditorPage";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài hướng dẫn — Creator Studio",
  description: "Tạo và chỉnh sửa bài hướng dẫn Origami trong Creator Studio.",
};

export default function Page() {
  return <TutorialEditorPage />;
}
