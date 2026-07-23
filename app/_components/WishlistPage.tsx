"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorLink from "./AuthorLink";
import { wishlistsApi, type TutorialListItemDto } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

const AUTHOR_COLORS = ["#2D6A4F", "#D4713B", "#2C7DA0", "#9B59B6", "#E03131", "#F59F00", "#1098AD"];
function authorColor(name: string) { return AUTHOR_COLORS[name.charCodeAt(0) % AUTHOR_COLORS.length]; }

function getDiffClass(d?: string | null) {
  if (!d) return "badge-easy";
  const l = d.toLowerCase();
  if (l === "dễ" || l === "easy") return "badge-easy";
  if (l === "trung bình" || l === "medium") return "badge-medium";
  return "badge-hard";
}
function getTypeClass(t: string) { return t?.toLowerCase() === "vip" ? "badge-vip" : "badge-free"; }
function getTypeLabel(t: string) { return t?.toLowerCase() === "free" ? "Miễn phí" : t; }

function formatSavedAt(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", animation: "pulse 1.5s infinite" }}>
      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)" }} />
      <div style={{ padding: "1rem" }}>
        <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "40%", marginBottom: "0.5rem" }} />
        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.375rem" }} />
        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "70%", marginBottom: "0.75rem" }} />
        <div style={{ height: "2rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)" }} />
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [savedAt, setSavedAt] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "free" | "vip">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
      return;
    }
    loadWishlist();
  }, []);

  async function loadWishlist() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken()!;
      const result = await wishlistsApi.getMyWishlist(token, { pageSize: 100 });
      const tutList: TutorialListItemDto[] = [];
      const atMap: Record<string, string> = {};
      for (const item of result.items) {
        if (item.tutorial) {
          tutList.push(item.tutorial);
          atMap[item.tutorial.id] = item.savedAt;
        }
      }
      setTutorials(tutList);
      setSavedAt(atMap);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message ?? "Không thể tải danh sách yêu thích. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = useCallback(async (tutorialId: string) => {
    if (removingId) return;
    setRemovingId(tutorialId);
    try {
      const token = getToken()!;
      await wishlistsApi.toggle(token, tutorialId);
      setTutorials((prev) => prev.filter((t) => t.id !== tutorialId));
      setSavedAt((prev) => { const next = { ...prev }; delete next[tutorialId]; return next; });
    } catch {
      // silent: keep item in list if API fails
    } finally {
      setRemovingId(null);
    }
  }, [removingId]);

  const filtered = tutorials
    .filter((t) => {
      if (filterType === "free") return t.type?.toLowerCase() === "free";
      if (filterType === "vip")  return t.type?.toLowerCase() === "vip";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title, "vi");
      // "recent" — sort by savedAt desc
      const at = (id: string) => new Date(savedAt[id] ?? 0).getTime();
      return at(b.id) - at(a.id);
    });

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
              {loading ? "Đang tải..." : `${filtered.length} bài hướng dẫn đã lưu`}
            </p>
          </div>

          {/* Filters */}
          {!loading && !error && tutorials.length > 0 && (
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
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>{error}</h3>
              <button onClick={loadWishlist} className="btn btn-primary" style={{ marginTop: "1rem" }}>Thử lại</button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {filtered.map((t) => (
                <article key={t.id} className="card" style={{ overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
                  <Link href={t.type === "VIP" ? `/huong-dan/${t.slug}/vip` : `/huong-dan/${t.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                    <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", position: "relative", overflow: "hidden" }}>
                      {t.coverImageUrl
                        ? <img src={t.coverImageUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                        : "📄"
                      }
                      <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
                        <span className={`badge ${getTypeClass(t.type)}`}>{getTypeLabel(t.type)}</span>
                      </div>
                    </div>
                    <div style={{ padding: "1rem 1rem 0.5rem" }}>
                      {savedAt[t.id] && (
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                          🔖 Lưu: {formatSavedAt(savedAt[t.id])}
                        </div>
                      )}
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <AuthorLink authorId={t.author.id} style={{ gap: "0.5rem" }}>
                          <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", background: authorColor(t.author.displayName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                            {t.author.displayName.charAt(0)}
                          </div>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{t.author.displayName}</span>
                        </AuthorLink>
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.stepCount} bước</span>
                      </div>
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        {t.difficulty && <span className={`badge ${getDiffClass(t.difficulty)}`}>{t.difficulty}</span>}
                        <span className="badge badge-category">{t.categoryName}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Action row */}
                  <div style={{ padding: "0.5rem 1rem 1rem", marginTop: "auto", display: "flex", gap: "0.5rem" }}>
                    <Link
                      href={t.type === "VIP" ? `/huong-dan/${t.slug}/vip` : `/huong-dan/${t.slug}`}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: "center", textDecoration: "none", padding: "0.5rem", fontSize: "0.875rem" }}
                    >
                      Xem ngay
                    </Link>
                    <button
                      onClick={() => handleRemove(t.id)}
                      disabled={removingId === t.id}
                      style={{
                        padding: "0.5rem 0.625rem", borderRadius: "var(--radius-md)",
                        border: "1.5px solid var(--color-error)",
                        background: "transparent", color: "var(--color-error)",
                        cursor: removingId === t.id ? "wait" : "pointer",
                        display: "flex", alignItems: "center",
                        opacity: removingId === t.id ? 0.6 : 1,
                        transition: "opacity var(--transition-fast)",
                      }}
                      title="Bỏ lưu"
                    >
                      {removingId === t.id ? (
                        <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty — không có gì sau filter */}
          {!loading && !error && tutorials.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Không có kết quả</h3>
              <button onClick={() => setFilterType("all")} className="btn btn-outline btn-sm">Xóa bộ lọc</button>
            </div>
          )}

          {/* Empty — chưa lưu gì */}
          {!loading && !error && tutorials.length === 0 && (
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
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}
