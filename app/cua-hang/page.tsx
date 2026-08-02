import type { Metadata } from "next";
import ShopPage from "../_components/ShopPage";

export const metadata: Metadata = {
  title: "Cửa hàng — OriGami",
  description: "Giấy, kit và sách gấp giấy được đội ngũ OriGami gợi ý, mua trực tiếp tại shop đối tác.",
};

export default function Page() {
  return <ShopPage />;
}
