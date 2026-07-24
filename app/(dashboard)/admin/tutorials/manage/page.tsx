import type { Metadata } from "next";
import AdminManageTutorialsPage from "../../../../_components/AdminManageTutorialsPage";

export const metadata: Metadata = {
  title: "Quản lý hướng dẫn — OriGami",
  description: "Danh sách toàn bộ bài hướng dẫn, sửa lại bất cứ lúc nào dù đã xuất bản.",
};

export default function Page() {
  return <AdminManageTutorialsPage />;
}
