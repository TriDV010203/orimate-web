"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AdBanner from "./AdBanner";

const CATEGORIES = ["Tất cả", "Động vật", "Hoa & Thực vật", "Chim", "Origami 3D", "Modular", "Hình học", "Nhân vật", "Biển cả", "Thiên nhiên"];
const DIFFICULTIES = ["Tất cả", "Dễ", "Trung bình", "Khó"];
const TYPES = ["Tất cả", "Miễn phí", "VIP"];
const SORTS = ["Phổ biến nhất", "Mới nhất", "Đánh giá cao", "Nhiều bước nhất"];

const TUTORIALS = [
  { id: "rong-origami-3d", title: "Rồng Origami 3D huyền thoại", emoji: "🐉", color: "#F0F0FF", category: "Origami 3D", difficulty: "Khó", type: "VIP", steps: 28, views: "8.7K", likes: 1203, rating: 4.9, author: "Quang Minh", authorColor: "#2D6A4F" },
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật truyền thống", emoji: "🦢", color: "#E8F5E8", category: "Chim", difficulty: "Trung bình", type: "Miễn phí", steps: 15, views: "12.3K", likes: 2841, rating: 4.8, author: "Thu Hương", authorColor: "#D4713B" },
  { id: "hoa-hong-origami", title: "Hoa hồng Origami lãng mạn", emoji: "🌸", color: "#FFF0F5", category: "Hoa & Thực vật", difficulty: "Trung bình", type: "Miễn phí", steps: 20, views: "9.1K", likes: 1876, rating: 4.7, author: "Thu Hương", authorColor: "#D4713B" },
  { id: "ca-koi-don-gian", title: "Cá koi đơn giản cho trẻ em", emoji: "🐟", color: "#F0F8FF", category: "Biển cả", difficulty: "Dễ", type: "Miễn phí", steps: 10, views: "15.2K", likes: 3210, rating: 4.6, author: "Lan Anh", authorColor: "#9B59B6" },
  { id: "phuong-hoang-huyen-thoai", title: "Phượng hoàng huyền thoại", emoji: "🦅", color: "#FFF5F0", category: "Chim", difficulty: "Khó", type: "VIP", steps: 30, views: "5.2K", likes: 876, rating: 4.9, author: "Quang Minh", authorColor: "#2D6A4F" },
  { id: "buom-3d-modular", title: "Bướm 3D Modular nghệ thuật", emoji: "🦋", color: "#FFFBF0", category: "Modular", difficulty: "Trung bình", type: "Miễn phí", steps: 18, views: "6.8K", likes: 1120, rating: 4.7, author: "Hoàng Nam", authorColor: "#2C7DA0" },
  { id: "ky-lan-giay", title: "Kỳ lân giấy thần thoại", emoji: "🦄", color: "#F5F0FF", category: "Nhân vật", difficulty: "Khó", type: "VIP", steps: 26, views: "6.4K", likes: 921, rating: 4.8, author: "Quang Minh", authorColor: "#2D6A4F" },
  { id: "tho-origami", title: "Thỏ Origami dễ thương", emoji: "🐰", color: "#FFF0F0", category: "Động vật", difficulty: "Dễ", type: "Miễn phí", steps: 12, views: "11.4K", likes: 2456, rating: 4.5, author: "Lan Anh", authorColor: "#9B59B6" },
  { id: "ngoi-sao-modular", title: "Ngôi sao Modular 6 cánh", emoji: "⭐", color: "#FFFDF0", category: "Hình học", difficulty: "Trung bình", type: "Miễn phí", steps: 22, views: "7.3K", likes: 1340, rating: 4.6, author: "Hoàng Nam", authorColor: "#2C7DA0" },
  { id: "sua-den-bien-sau", title: "Sứa biển đại dương", emoji: "🪼", color: "#E0F7FA", category: "Biển cả", difficulty: "Trung bình", type: "VIP", steps: 16, views: "3.8K", likes: 678, rating: 4.7, author: "Thu Hương", authorColor: "#D4713B" },
  { id: "cuoi-rong-giay", title: "Tháp rồng giấy modular", emoji: "🏯", color: "#F0F4FF", category: "Modular", difficulty: "Khó", type: "VIP", steps: 35, views: "2.9K", likes: 567, rating: 4.9, author: "Hoàng Nam", authorColor: "#2C7DA0" },
  { id: "sen-trang-thien-nhien", title: "Hoa sen trắng thanh khiết", emoji: "🪷", color: "#F5FCFF", category: "Hoa & Thực vật", difficulty: "Dễ", type: "Miễn phí", steps: 9, views: "18.6K", likes: 4102, rating: 4.4, author: "Lan Anh", authorColor: "#9B59B6" },
];

function getDiffClass(d: string) {
  if (d === "Dễ") return "badge-easy";
  if (d === "Trung bình") return "badge-medium";
  return "badge-hard";
}
function getTypeClass(t: string) {
  return t === "VIP" ? "badge-vip" : "badge-free";
}

export default function LibraryPage() {
  const [category, setCategory] = useState("Tất cả");
  const [difficulty, setDifficulty] = useState("Tất cả");
  const [type, setType] = useState("Tất cả");
  const [sort, setSort] = useState("Phổ biến nhất");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return TUTORIALS.filter((t) => {
      if (category !== "Tất cả" && t.category !== category) return false;
      if (difficulty !== "Tất cả" && t.difficulty !== difficulty) return false;
      if (type !== "Tất cả" && t.type !== type) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, difficulty, type, search]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

        {/* ── Hero Banner ── */}
        <section style={{ background: "var(--gradient-primary)", padding: "3rem 0 2.5rem" }}>
          <div className="container">
            <div style={{ maxWidth: "680px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>📚 Thư viện hướng dẫn</span>
              </div>
              <h1 className="text-display" style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "white", marginBottom: "0.75rem" }}>
                Khám phá hàng nghìn bài hướng dẫn Origami
              </h1>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Từ người mới bắt đầu đến chuyên gia — tìm bài hướng dẫn phù hợp với bạn.
              </p>
              {/* Search */}
              <div style={{ position: "relative", maxWidth: "480px" }}>
                <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm bài hướng dẫn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "0.875rem 1rem 0.875rem 2.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: "white", fontSize: "0.9375rem", outline: "none", backdropFilter: "blur(8px)" }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>

          {/* ── Filters ── */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem 1.5rem", marginBottom: "2rem", boxShadow: "var(--shadow-sm)" }}>

            {/* Category */}
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", marginRight: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Danh mục</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding: "0.375rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${category === c ? "var(--color-primary)" : "var(--color-border)"}`, background: category === c ? "var(--color-primary)" : "transparent", color: category === c ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "var(--transition-fast)" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
              {/* Difficulty */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Độ khó</span>
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    style={{ padding: "0.3rem 0.875rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${difficulty === d ? "var(--color-accent)" : "var(--color-border)"}`, background: difficulty === d ? "var(--color-accent)" : "transparent", color: difficulty === d ? "white" : "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}>
                    {d}
                  </button>
                ))}
              </div>

              {/* Type */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Loại</span>
                {TYPES.map((tp) => (
                  <button key={tp} onClick={() => setType(tp)}
                    style={{ padding: "0.3rem 0.875rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${type === tp ? "var(--color-info)" : "var(--color-border)"}`, background: type === tp ? "var(--color-info)" : "transparent", color: type === tp ? "white" : "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }}>
                    {tp}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" /></svg>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", fontSize: "0.875rem", color: "var(--color-text-primary)", background: "var(--color-surface)", cursor: "pointer", outline: "none" }}>
                  {SORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Result count ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              Tìm thấy <strong style={{ color: "var(--color-text-primary)" }}>{filtered.length}</strong> bài hướng dẫn
            </p>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button style={{ padding: "0.375rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-primary)", background: "var(--color-primary)", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              </button>
              <button style={{ padding: "0.375rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--color-text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              </button>
            </div>
          </div>

          {/* ── Ad Banner ── */}
          <div style={{ marginBottom: "2rem" }}>
            <AdBanner size="leaderboard" slotId="library-leaderboard" />
          </div>

          {/* ── Tutorial Grid ── */}
          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {filtered.map((t) => (
                <article key={t.id} className="card tutorial-card" style={{ overflow: "hidden" }}>
                  <Link href={`/huong-dan/${t.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                    <div style={{ aspectRatio: "4/3", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", overflow: "hidden" }}>
                      {t.emoji}
                      <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", gap: "0.375rem" }}>
                        <span className={`badge ${getTypeClass(t.type)}`}>{t.type}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", lineHeight: 1.4, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                        <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: t.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                          {t.author.charAt(0)}
                        </div>
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{t.author}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>{t.steps} bước</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                        <span className={`badge ${getDiffClass(t.difficulty)}`}>{t.difficulty}</span>
                        <span className="badge badge-category">{t.category}</span>
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          ⭐ {t.rating}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>👁 {t.views}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>❤️ {t.likes.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: "0 1rem 1rem" }}>
                    <Link href={t.type === "VIP" ? `/huong-dan/${t.id}/vip` : `/huong-dan/${t.id}`}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", textDecoration: "none", padding: "0.5rem" }}>
                      {t.type === "VIP" ? "🔒 Xem VIP" : "Xem ngay"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Không tìm thấy kết quả</h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              <button onClick={() => { setCategory("Tất cả"); setDifficulty("Tất cả"); setType("Tất cả"); setSearch(""); }} className="btn btn-outline">Xóa bộ lọc</button>
            </div>
          )}

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
              <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>← Trước</button>
              {[1, 2, 3].map((p) => (
                <button key={p} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "var(--radius-md)", border: `1.5px solid ${p === 1 ? "var(--color-primary)" : "var(--color-border)"}`, background: p === 1 ? "var(--color-primary)" : "transparent", color: p === 1 ? "white" : "var(--color-text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>{p}</button>
              ))}
              <span style={{ color: "var(--color-text-muted)" }}>...</span>
              <button style={{ width: "2.25rem", height: "2.25rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>12</button>
              <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Sau →</button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
