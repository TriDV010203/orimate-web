import type { Metadata } from "next";
import AdminReportsPage from "../../../_components/AdminReportsPage";

export const metadata: Metadata = {
  title: "Báo cáo vi phạm — OriGami",
  description: "Xử lý các báo cáo vi phạm từ cộng đồng.",
};

export default function Page() {
  return <AdminReportsPage />;
}
