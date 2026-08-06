"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorLink from "./AuthorLink";
import { tutorialsApi, communityPostsApi, wishlistsApi, type TutorialListItemDto, type CategoryDto } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";

const DIFFICULTIES = ["Tất cả", "Dễ", "Trung bình", "Khó"];
const TYPES = ["Tất cả", "Miễn phí", "VIP"];
const SORTS = [{ label: "Mới nhất", value: "date" }, { label: "Phổ biến nhất", value: "likes" }];
const PAGE_SIZE = 10; // 2 hàng x 5 bài / trang

function mapTypeToBe(type: string): string | undefined {
  if (type === "Miễn phí") return "Free";
  if (type === "VIP") return "VIP";
  return undefined;
}

function mapDifficultyToBe(difficulty: string): string | undefined {
  if (difficulty === "Dễ") return "Beginner";
  if (difficulty === "Trung bình") return "Intermediate";
  if (difficulty === "Khó") return "Advanced";
  return undefined;
}

const AUTHOR_COLORS = ["#2D6A4F", "#D4713B", "#2C7DA0", "#9B59B6", "#E03131", "#F59F00", "#1098AD"];
function authorColor(name: string) { return AUTHOR_COLORS[name.charCodeAt(0) % AUTHOR_COLORS.length]; }

function getDiffClass(d?: string | null) {
  const v = d?.toLowerCase();
  if (v === "dễ" || v === "easy" || v === "beginner") return "badge-easy";
  if (v === "trung bình" || v === "medium" || v === "intermediate") return "badge-medium";
  return "badge-hard";
}
function getDiffLabel(d?: string | null) {
  const v = d?.toLowerCase();
  if (v === "dễ" || v === "easy" || v === "beginner") return "Dễ";
  if (v === "trung bình" || v === "medium" || v === "intermediate") return "Trung bình";
  if (v === "khó" || v === "hard" || v === "advanced") return "Khó";
  return d ?? "";
}
function getTypeClass(t: string) { return t === "VIP" || t === "vip" ? "badge-vip" : "badge-free"; }
function getTypeLabel(t: string) { return t === "Free" ? "Miễn phí" : t; }

interface CardState { isLiked: boolean; likeCount: number; isSaved: boolean; }

export default function LibraryPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState("Tất cả");
  const [type, setType] = useState("Tất cả");
  const [sort, setSort] = useState("date");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  useEffect(() => { setLoggedIn(isLoggedIn()); }, []);

  useEffect(() => {
    tutorialsApi.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const fetchTutorials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = isLoggedIn() ? getToken() ?? undefined : undefined;
      const result = await tutorialsApi.getList({
        search: search.trim() || undefined,
        categoryId: categoryId ?? undefined,
        difficulty: difficulty !== "Tất cả" ? mapDifficultyToBe(difficulty) : undefined,
        type: mapTypeToBe(type),
        sortBy: sort,
        page,
        pageSize: PAGE_SIZE,
      }, token);
      setTutorials(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      // Khởi tạo card states từ BE response
      const states: Record<string, CardState> = {};
      result.items.forEach((t) => {
        states[t.id] = {
          isLiked: t.isLikedByCurrentUser ?? false,
          likeCount: t.likeCount ?? 0,
          isSaved: t.isWishlistedByCurrentUser ?? false,
        };
      });
      setCardStates(states);
    } catch {
      setError("Không thể tải danh sách bài hướng dẫn. Vui lòng thử lại.");
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, difficulty, type, sort, page]);

  useEffect(() => { setPage(1); }, [search, categoryId, difficulty, type, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchTutorials, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchTutorials]);

  const handleLike = useCallback(async (tutorialId: string) => {
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    const token = getToken()!;
    const prev = cardStates[tutorialId] ?? { isLiked: false, likeCount: 0, isSaved: false };
    setCardStates((s) => ({
      ...s,
      [tutorialId]: { ...prev, isLiked: !prev.isLiked, likeCount: prev.likeCount + (prev.isLiked ? -1 : 1) },
    }));
    try {
      const res = await communityPostsApi.toggleLike(token, tutorialId, "Tutorial");
      if (typeof res.isLiked === "boolean") {
        setCardStates((s) => ({ ...s, [tutorialId]: { ...s[tutorialId], isLiked: res.isLiked } }));
      }
    } catch (err) {
      console.error("[like] failed:", err);
      setCardStates((s) => ({ ...s, [tutorialId]: prev }));
    }
  }, [cardStates]);

  const handleSave = useCallback(async (tutorialId: string) => {
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    const token = getToken()!;
    const prev = cardStates[tutorialId] ?? { isLiked: false, likeCount: 0, isSaved: false };
    setCardStates((s) => ({ ...s, [tutorialId]: { ...prev, isSaved: !prev.isSaved } }));
    try {
      await wishlistsApi.toggle(token, tutorialId);
    } catch (err) {
      console.error("[wishlist] failed:", err);
      setCardStates((s) => ({ ...s, [tutorialId]: prev }));
    }
  }, [cardStates]);

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
                <button onClick={() => setCategoryId(null)}
                  style={{ padding: "0.375rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${categoryId === null ? "var(--color-primary)" : "var(--color-border)"}`, background: categoryId === null ? "var(--color-primary)" : "transparent", color: categoryId === null ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "var(--transition-fast)" }}>
                  Tất cả
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setCategoryId(c.id)}
                    style={{ padding: "0.375rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${categoryId === c.id ? "var(--color-primary)" : "var(--color-border)"}`, background: categoryId === c.id ? "var(--color-primary)" : "transparent", color: categoryId === c.id ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "var(--transition-fast)" }}>
                    {c.name}
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
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Result count ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              {loading ? "Đang tải..." : (
                <>Tìm thấy <strong style={{ color: "var(--color-text-primary)" }}>{totalCount}</strong> bài hướng dẫn</>
              )}
            </p>
            {!loggedIn && (
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                <Link href="/dang-nhap" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng nhập</Link> để like và lưu yêu thích
              </p>
            )}
          </div>


          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="tutorials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite" }}>
                  <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)" }} />
                  <div style={{ padding: "1rem" }}>
                    <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.5rem" }} />
                    <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>{error}</h3>
              <button onClick={fetchTutorials} className="btn btn-primary" style={{ marginTop: "1rem" }}>Thử lại</button>
            </div>
          )}

          {/* ── Tutorial Grid ── */}
          {!loading && !error && tutorials.length > 0 && (
            <div className="tutorials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.25rem", marginBottom: "2.5rem" }}>
              {tutorials.map((t) => {
                const cs = cardStates[t.id] ?? { isLiked: false, likeCount: 0, isSaved: false };
                return (
                  <article key={t.id} className="card tutorial-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <Link href={`/huong-dan/${t.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", overflow: "hidden" }}>
                        {isValidImageUrl(t.coverImageUrl)
                          ? <img src={t.coverImageUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                          : "📄"
                        }
                        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", gap: "0.375rem" }}>
                          <span className={`badge ${getTypeClass(t.type)}`}>{getTypeLabel(t.type)}</span>
                        </div>
                      </div>
                      <div style={{ padding: "1rem 1rem 0.5rem" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", lineHeight: 1.4, marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {t.title}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <AuthorLink authorId={t.author.id} authorName={t.author.displayName} style={{ gap: "0.5rem" }}>
                            <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: authorColor(t.author.displayName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                              {t.author.displayName.charAt(0)}
                            </div>
                            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{t.author.displayName}</span>
                          </AuthorLink>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "auto" }}>{t.stepCount} bước</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                          {t.difficulty && <span className={`badge ${getDiffClass(t.difficulty)}`}>{getDiffLabel(t.difficulty)}</span>}
                          <span className="badge badge-category">{t.categoryName}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Action row: like / save / xem */}
                    <div style={{ padding: "0.5rem 1rem 1rem", marginTop: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {/* Like */}
                      <button
                        onClick={() => handleLike(t.id)}
                        title={cs.isLiked ? "Bỏ like" : "Like"}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.3rem",
                          padding: "0.375rem 0.625rem", borderRadius: "var(--radius-sm)",
                          border: `1.5px solid ${cs.isLiked ? "#ef4444" : "var(--color-border)"}`,
                          background: cs.isLiked ? "#FEF2F2" : "transparent",
                          color: cs.isLiked ? "#ef4444" : "var(--color-text-muted)",
                          cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={cs.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {cs.likeCount > 0 && <span>{cs.likeCount}</span>}
                      </button>

                      {/* Save */}
                      <button
                        onClick={() => handleSave(t.id)}
                        title={cs.isSaved ? "Bỏ lưu" : "Lưu yêu thích"}
                        style={{
                          display: "flex", alignItems: "center",
                          padding: "0.375rem 0.5rem", borderRadius: "var(--radius-sm)",
                          border: `1.5px solid ${cs.isSaved ? "var(--color-primary)" : "var(--color-border)"}`,
                          background: cs.isSaved ? "#F0FDF4" : "transparent",
                          color: cs.isSaved ? "var(--color-primary)" : "var(--color-text-muted)",
                          cursor: "pointer", transition: "all var(--transition-fast)",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={cs.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                      </button>

                      {/* Xem */}
                      <Link
                        href={`/huong-dan/${t.slug}`}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: "center", textDecoration: "none", padding: "0.4rem 0.5rem", fontSize: "0.875rem" }}
                      >
                        {t.type === "VIP" ? "🔒 Xem VIP" : "Xem ngay"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && tutorials.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Không tìm thấy kết quả</h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              <button onClick={() => { setCategoryId(null); setDifficulty("Tất cả"); setType("Tất cả"); setSearch(""); }} className="btn btn-outline">Xóa bộ lọc</button>
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: page === 1 ? 0.5 : 1 }}>← Trước</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    style={{ width: "2.25rem", height: "2.25rem", borderRadius: "var(--radius-md)", border: `1.5px solid ${page === pageNum ? "var(--color-primary)" : "var(--color-border)"}`, background: page === pageNum ? "var(--color-primary)" : "transparent", color: page === pageNum ? "white" : "var(--color-text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: page === totalPages ? 0.5 : 1 }}>Sau →</button>
            </div>
          )}

        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}
