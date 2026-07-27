import type { Metadata } from "next";
import AdminShopPage from "../../../_components/AdminShopPage";

export const metadata: Metadata = {
  title: "Cửa hàng — Quản trị OriGami",
  description: "Quản lý link affiliate cửa hàng.",
};

export default function Page() {
  return <AdminShopPage />;
}
