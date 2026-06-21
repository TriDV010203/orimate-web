"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SAVED_TUTORIALS = [
  { id: "rong-origami-3d", title: "Rồng Origami 3D huyền thoại", emoji: "🐉", color: "#F0F0FF", category: "Origami 3D", difficulty: "Khó", type: "VIP", steps: 28, views: "8.7K", author: "Quang Minh", authorColor: "#2D6A4F", savedAt: "Hôm nay" },
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật truyền thống", emoji: "🦢", color: "#E8F5E8", category: "Chim", difficulty: "Trung bình", type: "Miễn phí", steps: 15, views: "12.3K", author: "Thu Hương", authorColor: "#D4713B", savedAt: "Hôm qua" },
  { id: "hoa-hong-origami", title: "Hoa hồng Origami lãng mạn", emoji: "🌸", color: "#FFF0F5", category: "Hoa & Thực vật", difficulty: "Trung bình", type: "Miễn phí", steps: 20, views: "9.1K", author: "Thu Hương", authorColor: "#D4713B", savedAt: "3 ngày trước" },
  { id: "ky-lan-giay", title: "Kỳ lân giấy thần thoại", emoji: "🦄", color: "#F5F0FF", category: "Nhân vật", difficulty: "Khó", type: "VIP", steps: 26, views: "6.4K", author: "Quang Minh", authorColor: "#2D6A4F", savedAt: "1 tuần trước" },
  { id: "buom-3d-modular", title: "Bướm 3D Modular nghệ thuật", emoji: "🦋", color: "#FFFBF0", category: "Modular", difficulty: "Trung bình", type: "Miễn phí", steps: 18, views: "6.8K", author: "Hoàng Nam", authorColor: "#2C7DA0", savedAt: "2 tuần trước" },
  { id: "ngoi-sao-modular", title: "Ngôi sao Modular 6 cánh", emoji: "⭐", color: "#FFFDF0", category: "Hình học", difficulty: "Trung bình", type: "Miễn phí", steps: 22, views: "7.3K", author: "Hoàng Nam", authorColor: "#2C7DA0", savedAt: "1 tháng trước" },
];

function getDiffClass(d: string) {
  if (d === "Dễ") return "badge-easy";
  if (d === "Trung bình") return "badge-medium";
  return "badge-hard";
}

export default function WishlistPage() {
  const [filterType, setFilterType] = useState<"all" | "free" | "vip">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [saved, setSaved] = useState(SAVED_TUTORIALS.map((t) => t.id));

  const filtered = SAVED_TUTORIALS
    .filter((t) => saved.includes(t.id))
    .filter((t) => {
      if (filterType === "free") return t.type === "Miễn phí";
      if (filterType === "vip") return t.type === "VIP";
      return true;
    })
    .sort((a, b) => sortBy === "name" ? a.title.localeCompare(b.title) : 0);

  function toggleSave(id: string) {
    setSaved((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
              🔖 Danh sách yêu thích
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              {filtered.length} bài hướng dẫn đã lưu
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {([["all", "Tất cả"], ["free", "Miễn phí"], ["vip", "VIP"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setFilterType(key)}
                  style={{ padding: "0.4rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${filterType === key ? "var(--color-primary)" : "var(--color-border)"}`, background: filterType === key ? "var(--color-primary)" : "transparent", color: filterType === key ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Sắp xếp:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
                style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", fontSize: "0.875rem", background: "var(--color-surface)", cursor: "pointer", outline: "none" }}>
                <option value="recent">Mới lưu nhất</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {filtered.map((t) => (
                <article key={t.id} className="card" style={{ overflow: "hidden", position: "relative" }}>
                  <Link href={t.type === "VIP" ? `/huong-dan/${t.id}/vip` : `/huong-dan/${t.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                    <div style={{ aspectRatio: "4/3", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative" }}>
                      {t.emoji}
                      <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
                        <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`}>{t.type}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>Lưu: {t.savedAt}</div>
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                        <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: t.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", fontWeight: 700, color: "white" }}>{t.author.charAt(0)}</div>
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{t.author}</span>
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.steps} bước</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <span className={`badge ${getDiffClass(t.difficulty)}`}>{t.difficulty}</span>
                        <span className="badge badge-category">{t.category}</span>
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: "0 1rem 1rem", display: "flex", gap: "0.5rem" }}>
                    <Link href={t.type === "VIP" ? `/huong-dan/${t.id}/vip` : `/huong-dan/${t.id}`}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: "center", textDecoration: "none", padding: "0.5rem", fontSize: "0.875rem" }}>
                      Xem ngay
                    </Link>
                    <button onClick={() => toggleSave(t.id)}
                      style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-error)", background: "transparent", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center" }}
                      title="Bỏ lưu">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔖</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Chưa có bài nào được lưu</h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Lưu bài hướng dẫn yêu thích để xem lại sau.</p>
              <Link href="/huong-dan" className="btn btn-primary" style={{ textDecoration: "none" }}>Khám phá thư viện</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
