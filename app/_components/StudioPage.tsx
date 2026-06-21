"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type TutorialStatus = "draft" | "pending" | "published" | "rejected";

const STATUS_META: Record<TutorialStatus, { label: string; color: string; bg: string; icon: string }> = {
  draft:     { label: "Bản nháp",    color: "#555550", bg: "#F5F5F0", icon: "✏️" },
  pending:   { label: "Chờ duyệt",  color: "#D97706", bg: "#FEF3C7", icon: "⏳" },
  published: { label: "Đã xuất bản",color: "#059669", bg: "#D1FAE5", icon: "✅" },
  rejected:  { label: "Từ chối",    color: "#DC2626", bg: "#FEE2E2", icon: "❌" },
};

const TUTORIALS = [
  { id: "studio-1", title: "Rồng Origami 3D huyền thoại", emoji: "🐉", color: "#F0F0FF", category: "Origami 3D", difficulty: "Khó", type: "VIP", steps: 28, status: "published" as TutorialStatus, views: "8.7K", likes: 1203, updatedAt: "21/06/2026" },
  { id: "studio-2", title: "Phượng hoàng thần thoại", emoji: "🦅", color: "#FFF5F0", category: "Chim", difficulty: "Khó", type: "VIP", steps: 30, status: "published" as TutorialStatus, views: "5.2K", likes: 876, updatedAt: "15/06/2026" },
  { id: "studio-3", title: "Kỳ lân giấy thần thoại", emoji: "🦄", color: "#F5F0FF", category: "Nhân vật", difficulty: "Khó", type: "VIP", steps: 26, status: "published" as TutorialStatus, views: "6.4K", likes: 921, updatedAt: "10/06/2026" },
  { id: "studio-4", title: "Sư tử biển Origami", emoji: "🦁", color: "#FFF8F0", category: "Động vật", difficulty: "Trung bình", type: "Miễn phí", steps: 18, status: "pending" as TutorialStatus, views: "—", likes: 0, updatedAt: "20/06/2026" },
  { id: "studio-5", title: "Tôm hùm Origami 3D", emoji: "🦞", color: "#FFF0F0", category: "Biển cả", difficulty: "Khó", type: "VIP", steps: 22, status: "rejected" as TutorialStatus, views: "—", likes: 0, updatedAt: "18/06/2026" },
  { id: "studio-6", title: "Gà trống Origami", emoji: "🐓", color: "#FFF5E0", category: "Chim", difficulty: "Dễ", type: "Miễn phí", steps: 12, status: "draft" as TutorialStatus, views: "—", likes: 0, updatedAt: "19/06/2026" },
  { id: "studio-7", title: "Cua biển modular", emoji: "🦀", color: "#FFEEE0", category: "Biển cả", difficulty: "Trung bình", type: "Miễn phí", steps: 16, status: "draft" as TutorialStatus, views: "—", likes: 0, updatedAt: "17/06/2026" },
];

const CHANNEL_STATS = [
  { label: "Đã xuất bản", value: 3, icon: "✅" },
  { label: "Chờ duyệt", value: 1, icon: "⏳" },
  { label: "Bản nháp", value: 2, icon: "✏️" },
  { label: "Tổng lượt xem", value: "20.3K", icon: "👁" },
  { label: "Tổng lượt thích", value: "3K", icon: "❤️" },
];

type Tab = "all" | TutorialStatus;

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = activeTab === "all" ? TUTORIALS : TUTORIALS.filter((t) => t.status === activeTab);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Studio Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,113,59,0.08)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600 }}>🎬 Creator Studio</span>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Bài hướng dẫn của tôi</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Quản lý và theo dõi tất cả bài hướng dẫn của bạn</p>
            </div>
            <Link href="/studio/moi" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Tạo bài mới
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {CHANNEL_STATS.map((s) => (
              <div key={s.label} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", boxShadow: "var(--shadow-xs)", flex: "1", minWidth: "140px" }}>
                <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "2px solid var(--color-border)", marginBottom: "1.5rem" }}>
            {([
              ["all", "Tất cả"],
              ["published", "Đã xuất bản"],
              ["pending", "Chờ duyệt"],
              ["draft", "Bản nháp"],
              ["rejected", "Từ chối"],
            ] as const).map(([key, label]) => {
              const count = key === "all" ? TUTORIALS.length : TUTORIALS.filter((t) => t.status === key).length;
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{ padding: "0.75rem 1.25rem", border: "none", background: "none", borderBottom: `2.5px solid ${activeTab === key ? "var(--color-primary)" : "transparent"}`, marginBottom: "-2px", color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: activeTab === key ? 700 : 500, fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {label} <span style={{ fontSize: "0.8125rem", opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Tutorial Table */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 120px 100px 100px", gap: "1rem", padding: "0.875rem 1.25rem", background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <span>Bài hướng dẫn</span>
              <span>Danh mục</span>
              <span>Loại</span>
              <span>Trạng thái</span>
              <span>Lượt xem</span>
              <span>Hành động</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
                <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Không có bài nào</p>
                <Link href="/studio/moi" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Tạo bài mới</Link>
              </div>
            ) : (
              filtered.map((t, i) => {
                const meta = STATUS_META[t.status];
                return (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 120px 100px 100px", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none", alignItems: "center" }}>
                    {/* Title */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius-md)", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{t.emoji}</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.steps} bước · Cập nhật {t.updatedAt}</p>
                      </div>
                    </div>

                    {/* Category */}
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{t.category}</span>

                    {/* Type */}
                    <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`} style={{ width: "fit-content" }}>{t.type}</span>

                    {/* Status */}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: meta.bg, color: meta.color, borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600, width: "fit-content" }}>
                      {meta.icon} {meta.label}
                    </span>

                    {/* Views */}
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{t.views}</p>
                      {t.likes > 0 && <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>❤️ {t.likes.toLocaleString()}</p>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <Link href={`/studio/${t.id}`} style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "0.75rem", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Sửa
                      </Link>
                      {t.status === "published" && (
                        <Link href={`/huong-dan/${t.id}`} style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-primary)", background: "transparent", color: "var(--color-primary)", fontSize: "0.75rem", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center" }}>
                          Xem
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rejected reason */}
          {filtered.some((t) => t.status === "rejected") && (
            <div style={{ marginTop: "1.25rem", background: "rgba(220,38,38,0.04)", border: "1.5px solid rgba(220,38,38,0.15)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#DC2626", marginBottom: "0.25rem" }}>Lý do từ chối: Tôm hùm Origami 3D</p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Bài hướng dẫn thiếu ảnh minh họa rõ ràng cho các bước 8-12. Vui lòng bổ sung hình ảnh hoặc video cho các bước này và gửi lại.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          [style*="grid-template-columns: 2fr 1fr 1fr 120px 100px 100px"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
