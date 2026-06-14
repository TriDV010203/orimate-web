import type { Metadata } from "next";
import EditProfilePage from "../../_components/EditProfilePage";

export const metadata: Metadata = {
  title: "Chỉnh sửa hồ sơ",
  description: "Cập nhật thông tin cá nhân, tiểu sử và ảnh đại diện của bạn trên OriGami.",
};

export default function EditProfileRoute() {
  return <EditProfilePage />;
}
