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
