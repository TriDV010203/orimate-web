import type { Metadata } from "next";
import AdminUsersPage from "../../../_components/AdminUsersPage";

export const metadata: Metadata = {
  title: "Quản lý người dùng — OriGami",
  description: "Quản lý tài khoản, phân quyền và trạng thái thành viên.",
};

export default function Page() {
  return <AdminUsersPage />;
}
