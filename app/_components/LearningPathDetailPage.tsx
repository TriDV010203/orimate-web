"use client";
// _components/LearningPathDetailPage.tsx — Trang chi tiết 1 "Lộ trình học"
//
// Nối API thật: GET /api/learning-paths/{id}. Mô phỏng mở khoá tuần tự (phải hoàn thành
// bài trước mới học được bài sau); tiến trình lưu localStorage (lib/learningPathProgress.ts),
// đối chiếu với Achievement thật khi user đã đăng nhập.

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { learningPathsApi, achievementsApi, type LearningPathDto, type ApiError } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";
import { getCompletedTutorialIds, setCompletedTutorialIds } from "@/lib/learningPathProgress";
import { Loader2 } from "lucide-react";

function diffColor(d: string) {
  const l = d.toLowerCase();
  if (l === "beginner") return { bg: "#D1FAE5", text: "#065F46", label: "Dễ" };
  if (l === "intermediate") return { bg: "#FEF3C7", text: "#92400E", label: "Trung bình" };
  return { bg: "#FEE2E2", text: "#991B1B", label: "Khó" };
}

interface Props { id: string; }

export default function LearningPathDetailPage({ id }: Props) {
  const [path, setPath] = useState<LearningPathDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await learningPathsApi.getById(id);
        if (cancelled) return;
        setPath(res);
      } catch (err) {
        if (cancelled) return;
        if ((err as ApiError).status === 404) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!path) return;
    setCompleted(getCompletedTutorialIds(path.id));
    setHydrated(true);

    // Đối chiếu với thành tựu thật trên server cho các bài đã có achievement từ trước
    // (vd. hoàn thành qua Thư viện trước khi ghé lại trang lộ trình).
    if (!isLoggedIn()) return;
    const token = getToken()!;
    achievementsApi.getMine(token, 1, 100)
      .then((res) => {
        const achievedTutorialIds = new Set(res.items.map((a) => a.tutorialId));
        setCompleted((prev) => {
          const next = new Set(prev);
          let changed = false;
          for (const item of path.items) {
            if (achievedTutorialIds.has(item.tutorialId) && !next.has(item.tutorialId)) {
              next.add(item.tutorialId);
              changed = true;
            }
          }
          if (changed) setCompletedTutorialIds(path.id, next);
          return next;
        });
      })
      .catch(() => { /* silent — vẫn còn baseline local để hiển thị */ });
  }, [path]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 className="animate-spin" size={32} />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !path) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không tìm thấy lộ trình</h1>
            <Link href="/lo-trinh" className="btn btn-primary">← Quay lại danh sách lộ trình</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const total = path.items.length;
  const completedCount = path.items.filter((i) => completed.has(i.tutorialId)).length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allDone = hydrated && total > 0 && completedCount === total;

  function toggleItem(tutorialId: string, unlocked: boolean) {
    if (!unlocked) return;
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(tutorialId)) next.delete(tutorialId);
      else next.add(tutorialId);
      setCompletedTutorialIds(path!.id, next);
      return next;
    });
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div style={{
          background: isValidImageUrl(path.coverImageUrl)
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${path.coverImageUrl}) center/cover`
            : "var(--gradient-primary)",
          padding: "2.5rem 0",
        }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>
              <Link href="/lo-trinh" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Lộ trình học</Link>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{path.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "3rem" }}>🗺️</span>
              <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
                {path.title}
              </h1>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.65, marginTop: "1rem" }}>
              {path.description}
            </p>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "1.25rem", color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>
              <span>📋 {total} bài</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "2.5rem 1rem 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem", alignItems: "start" }}>
            {/* ── LEFT: Trail (path) ───────────────────────────────────────── */}
            <div style={{ position: "relative", paddingLeft: "2rem" }}>
              {/* Connecting line */}
              {total > 0 && (
                <div style={{ position: "absolute", left: "1.6875rem", top: "1.75rem", bottom: "1.75rem", width: "3px", background: "var(--color-border)", zIndex: 0 }} />
              )}

              {path.items.map((item, i) => {
                const isCompleted = completed.has(item.tutorialId);
                const unlocked = i === 0 || completed.has(path.items[i - 1].tutorialId);
                const dc = diffColor(item.tutorialDifficulty);

                return (
                  <div key={item.tutorialId} style={{ position: "relative", zIndex: 1, marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        display: "flex", gap: "1rem", alignItems: "flex-start",
                        background: "var(--color-surface)",
                        border: `2px solid ${isCompleted ? "#059669" : unlocked ? "var(--color-primary)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-lg)",
                        padding: "1.125rem 1.25rem",
                        opacity: unlocked ? 1 : 0.6,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      {/* Node marker (overlaps the line) */}
                      <div
                        style={{
                          position: "absolute", left: "-2rem", top: "1.125rem",
                          width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                          background: isCompleted ? "#059669" : unlocked ? "var(--color-primary)" : "var(--color-surface-2)",
                          border: `2px solid ${isCompleted ? "#059669" : unlocked ? "var(--color-primary)" : "var(--color-border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0,
                        }}
                      >
                        {isCompleted ? "✓" : unlocked ? i + 1 : "🔒"}
                      </div>

                      <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", background: "var(--color-surface-2)", flexShrink: 0, overflow: "hidden" }}>
                        {isValidImageUrl(item.tutorialCoverImageUrl) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.tutorialCoverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                          Bài {i + 1}: {item.tutorialTitle}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: dc.bg, color: dc.text, fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.625rem", borderRadius: "var(--radius-full)" }}>
                            {dc.label}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{item.categoryName}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
                        {unlocked ? (
                          <Link href={`/huong-dan/${item.tutorialSlug}`} className="btn btn-primary btn-sm">
                            {isCompleted ? "Xem lại" : "Học ngay"}
                          </Link>
                        ) : (
                          <button className="btn btn-outline btn-sm" disabled style={{ cursor: "not-allowed" }}>
                            Đã khoá
                          </button>
                        )}
                        {unlocked && (
                          <button
                            className="btn btn-sm"
                            style={{ background: "none", border: "none", color: "var(--color-text-muted)", textDecoration: "underline", padding: 0 }}
                            onClick={() => toggleItem(item.tutorialId, unlocked)}
                          >
                            {isCompleted ? "Bỏ đánh dấu" : "Đánh dấu xong"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {total === 0 && (
                <p style={{ color: "var(--color-text-muted)", padding: "1rem 0" }}>Lộ trình này chưa có bài nào.</p>
              )}

              {/* Completion banner */}
              {allDone && (
                <div style={{
                  marginTop: "1.5rem",
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  border: "2px solid #F59E0B",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏆</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#92400E", marginBottom: "0.5rem" }}>
                    Chúc mừng! Bạn đã hoàn thành lộ trình
                  </h3>
                  <p style={{ color: "#B45309", fontSize: "0.875rem" }}>
                    Bạn đã học hết {total} bài trong lộ trình &quot;{path.title}&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar ───────────────────────────────────────────── */}
            <div style={{ position: "sticky", top: "5.5rem" }}>
              <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Tiến trình</h3>
                  <span style={{ fontWeight: 800, fontSize: "1.25rem", color: pct === 100 ? "#059669" : "var(--color-primary)" }}>{pct}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", overflow: "hidden", marginBottom: "0.75rem" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "linear-gradient(to right, #059669, #10B981)" : "var(--gradient-primary)", borderRadius: "var(--radius-full)" }} />
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{completedCount} / {total} bài đã hoàn thành</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
