import type { Metadata } from "next";
import ProfilePage from "../_components/ProfilePage";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi — OriMate",
  description: "Xem và chỉnh sửa hồ sơ cá nhân, thành tựu Origami của bạn trên OriMate.",
};

export default function ProfileRoute() {
  return <ProfilePage />;
}
