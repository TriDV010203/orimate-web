"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostDetailContent } from "./PostDetailPage";

export default function PostDetailModal({ postId }: { postId: string }) {
  const router = useRouter();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => router.back()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", justifyContent: "center", overflowY: "auto", padding: "2.5rem 1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--color-bg)", borderRadius: "var(--radius-xl)", maxWidth: "640px", width: "100%", height: "fit-content", position: "relative" }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Đóng"
          style={{ position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 1, width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "none", background: "var(--color-surface)", boxShadow: "var(--shadow-md)", color: "var(--color-text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", lineHeight: 1 }}
        >
          ×
        </button>
        <div style={{ padding: "1.5rem" }}>
          <PostDetailContent postId={postId} autoFocusComment />
        </div>
      </div>
    </div>
  );
}
