import type { Metadata } from "next";
import AdminTutorialsPage from "../../../_components/AdminTutorialsPage";

export const metadata: Metadata = {
  title: "Duyệt bài hướng dẫn — OriGami",
  description: "Hàng chờ duyệt bài viết và bản chỉnh sửa cho Manager.",
};

export default function Page() {
  return <AdminTutorialsPage />;
}
