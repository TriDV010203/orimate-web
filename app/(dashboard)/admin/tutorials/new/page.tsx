import type { Metadata } from "next";
import AdminCreateTutorialPage from "../../../../_components/AdminCreateTutorialPage";

export const metadata: Metadata = {
  title: "Tạo bài hướng dẫn — OriGami",
  description: "Admin/Manager viết và đăng bài hướng dẫn trực tiếp, miễn phí, không cần duyệt.",
};

export default function Page() {
  return <AdminCreateTutorialPage />;
}
