"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getToken } from "@/lib/auth";
import { achievementsApi, AchievementDto, CreateAchievementRequest } from "@/lib/api/achievements";
import { tutorialsApi, TutorialListItemDto } from "@/lib/api/tutorials";

// ── Helper functions ─────────────────────────────────────────────────────────
const BG_COLORS = ["#F0F0FF", "#FFF5F0", "#E8F5E8", "#FFF0F5", "#FFFBF0", "#F5FFF5", "#F0F8FF", "#FFF8F0"];

function bgColorFromId(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BG_COLORS[hash % BG_COLORS.length];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getTimeAgo(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

// ── Achievement interface (matches BE data) ──────────────────────────────────
interface Achievement {
  id: string;
  tutorialId: string;
  tutorialTitle: string;
  tutorialSlug: string;
  note: string;
  photoUrl: string | null;
  bgColor: string;
  isPublic: boolean;
  createdAt: string;
  date: string;
  timeAgo: string;
}

function mapDto(dto: AchievementDto): Achievement {
  return {
    id: dto.id,
    tutorialId: dto.tutorialId,
    tutorialTitle: dto.tutorialTitle,
    tutorialSlug: dto.tutorialSlug,
    note: dto.note ?? "",
    photoUrl: dto.photoUrl ?? null,
    bgColor: bgColorFromId(dto.id),
    isPublic: dto.isPublic,
    createdAt: dto.createdAt,
    date: formatDate(dto.createdAt),
    timeAgo: getTimeAgo(dto.createdAt),
  };
}

// ── Static gamification badges ───────────────────────────────────────────────
const ACHIEVEMENT_BADGES = [
  { icon: "🏆", title: "Creator Top 10", desc: "Nằm trong top 10 nhà sáng tạo", earned: false },
  { icon: "🔥", title: "Streak 30 ngày", desc: "Hoạt động liên tục 30 ngày", earned: false },
  { icon: "⭐", title: "1000 Followers", desc: "Đạt 1000 người theo dõi", earned: false },
  { icon: "📚", title: "50 Bài hướng dẫn", desc: "Đăng 50 bài hướng dẫn", earned: false },
  { icon: "💎", title: "VIP Creator", desc: "Tài khoản VIP đang hoạt động", earned: false },
  { icon: "🎯", title: "Perfectionist", desc: "10 bài hướng dẫn được like 500+", earned: false },
  { icon: "🦢", title: "Senbazuru", desc: "Hoàn thành 1000 con hạc", earned: false },
  { icon: "🌟", title: "Community Star", desc: "Được cộng đồng đánh giá 5 sao", earned: false },
];

const FILTER_OPTIONS = ["Tất cả", "Công khai", "Riêng tư"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("Tất cả");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  async function loadAchievements() {
    setLoading(true);
    setError(null);
    try {
      const tok = getToken();
      if (!tok) {
        setError("Bạn cần đăng nhập để xem thành tựu.");
        return;
      }
      const result = await achievementsApi.getMine(tok, 1, 50);
      setAchievements(result.items.map(mapDto));
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Không thể tải thành tựu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAchievements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = achievements.filter((a) => {
    if (activeFilter === "Công khai") return a.isPublic;
    if (activeFilter === "Riêng tư") return !a.isPublic;
    return true;
  });

  const stats = {
    total: achievements.length,
    public: achievements.filter((a) => a.isPublic).length,
    private: achievements.filter((a) => !a.isPublic).length,
  };

  async function handleDelete(id: string) {
    const tok = getToken();
    if (!tok) return;
    try {
      await achievementsApi.delete(tok, id);
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      if (selectedAchievement?.id === id) setSelectedAchievement(null);
    } catch {
      // silently ignore
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

        {/* ── Hero Banner ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #D4713B 100%)",
            padding: "3.5rem 0 3rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            style={{ position: "absolute", right: "5%", top: "0", height: "100%", opacity: 0.07 }}
            viewBox="0 0 200 200"
            width="280"
          >
            <polygon points="100,10 190,190 10,190" fill="white" />
            <polygon points="100,40 170,170 30,170" fill="white" opacity="0.6" />
          </svg>
          <svg
            style={{ position: "absolute", left: "2%", bottom: "-20px", opacity: 0.05 }}
            viewBox="0 0 120 120"
            width="180"
          >
            <polygon points="60,5 115,115 5,115" fill="white" />
          </svg>

          <div className="container" style={{ position: "relative" }}>
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
              }}
            >
              <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Trang chủ</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <Link href="/ho-so" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Hồ sơ</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "white" }}>Thành tựu</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "5rem",
                  height: "5rem",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "var(--radius-xl)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  flexShrink: 0,
                }}
              >
                🏅
              </div>
              <div>
                <h1
                  style={{
                    color: "white",
                    fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: "0.375rem",
                  }}
                >
                  Thành tựu của tôi
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
                  Hành trình gấp giấy Origami được ghi lại qua từng tác phẩm
                </p>
              </div>
            </div>

            {/* Stats mini bar */}
            <div
              style={{
                display: "flex",
                gap: "0",
                marginTop: "2rem",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {[
                { label: "Tổng thành tựu", value: loading ? "…" : stats.total, icon: "🏅" },
                { label: "Công khai", value: loading ? "…" : stats.public, icon: "🌍" },
                { label: "Riêng tư", value: loading ? "…" : stats.private, icon: "🔒" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    textAlign: "center",
                    borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  }}
                >
                  <div style={{ color: "white", fontWeight: 800, fontSize: "1.25rem" }}>
                    {s.value}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    {s.icon} {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem" }}>
              <Link
                href="/ho-so"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  padding: "0.5rem 1rem",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Quay lại hồ sơ
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>

          {/* ── Achievement Badges ── */}
          <section style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <div className="section-tag" style={{ marginBottom: "0.5rem" }}>
                  <span>🎖️</span> Huy hiệu
                </div>
                <h2 className="section-title">Huy hiệu thành tích</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "0.875rem" }}>
              {ACHIEVEMENT_BADGES.map((b) => (
                <div
                  key={b.title}
                  title={b.desc}
                  style={{
                    background: b.earned ? "var(--color-surface)" : "var(--color-surface-2)",
                    border: `1px solid ${b.earned ? "rgba(45,106,79,0.2)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "1rem 0.5rem",
                    textAlign: "center",
                    opacity: b.earned ? 1 : 0.45,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className={b.earned ? "card" : ""}
                >
                  {b.earned && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.375rem",
                        right: "0.375rem",
                        width: "0.875rem",
                        height: "0.875rem",
                        background: "var(--color-primary)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.5rem",
                        color: "white",
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{b.icon}</div>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: b.earned ? "var(--color-text-primary)" : "var(--color-text-muted)", lineHeight: 1.3 }}>
                    {b.title}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Filter + Controls bar ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`filter-chip${activeFilter === opt ? " active" : ""}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {/* View mode toggle */}
              <div
                style={{
                  display: "flex",
                  background: "var(--color-surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.25rem",
                  border: "1px solid var(--color-border)",
                }}
              >
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "calc(var(--radius-md) - 2px)",
                      border: "none",
                      background: viewMode === mode ? "white" : "transparent",
                      color: viewMode === mode ? "var(--color-text-primary)" : "var(--color-text-muted)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.8125rem",
                      boxShadow: viewMode === mode ? "var(--shadow-xs)" : "none",
                    }}
                  >
                    {mode === "grid" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowUploadModal(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Thêm thành tựu
              </button>
            </div>
          </div>

          {/* ── Content area ── */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--color-text-muted)" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "2.5rem",
                  height: "2.5rem",
                  border: "3px solid var(--color-border)",
                  borderTopColor: "var(--color-primary)",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p>Đang tải thành tựu...</p>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
              <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>{error}</p>
              <button className="btn btn-primary btn-sm" onClick={loadAchievements}>
                Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 2rem",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px dashed var(--color-border)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏅</div>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                {activeFilter === "Tất cả" ? "Chưa có thành tựu nào" : `Không có thành tựu ${activeFilter.toLowerCase()}`}
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                Ghi lại hành trình Origami của bạn bằng cách thêm thành tựu đầu tiên!
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowUploadModal(true)}>
                Thêm thành tựu đầu tiên
              </button>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                Hiển thị <strong style={{ color: "var(--color-text-primary)" }}>{filtered.length}</strong> thành tựu
              </p>

              {viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                  {filtered.map((a) => (
                    <AchievementCard
                      key={a.id}
                      achievement={a}
                      onClick={() => setSelectedAchievement(a)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {filtered.map((a) => (
                    <AchievementListItem
                      key={a.id}
                      achievement={a}
                      onClick={() => setSelectedAchievement(a)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <UploadAchievementModal
          onClose={() => setShowUploadModal(false)}
          onCreated={(dto) => {
            setAchievements((prev) => [mapDto(dto), ...prev]);
            setShowUploadModal(false);
          }}
        />
      )}

      {/* ── Detail Modal ── */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onDelete={() => handleDelete(selectedAchievement.id)}
          onUpdated={(dto) => {
            const updated = mapDto(dto);
            setAchievements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setSelectedAchievement(updated);
          }}
        />
      )}

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </>
  );
}

// ── Achievement Card ──────────────────────────────────────────────────────────
function AchievementCard({
  achievement: a,
  onClick,
}: {
  achievement: Achievement;
  onClick: () => void;
}) {
  return (
    <article className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={onClick}>
      {/* Image / placeholder area */}
      <div
        style={{
          aspectRatio: "4/3",
          background: a.photoUrl ? "var(--color-surface-2)" : `linear-gradient(135deg, ${a.bgColor} 0%, ${a.bgColor}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {a.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.photoUrl}
            alt={a.tutorialTitle}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "4.5rem" }}>🏅</span>
        )}
        <div
          style={{
            position: "absolute",
            top: "0.625rem",
            left: "0.625rem",
            background: a.isPublic ? "rgba(22,163,74,0.9)" : "rgba(100,100,100,0.85)",
            color: "white",
            borderRadius: "var(--radius-full)",
            padding: "0.2rem 0.55rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.125rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.35 }}>
          {a.tutorialTitle}
        </h3>
        {a.note && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: "0.875rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {a.note}
          </p>
        )}

        {/* Tutorial ref */}
        <div
          style={{
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            padding: "0.5rem 0.75rem",
            marginBottom: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8125rem",
          }}
        >
          <span>📚</span>
          <Link
            href={`/huong-dan/${a.tutorialSlug}`}
            style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            {a.tutorialTitle}
          </Link>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>🕐 {a.timeAgo}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>📅 {a.date}</span>
        </div>
      </div>
    </article>
  );
}

// ── Achievement List Item ─────────────────────────────────────────────────────
function AchievementListItem({
  achievement: a,
  onClick,
}: {
  achievement: Achievement;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-card)",
        padding: "1.25rem",
        display: "flex",
        gap: "1.25rem",
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "all var(--transition-normal)",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(45,106,79,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "5rem",
          height: "5rem",
          borderRadius: "var(--radius-md)",
          background: a.photoUrl ? "var(--color-surface-2)" : `linear-gradient(135deg, ${a.bgColor}, ${a.bgColor}cc)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {a.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.photoUrl} alt={a.tutorialTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          "🏅"
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              {a.tutorialTitle}
            </h3>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: a.isPublic ? "#16A34A" : "#888",
                padding: "0.2rem 0.5rem",
                background: a.isPublic ? "#DCFCE7" : "#F5F5F0",
                borderRadius: "var(--radius-full)",
                display: "inline-block",
                marginBottom: "0.5rem",
              }}
            >
              {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", flexShrink: 0 }}>
            {a.date}
          </div>
        </div>

        {a.note && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "0.625rem" }}>
            {a.note}
          </p>
        )}

        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          📚{" "}
          <Link
            href={`/huong-dan/${a.tutorialSlug}`}
            style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            {a.tutorialTitle}
          </Link>
          <span style={{ marginLeft: "1rem" }}>🕐 {a.timeAgo}</span>
        </span>
      </div>
    </div>
  );
}

// ── Achievement Detail Modal ──────────────────────────────────────────────────
function AchievementDetailModal({
  achievement: a,
  onClose,
  onDelete,
  onUpdated,
}: {
  achievement: Achievement;
  onClose: () => void;
  onDelete: () => void;
  onUpdated: (dto: AchievementDto) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(a.note);
  const [isPublic, setIsPublic] = useState(a.isPublic);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    const tok = getToken();
    if (!tok) return;
    setSaving(true);
    try {
      const updated = await achievementsApi.update(tok, a.id, { note, isPublic });
      onUpdated(updated);
      setEditing(false);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth: "620px",
          boxShadow: "var(--shadow-xl)",
          maxHeight: "92vh",
          overflowY: "auto",
          animation: "modalIn 0.2s ease",
        }}
      >
        {/* Header media */}
        <div
          style={{
            background: a.photoUrl ? "var(--color-surface-2)" : `linear-gradient(135deg, ${a.bgColor}, ${a.bgColor}cc)`,
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {a.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.photoUrl} alt={a.tutorialTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "🏅"
          )}
          {/* Close button */}
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              borderRadius: "50%",
              padding: "0.5rem",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              color: "white",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Privacy badge */}
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
            <span
              style={{
                background: a.isPublic ? "rgba(22,163,74,0.9)" : "rgba(100,100,100,0.85)",
                color: "white",
                borderRadius: "var(--radius-full)",
                padding: "0.2rem 0.6rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                backdropFilter: "blur(4px)",
              }}
            >
              {isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
            {a.tutorialTitle}
          </h2>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            <span>🗓 {a.date}</span>
            <span>🕐 {a.timeAgo}</span>
          </div>

          {/* Note / Edit area */}
          {editing ? (
            <div style={{ marginBottom: "1.25rem" }}>
              <textarea
                className="input-field"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn..."
                style={{ resize: "vertical", width: "100%", marginBottom: "0.75rem" }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: "var(--color-surface-2)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {isPublic ? "🌍 Công khai" : "🔒 Chỉ mình tôi"}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  style={{
                    width: "3rem",
                    height: "1.625rem",
                    borderRadius: "var(--radius-full)",
                    background: isPublic ? "var(--color-primary)" : "var(--color-border-dark)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background var(--transition-normal)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: isPublic ? "calc(100% - 1.375rem)" : "2px",
                      width: "1.25rem",
                      height: "1.25rem",
                      background: "white",
                      borderRadius: "50%",
                      transition: "left var(--transition-normal)",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      display: "block",
                    }}
                  />
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu…" : "Lưu thay đổi"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setNote(a.note); setIsPublic(a.isPublic); }}>
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            a.note && (
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                {a.note}
              </p>
            )
          )}

          {/* Tutorial ref */}
          <div
            style={{
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              fontSize: "0.875rem",
              border: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>📚</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.125rem" }}>Bài hướng dẫn gốc</div>
              <Link
                href={`/huong-dan/${a.tutorialSlug}`}
                style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700 }}
                onClick={onClose}
              >
                {a.tutorialTitle}
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)", flexWrap: "wrap" }}>
            {!editing && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Chỉnh sửa
              </button>
            )}
            {confirmDelete ? (
              <>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", alignSelf: "center" }}>Xác nhận xóa?</span>
                <button
                  className="btn btn-sm"
                  style={{ background: "#E03131", color: "white", border: "none" }}
                  onClick={onDelete}
                >
                  Xóa
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>
                  Hủy
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "#E03131", marginLeft: "auto" }}
                onClick={() => setConfirmDelete(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Xóa thành tựu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Achievement Modal ──────────────────────────────────────────────────
function UploadAchievementModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (dto: AchievementDto) => void;
}) {
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [tutorialId, setTutorialId] = useState("");
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tutorialsApi.getList({ pageSize: 100 }).then((r) => setTutorials(r.items)).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tutorialId) {
      setError("Vui lòng chọn bài hướng dẫn.");
      return;
    }
    const tok = getToken();
    if (!tok) {
      setError("Bạn cần đăng nhập.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body: CreateAchievementRequest = {
        tutorialId,
        note: note.trim() || null,
        photoUrl: photoUrl.trim() || null,
        isPublic,
      };
      const created = await achievementsApi.create(tok, body);
      onCreated(created);
    } catch (e: unknown) {
      setError((e as { message?: string }).message ?? "Không thể tạo thành tựu. Thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "var(--shadow-xl)",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "modalIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
              🏅 Thêm thành tựu mới
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Ghi lại tác phẩm Origami bạn đã hoàn thành
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: "50%", padding: "0.5rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#FFF5F5",
              border: "1px solid #FECACA",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              color: "#DC2626",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Tutorial selector */}
          <div className="input-group">
            <label className="input-label">
              Bài hướng dẫn gốc <span style={{ color: "#E03131" }}>*</span>
            </label>
            <select
              className="input-field"
              value={tutorialId}
              onChange={(e) => setTutorialId(e.target.value)}
              required
            >
              <option value="">Chọn bài hướng dẫn bạn đã hoàn thành...</option>
              {tutorials.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="input-group">
            <label className="input-label">Cảm nhận / Ghi chú</label>
            <textarea
              className="input-field"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về tác phẩm này..."
              style={{ resize: "vertical" }}
              maxLength={1000}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{note.length}/1000</span>
          </div>

          {/* Photo URL */}
          <div className="input-group">
            <label className="input-label">URL ảnh tác phẩm</label>
            <input
              className="input-field"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... (tùy chọn)"
            />
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="preview"
                style={{ marginTop: "0.5rem", width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>

          {/* Privacy toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {isPublic ? "🌍 Công khai" : "🔒 Chỉ mình tôi"}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                {isPublic ? "Mọi người đều có thể xem" : "Chỉ bạn mới thấy thành tựu này"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              style={{
                width: "3rem",
                height: "1.625rem",
                borderRadius: "var(--radius-full)",
                background: isPublic ? "var(--color-primary)" : "var(--color-border-dark)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background var(--transition-normal)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  left: isPublic ? "calc(100% - 1.375rem)" : "2px",
                  width: "1.25rem",
                  height: "1.25rem",
                  background: "white",
                  borderRadius: "50%",
                  transition: "left var(--transition-normal)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  display: "block",
                }}
              />
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? (
                <>
                  <span style={{ display: "inline-block", width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Đang lưu...
                </>
              ) : (
                "Đăng thành tựu"
              )}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
