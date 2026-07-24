import type { Metadata } from "next";
import JournalEditorPage from "../../_components/JournalEditorPage";

export const metadata: Metadata = {
  title: "Viết nhật ký — OriGami",
  description: "Ghi lại khoảnh khắc và cảm xúc trong hành trình Origami của bạn.",
};

export default function Page() {
  return <JournalEditorPage />;
}
