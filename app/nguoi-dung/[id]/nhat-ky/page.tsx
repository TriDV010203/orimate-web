import type { Metadata } from "next";
import OtherUserJournalPage from "../../../_components/OtherUserJournalPage";

export const metadata: Metadata = {
  title: "Nhật ký công khai — OriGami",
  description: "Xem nhật ký Origami công khai của người dùng này.",
};

export default function Page() {
  return <OtherUserJournalPage />;
}
