"use client";
// _components/LearningPathDetailPage.tsx — Trang chi tiết 1 "Lộ trình học"
//
// BẢN THIẾT KẾ TĨNH (mock data only) — chưa nối API.
// Mô phỏng cơ chế mở khoá tuần tự: phải hoàn thành bài trước mới học được bài sau.
// Tiến trình lưu localStorage chỉ để demo cảm giác tương tác, không phải dữ liệu thật.

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { achievementsApi } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import {
  getPathBySlug,
  getCompletedLessonIds,
  setCompletedLessonIds,
  type PathLesson,
} from "./learningPathsData";

function diffColor(d: PathLesson["difficulty"]) {
  if (d === "Dễ") return { bg: "#D1FAE5", text: "#065F46" };
  if (d === "Trung bình") return { bg: "#FEF3C7", text: "#92400E" };
  return { bg: "#FEE2E2", text: "#991B1B" };
}

interface Props { slug: string; }

export default function LearningPathDetailPage({ slug }: Props) {
  const path = getPathBySlug(slug);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!path) return;
    // Baseline: tiến trình lưu local (đủ cho các bài chưa có tutorial thật để đối chiếu).
    setCompleted(getCompletedLessonIds(path.slug));
    setHydrated(true);

    // Đối chiếu với thành tựu thật trên server cho các bài đã có tutorial thật —
    // để dù người dùng hoàn thành bài đó từ trước (qua Thư viện) và chưa từng mở
    // lại trang tutorial kể từ đó, lộ trình vẫn nhận ra là đã xong, không cần làm lại.
    if (!isLoggedIn()) return;
    const token = getToken()!;
    achievementsApi.getMine(token, 1, 100)
      .then((res) => {
        const achievedSlugs = new Set(res.items.map((a) => a.tutorialSlug));
        setCompleted((prev) => {
          const next = new Set(prev);
          let changed = false;
          for (const lesson of path.lessons) {
            if (lesson.tutorialSlug && achievedSlugs.has(lesson.tutorialSlug) && !next.has(lesson.id)) {
              next.add(lesson.id);
              changed = true;
            }
          }
          if (changed) setCompletedLessonIds(path.slug, next);
          return next;
        });
      })
      .catch(() => { /* silent — vẫn còn baseline local để hiển thị */ });
  }, [path]);

  if (!path) {
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

  const total = path.lessons.length;
  const completedCount = path.lessons.filter((l) => completed.has(l.id)).length;
  const pct = Math.round((completedCount / total) * 100);
  const allDone = completedCount === total;

  function toggleLesson(lessonId: string, unlocked: boolean) {
    if (!unlocked) return;
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      setCompletedLessonIds(path!.slug, next);
      return next;
    });
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div style={{ background: path.coverGradient, padding: "2.5rem 0" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>
              <Link href="/lo-trinh" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Lộ trình học</Link>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{path.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "3rem" }}>{path.coverEmoji}</span>
              <div>
                <span style={{ background: "rgba(255,255,255,0.9)", color: path.accentColor, fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                  {path.level}
                </span>
                <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", marginTop: "0.5rem" }}>
                  {path.title}
                </h1>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.65, marginTop: "1rem" }}>
              {path.tagline}
            </p>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "1.25rem", color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>
              <span>📋 {total} bài</span>
              <span>⏱ {path.estimatedTime}</span>
              <span>⭐ {path.rating.toFixed(1)}</span>
              <span>👥 {path.learnerCount.toLocaleString("vi-VN")} người học</span>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "2.5rem 1rem 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2.5rem", alignItems: "start" }}>
            {/* ── LEFT: Trail (path) ───────────────────────────────────────── */}
            <div style={{ position: "relative", paddingLeft: "2rem" }}>
              {/* Connecting line */}
              <div style={{ position: "absolute", left: "1.6875rem", top: "1.75rem", bottom: "1.75rem", width: "3px", background: "var(--color-border)", zIndex: 0 }} />

              {path.lessons.map((lesson, i) => {
                const isCompleted = completed.has(lesson.id);
                const unlocked = i === 0 || completed.has(path.lessons[i - 1].id);
                const dc = diffColor(lesson.difficulty);

                return (
                  <div key={lesson.id} style={{ position: "relative", zIndex: 1, marginBottom: "1.25rem" }}>
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

                      <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{lesson.emoji}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                          Bài {i + 1}: {lesson.title}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: dc.bg, color: dc.text, fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.625rem", borderRadius: "var(--radius-full)" }}>
                            {lesson.difficulty}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>⏱ {lesson.minutes} phút</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end", flexShrink: 0 }}>
                        {lesson.tutorialSlug && unlocked ? (
                          <Link href={`/huong-dan/${lesson.tutorialSlug}`} className="btn btn-primary btn-sm">
                            {isCompleted ? "Xem lại" : "Học ngay"}
                          </Link>
                        ) : (
                          <button
                            className={isCompleted ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"}
                            disabled={!unlocked}
                            onClick={() => toggleLesson(lesson.id, unlocked)}
                            style={!unlocked ? { cursor: "not-allowed" } : undefined}
                          >
                            {!unlocked ? "Đã khoá" : isCompleted ? "Đã hoàn thành" : "Đánh dấu xong"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Completion banner */}
              {hydrated && allDone && (
                <div style={{
                  marginTop: "1.5rem",
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  border: "2px solid #F59E0B",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>{path.rewardBadge.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#92400E", marginBottom: "0.5rem" }}>
                    Chúc mừng! Bạn đã hoàn thành lộ trình
                  </h3>
                  <p style={{ color: "#B45309", fontSize: "0.875rem" }}>
                    Huy hiệu <strong>{path.rewardBadge.title}</strong> đã được ghi nhận vào trang cá nhân của bạn.
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
