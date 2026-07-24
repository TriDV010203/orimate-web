import type { Metadata } from "next";
import JournalPage from "../_components/JournalPage";

export const metadata: Metadata = {
  title: "Nhật ký cá nhân — OriGami",
  description: "Ghi lại hành trình Origami của bạn với nhật ký cá nhân.",
};

export default function Page() {
  return <JournalPage />;
}
