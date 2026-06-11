import type { Metadata } from "next";
import ProfilePage from "../_components/ProfilePage";

export const metadata: Metadata = {
  title: "Quang Minh — Nhà sáng tạo Origami",
  description:
    "Xem hồ sơ, bài hướng dẫn và thành tựu của Quang Minh — một trong những nhà sáng tạo Origami nổi bật nhất trên OriGami.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
