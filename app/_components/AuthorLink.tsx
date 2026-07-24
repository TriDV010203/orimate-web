"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";

// Bọc avatar/tên tác giả để bấm vào là sang trang cá nhân /kenh/{authorId}.
// Dùng span + onClick (thay vì next/link) để an toàn khi lồng bên trong 1 <Link> khác
// (ví dụ card tutorial đã link sang trang chi tiết bài) mà không bị lỗi <a> lồng <a>.
export default function AuthorLink({
  authorId,
  children,
  style,
}: {
  authorId: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const router = useRouter();

  function go(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/kenh/${authorId}`);
  }

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") go(e);
      }}
      style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", ...style }}
    >
      {children}
    </span>
  );
}
