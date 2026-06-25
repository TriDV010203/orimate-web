"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { journalsApi, type JournalDto } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

const MOODS = ["😊", "😌", "🤔", "😤", "🎉", "💪", "😴", "🌟"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function moodForEntry(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xff;
  return MOODS[h % MOODS.length];
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchJournals = useCallback(async (pageNum: number, append = false) => {
    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await journalsApi.getMyJournals(token, { page: pageNum, pageSize: 10 });
      setEntries((prev) => append ? [...prev, ...result.items] : result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch {
      setError("Không thể tải nhật ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/dang-nhap"); return; }
    fetchJournals(1);
  }, [fetchJournals, router]);

  async function handleDelete(id: string) {
    const token = getToken();
    if (!token) return;
    if (!confirm("Bạn có chắc muốn xóa nhật ký này không?")) return;
    setDeleting(id);
    try {
      await journalsApi.deleteJournal(token, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((c) => c - 1);
    } catch {
      alert("Không thể xóa nhật ký. Vui lòng thử lại.");
    } finally {
      setDeleting(null);
    }
  }

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchJournals(next, true);
  }

  const filtered = showPublicOnly ? entries.filter((e) => e.isPublic) : entries;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                📔 Nhật ký cá nhân
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
                {loading ? "Đang tải..." : `${totalCount} bài nhật ký của bạn`}
              </p>
            </div>
            <Link href="/nhat-ky/chinh-sua" className="btn btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Viết nhật ký
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Sidebar */}
            <aside>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>⚙️ Hiển thị</h3>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <div onClick={() => setShowPublicOnly((v) => !v)}
                    style={{ width: "2.5rem", height: "1.375rem", borderRadius: "var(--radius-full)", background: showPublicOnly ? "var(--color-primary)" : "var(--color-border)", position: "relative", transition: "var(--transition-normal)", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "2px", left: showPublicOnly ? "calc(100% - 1.125rem)" : "2px", width: "1rem", height: "1rem", borderRadius: "50%", background: "white", transition: "var(--transition-normal)", boxShadow: "var(--shadow-xs)" }} />
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Chỉ công khai</span>
                </label>
              </div>
            </aside>

            {/* Entries */}
            <div>
              {/* Error */}
              {error && (
                <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1.25rem", color: "var(--color-error)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {error}
                  <button onClick={() => fetchJournals(1)} style={{ background: "none", border: "1px solid currentColor", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", cursor: "pointer", color: "var(--color-error)", fontSize: "0.8125rem" }}>Thử lại</button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", animation: "pulse 1.5s ease-in-out infinite", display: "flex", gap: "1.25rem" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.5rem", width: "60%" }} />
                        <div style={{ height: "3rem", background: "var(--color-surface-2)", borderRadius: "4px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty */}
              {!loading && filtered.length === 0 && !error && (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📔</div>
                  <h3 style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Chưa có nhật ký nào</h3>
                  <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Bắt đầu ghi lại hành trình Origami của bạn ngay hôm nay!</p>
                  <Link href="/nhat-ky/chinh-sua" className="btn btn-primary" style={{ textDecoration: "none" }}>Viết nhật ký đầu tiên</Link>
                </div>
              )}

              {/* Entry list */}
              {!loading && filtered.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {filtered.map((entry) => (
                    <article key={entry.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ display: "flex", gap: "1.25rem", padding: "1.5rem" }}>
                        {/* Mood / date */}
                        <div style={{ flexShrink: 0, textAlign: "center", width: "3.5rem" }}>
                          <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{moodForEntry(entry.id)}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginTop: "0.375rem", lineHeight: 1.3 }}>{formatDate(entry.createdAt)}</div>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Privacy badge */}
                          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                            {entry.isPublic ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(45,106,79,0.08)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                                🌍 Công khai
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "var(--color-surface-2)", color: "var(--color-text-muted)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                                🔒 Riêng tư
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {entry.content}
                          </p>

                          {entry.linkedTutorialSlug && entry.linkedTutorialTitle && (
                            <Link href={`/huong-dan/${entry.linkedTutorialSlug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", textDecoration: "none", fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500, marginBottom: "0.75rem" }}>
                              📌 {entry.linkedTutorialTitle}
                            </Link>
                          )}

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                              <Link href={`/nhat-ky/chinh-sua?id=${entry.id}`} style={{ padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.8125rem", color: "var(--color-text-secondary)", textDecoration: "none", fontWeight: 500 }}>Sửa</Link>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                disabled={deleting === entry.id}
                                style={{ padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid rgba(192,57,43,0.3)", fontSize: "0.8125rem", color: "var(--color-error)", background: "none", cursor: "pointer", fontWeight: 500, opacity: deleting === entry.id ? 0.6 : 1 }}>
                                {deleting === entry.id ? "Đang xóa..." : "Xóa"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Image */}
                        {entry.imageUrls.length > 0 ? (
                          <img src={entry.imageUrls[0]} alt="" style={{ width: "5rem", height: "5rem", borderRadius: "var(--radius-lg)", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "5rem", height: "5rem", borderRadius: "var(--radius-lg)", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", flexShrink: 0 }}>
                            📔
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Load more */}
              {!loading && page < totalPages && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                  <button onClick={handleLoadMore} disabled={loadingMore} className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
          .container > div:last-child > aside { display: none; }
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}
