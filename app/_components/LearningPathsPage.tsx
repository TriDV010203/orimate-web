"use client";
// _components/LearningPathsPage.tsx — Trang danh sách "Lộ trình học gấp giấy"
//
// BẢN THIẾT KẾ TĨNH (mock data only) — chưa nối API.
// Mục tiêu: cho xem trước layout/UX của tính năng "Lộ trình" (do admin/manager
// biên soạn từ chính bài hướng dẫn của họ, xếp thứ tự cố định) trước khi có BE thật.
// Tiến trình được lưu tạm ở localStorage để demo cảm giác "học tiếp", không đại diện
// cho dữ liệu thật.

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { LEARNING_PATHS, getPathProgress } from "./learningPathsData";

export default function LearningPathsPage() {
  const [progressByPath, setProgressByPath] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = {};
    for (const p of LEARNING_PATHS) next[p.slug] = getPathProgress(p).percent;
    setProgressByPath(next);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--gradient-primary)", padding: "3.5rem 0 3rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, fontSize: "8rem", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "2rem", pointerEvents: "none" }}>
            🗺️
          </div>
          <div className="container" style={{ position: "relative" }}>
            <div style={{ maxWidth: "640px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>🗺️ Lộ trình học</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "white", background: "var(--gradient-accent)", padding: "0.0625rem 0.5rem", borderRadius: "var(--radius-full)" }}>Mới</span>
              </div>
              <h1 className="text-display" style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "white", marginBottom: "0.75rem" }}>
                Đi từ tay mơ đến nghệ nhân gấp giấy
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "0.5rem" }}>
                Mỗi lộ trình là một chuỗi bài hướng dẫn được đội ngũ OriGami chọn lọc và sắp xếp theo đúng thứ tự dễ → khó — bạn chỉ cần đi theo, không cần tự mò mẫm nên học gì trước.
              </p>
            </div>

            {/* Social proof strip */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1.75rem" }}>
              {[
                { value: "12.4K", label: "người đã tham gia lộ trình" },
                { value: "94%", label: "hoàn thành bài đầu tiên" },
                { value: "4.8/5", label: "đánh giá trung bình" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>{s.value}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          {/* ── Path cards ───────────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
            {LEARNING_PATHS.map((path) => {
              const pct = progressByPath[path.slug] ?? 0;
              const started = pct > 0;
              return (
                <article
                  key={path.slug}
                  className="card"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column", border: "1.5px solid var(--color-border)" }}
                >
                  {/* Cover */}
                  <div style={{ background: path.coverGradient, padding: "1.75rem 1.5rem", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "2.5rem" }}>{path.coverEmoji}</span>
                      <span style={{ background: "rgba(255,255,255,0.9)", color: path.accentColor, fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                        {path.level}
                      </span>
                    </div>
                    <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.3125rem", marginTop: "1rem", lineHeight: 1.3 }}>
                      {path.title}
                    </h2>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1rem" }}>
                      {path.tagline}
                    </p>

                    <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                      <Meta icon="📋" text={`${path.lessons.length} bài`} />
                      <Meta icon="⏱" text={path.estimatedTime} />
                      <Meta icon="⭐" text={`${path.rating.toFixed(1)}`} />
                      <Meta icon="👥" text={`${path.learnerCount.toLocaleString("vi-VN")} người học`} />
                    </div>

                    {/* Reward teaser */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", padding: "0.625rem 0.875rem", marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{path.rewardBadge.icon}</span>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        Hoàn thành để nhận huy hiệu <strong style={{ color: "var(--color-text-primary)" }}>{path.rewardBadge.title}</strong>
                      </span>
                    </div>

                    {/* Progress */}
                    {started && (
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)" }}>Tiến trình</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>{pct}%</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "var(--gradient-primary)", borderRadius: "var(--radius-full)" }} />
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/lo-trinh/${path.slug}`}
                      className="btn btn-primary"
                      style={{ marginTop: "auto", justifyContent: "center" }}
                    >
                      {started ? (pct === 100 ? "🏆 Xem lại lộ trình" : "Tiếp tục học") : "Bắt đầu lộ trình"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ── How it works ─────────────────────────────────────────────────── */}
          <section style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem", marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "1.5rem", textAlign: "center" }}>
              Lộ trình hoạt động như thế nào?
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              {[
                { icon: "📍", title: "Chọn lộ trình phù hợp", desc: "Theo đúng trình độ hiện tại của bạn — Cơ bản hoặc Nâng cao." },
                { icon: "🔓", title: "Học tuần tự, mở khoá dần", desc: "Hoàn thành bài trước để mở bài tiếp theo — không bị rối vì học nhảy cóc." },
                { icon: "🏅", title: "Nhận huy hiệu khi hoàn thành", desc: "Ghi nhận thành tích trên trang cá nhân, khoe với cộng đồng." },
              ].map((s) => (
                <div key={s.title} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>{s.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
      <span>{icon}</span>{text}
    </span>
  );
}
