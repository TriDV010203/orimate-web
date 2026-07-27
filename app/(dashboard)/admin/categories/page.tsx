import type { Metadata } from "next";
import AdminCategoriesPage from "../../../_components/AdminCategoriesPage";

export const metadata: Metadata = {
  title: "Danh mục — OriGami",
  description: "Quản lý danh mục hướng dẫn trên nền tảng.",
};

export default function Page() {
  return <AdminCategoriesPage />;
}
