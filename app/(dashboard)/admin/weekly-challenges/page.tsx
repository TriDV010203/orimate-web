import type { Metadata } from "next";
import AdminWeeklyChallengesPage from "../../../_components/AdminWeeklyChallengesPage";

export const metadata: Metadata = {
  title: "Thử thách tuần — Quản trị OriGami",
  description: "Quản lý Thử thách tuần.",
};

export default function Page() {
  return <AdminWeeklyChallengesPage />;
}
