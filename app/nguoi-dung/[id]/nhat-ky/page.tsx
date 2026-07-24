import type { Metadata } from "next";
import OtherUserJournalPage from "../../../_components/OtherUserJournalPage";

export const metadata: Metadata = {
  title: "Nhật ký công khai — OriGami",
  description: "Xem nhật ký Origami công khai của người dùng này.",
};

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <OtherUserJournalPage userId={id} />;
}
