// Ảnh cover/avatar từ BE đôi khi chỉ là tên file thô (vd "cover2.jpg") thay vì URL hợp lệ,
// khiến next/image throw runtime error. Coi những giá trị đó như không có ảnh.
export function isValidImageUrl(url?: string | null): url is string {
  return !!url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
}
