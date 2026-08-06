// Ảnh cover/avatar từ BE đôi khi chỉ là tên file thô (vd "cover2.jpg") thay vì URL hợp lệ,
// khiến next/image throw runtime error. Coi những giá trị đó như không có ảnh.
export function isValidImageUrl(url?: string | null): url is string {
  return !!url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
}

// Khi người dùng chọn avatar là mã màu (thay vì tải ảnh), avatarUrl lưu chuỗi hex vd "#2D6A4F".
// Dùng chung 1 nguồn màu/chữ cái đầu cho mọi nơi hiển thị avatar để đồng bộ với trang Hồ sơ.
export function getAvatarColor(avatarUrl?: string | null): string {
  if (avatarUrl?.startsWith("#")) return avatarUrl;
  return "#2D6A4F";
}

export function getAvatarInitial(displayName?: string | null): string {
  return (displayName?.trim() || "?").charAt(0).toUpperCase();
}

export const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: "Beginner", label: "Dễ" },
  { value: "Intermediate", label: "Trung bình" },
  { value: "Advanced", label: "Khó" },
];

export function diffLabel(d?: string | null): string {
  const l = (d ?? "").toLowerCase();
  if (l === "beginner") return "Dễ";
  if (l === "intermediate") return "Trung bình";
  if (l === "advanced") return "Khó";
  return d ?? "";
}

// `date.toISOString().slice(0, 10)` quy đổi sang UTC trước rồi mới lấy ngày,
// nên từ 00:00–06:59 giờ VN (UTC+7) nó trả về ngày HÔM QUA thay vì hôm nay.
// Dùng hàm này cho mọi input type="date" cần giá trị "hôm nay/ngày X" theo giờ máy người dùng.
export function toLocalDateInputValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
