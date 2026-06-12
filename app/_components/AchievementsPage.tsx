"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ── Mock data ──────────────────────────────────────────────────────────────
const ACHIEVEMENT_STATS = {
  total: 24,
  public: 19,
  private: 5,
  totalLikes: 4312,
  totalComments: 287,
  streak: 12, // days streak
};

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Rồng 3D hoàn thành sau 3 ngày!",
    description: "Cuối cùng mình đã hoàn thành được chú rồng 3D huyền thoại này! Khó nhất là phần vảy, mất đúng 2 tiếng để gấp từng chiếc một. Cảm ơn bài hướng dẫn của @quangminh_origami đã giúp mình nhiều lắm!",
    emoji: "🐉",
    bgColor: "#F0F0FF",
    tutorial: { id: 1, title: "Rồng Origami 3D", author: "Quang Minh" },
    date: "12/06/2025",
    timeAgo: "2 giờ trước",
    likes: 234,
    comments: 18,
    isPublic: true,
    isLiked: false,
    difficulty: "Khó",
    diffClass: "badge-hard",
    tags: ["3D", "Nâng cao", "Rồng"],
  },
  {
    id: 2,
    title: "Phượng Hoàng bay lên!",
    description: "Tác phẩm mà mình tự hào nhất từ trước đến nay. 30 bước gấp mà mỗi bước đều cần sự chính xác tuyệt đối. Xứng đáng là thách thức lớn nhất mình từng thực hiện!",
    emoji: "🦅",
    bgColor: "#FFF5F0",
    tutorial: { id: 2, title: "Phượng hoàng huyền thoại", author: "Quang Minh" },
    date: "05/05/2025",
    timeAgo: "1 tháng trước",
    likes: 189,
    comments: 12,
    isPublic: true,
    isLiked: true,
    difficulty: "Khó",
    diffClass: "badge-hard",
    tags: ["3D", "Nâng cao"],
  },
  {
    id: 3,
    title: "1000 con hạc giấy - Ước nguyện thành sự thật",
    description: "Sau 4 tháng kiên trì, mình đã hoàn thành 1000 con hạc giấy Senbazuru! Mỗi con hạc mang theo một ước nguyện khác nhau. Đây là thành tựu ý nghĩa nhất của mình trong hành trình Origami.",
    emoji: "🦢",
    bgColor: "#E8F5E8",
    tutorial: { id: 3, title: "Hạc giấy nghệ thuật", author: "Quang Minh" },
    date: "20/04/2025",
    timeAgo: "2 tháng trước",
    likes: 512,
    comments: 43,
    isPublic: true,
    isLiked: false,
    difficulty: "Trung bình",
    diffClass: "badge-medium",
    tags: ["1000 hạc", "Truyền thống", "Kỷ niệm"],
  },
  {
    id: 4,
    title: "Kỳ lân giấy màu cầu vồng",
    description: "Dùng giấy Washi nhập khẩu từ Nhật để gấp chú kỳ lân này. Chất giấy rất đẹp và dễ gấp hơn giấy thường nhiều. Kết quả cực kỳ ưng ý!",
    emoji: "🦄",
    bgColor: "#FFF0F5",
    tutorial: { id: 4, title: "Kỳ lân giấy", author: "Quang Minh" },
    date: "10/03/2025",
    timeAgo: "3 tháng trước",
    likes: 341,
    comments: 27,
    isPublic: true,
    isLiked: true,
    difficulty: "Khó",
    diffClass: "badge-hard",
    tags: ["Washi", "Màu sắc"],
  },
  {
    id: 5,
    title: "Bộ sưu tập bướm mùa xuân",
    description: "Mỗi con bướm được gấp từ một loại giấy khác nhau tạo thành bộ sưu tập 12 con tượng trưng cho 12 tháng trong năm. Tặng cho mẹ nhân ngày sinh nhật.",
    emoji: "🦋",
    bgColor: "#FFFBF0",
    tutorial: { id: 5, title: "Bướm 3D modular", author: "Quang Minh" },
    date: "14/02/2025",
    timeAgo: "4 tháng trước",
    likes: 278,
    comments: 31,
    isPublic: true,
    isLiked: false,
    difficulty: "Trung bình",
    diffClass: "badge-medium",
    tags: ["Quà tặng", "Bộ sưu tập"],
  },
  {
    id: 6,
    title: "Bước đầu tiên với Origami",
    description: "Đây là con hạc giấy đầu tiên của mình, còn nhiều lỗi nhưng rất tự hào vì đây là khởi đầu của hành trình dài!",
    emoji: "🌱",
    bgColor: "#F5FFF5",
    tutorial: { id: 3, title: "Hạc giấy nghệ thuật", author: "Quang Minh" },
    date: "01/01/2023",
    timeAgo: "2 năm trước",
    likes: 89,
    comments: 7,
    isPublic: false,
    isLiked: false,
    difficulty: "Dễ",
    diffClass: "badge-easy",
    tags: ["Đầu tiên", "Kỷ niệm"],
  },
];

const FILTER_OPTIONS = ["Tất cả", "Công khai", "Riêng tư", "Mới nhất", "Nhiều like nhất"] as const;
const DIFFICULTY_FILTERS = ["Tất cả độ khó", "Dễ", "Trung bình", "Khó"] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];

// ── Badge items ──────────────────────────────────────────────────────────
const ACHIEVEMENT_BADGES = [
  { icon: "🏆", title: "Creator Top 10", desc: "Nằm trong top 10 nhà sáng tạo", earned: true },
  { icon: "🔥", title: "Streak 30 ngày", desc: "Hoạt động liên tục 30 ngày", earned: true },
  { icon: "⭐", title: "1000 Followers", desc: "Đạt 1000 người theo dõi", earned: true },
  { icon: "📚", title: "50 Bài hướng dẫn", desc: "Đăng 50 bài hướng dẫn", earned: false },
  { icon: "💎", title: "VIP Creator", desc: "Tài khoản VIP đang hoạt động", earned: true },
  { icon: "🎯", title: "Perfectionist", desc: "10 bài hướng dẫn được like 500+", earned: false },
  { icon: "🦢", title: "Senbazuru", desc: "Hoàn thành 1000 con hạc", earned: true },
  { icon: "🌟", title: "Community Star", desc: "Được cộng đồng đánh giá 5 sao", earned: true },
];

export default function AchievementsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("Tất cả");
  const [likedIds, setLikedIds] = useState<Set<number>>(
    new Set(ACHIEVEMENTS.filter((a) => a.isLiked).map((a) => a.id))
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = ACHIEVEMENTS.filter((a) => {
    if (activeFilter === "Công khai") return a.isPublic;
    if (activeFilter === "Riêng tư") return !a.isPublic;
    return true;
  });

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
          {/* Decorative origami shapes */}
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
              <Link href="/profile" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Quang Minh</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "white" }}>Tành tựu</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              {/* Trophy icon */}
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
                  Thành tựu của Quang Minh
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
                { label: "Tổng thành tựu", value: ACHIEVEMENT_STATS.total, icon: "🏅" },
                { label: "Công khai", value: ACHIEVEMENT_STATS.public, icon: "🌍" },
                { label: "Riêng tư", value: ACHIEVEMENT_STATS.private, icon: "🔒" },
                { label: "Lượt thích", value: ACHIEVEMENT_STATS.totalLikes.toLocaleString(), icon: "❤️" },
                { label: "Bình luận", value: ACHIEVEMENT_STATS.totalComments, icon: "💬" },
                { label: "Streak hiện tại", value: `${ACHIEVEMENT_STATS.streak} ngày`, icon: "🔥" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    textAlign: "center",
                    borderRight: i < 5 ? "1px solid rgba(255,255,255,0.1)" : "none",
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

            {/* Back to profile shortcut */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem" }}>
              <Link
                href="/profile"
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
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <div className="section-tag" style={{ marginBottom: "0.5rem" }}>
                  <span>🎖️</span> Huy hiệu
                </div>
                <h2 className="section-title">Huy hiệu thành tích</h2>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: "0.875rem",
              }}
            >
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
                    transition: "all var(--transition-normal)",
                    cursor: "pointer",
                    boxShadow: b.earned ? "var(--shadow-card)" : "none",
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
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: b.earned ? "var(--color-text-primary)" : "var(--color-text-muted)",
                      lineHeight: 1.3,
                    }}
                  >
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
                  id={`achievement-filter-${opt}`}
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
                    id={`view-mode-${mode}`}
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
                      transition: "all var(--transition-fast)",
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
                id="upload-achievement-btn"
                className="btn btn-primary btn-sm"
                onClick={() => setShowUploadModal(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Thêm thành tựu
              </button>
            </div>
          </div>

          {/* ── Achievement count ── */}
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Hiển thị <strong style={{ color: "var(--color-text-primary)" }}>{filtered.length}</strong> thành tựu
          </p>

          {/* ── Achievement Grid/List ── */}
          {viewMode === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
              }}
            >
              {filtered.map((a) => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  isLiked={likedIds.has(a.id)}
                  onLike={() => toggleLike(a.id)}
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
                  isLiked={likedIds.has(a.id)}
                  onLike={() => toggleLike(a.id)}
                  onClick={() => setSelectedAchievement(a)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <UploadAchievementModal onClose={() => setShowUploadModal(false)} />
      )}

      {/* ── Detail Modal ── */}
      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          isLiked={likedIds.has(selectedAchievement.id)}
          onLike={() => toggleLike(selectedAchievement.id)}
          onClose={() => setSelectedAchievement(null)}
        />
      )}

      <Footer />
    </>
  );
}

// ── Achievement Card Component ──────────────────────────────────────────────
interface Achievement {
  id: number;
  title: string;
  description: string;
  emoji: string;
  bgColor: string;
  tutorial: { id: number; title: string; author: string };
  date: string;
  timeAgo: string;
  likes: number;
  comments: number;
  isPublic: boolean;
  isLiked: boolean;
  difficulty: string;
  diffClass: string;
  tags: string[];
}

function AchievementCard({
  achievement: a,
  isLiked,
  onLike,
  onClick,
}: {
  achievement: Achievement;
  isLiked: boolean;
  onLike: () => void;
  onClick: () => void;
}) {
  return (
    <article
      className="card"
      style={{ overflow: "hidden", cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Image/Media area */}
      <div
        style={{
          aspectRatio: "4/3",
          background: `linear-gradient(135deg, ${a.bgColor} 0%, ${a.bgColor}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {a.emoji}
        {/* Privacy badge */}
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
        {/* Difficulty badge */}
        <div style={{ position: "absolute", top: "0.625rem", right: "0.625rem" }}>
          <span className={`badge ${a.diffClass}`}>{a.difficulty}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.125rem" }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: "0.9375rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.5rem",
            lineHeight: 1.35,
          }}
        >
          {a.title}
        </h3>
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
          {a.description}
        </p>

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
            href={`/tutorials/${a.tutorial.id}`}
            style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            {a.tutorial.title}
          </Link>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
          {a.tags.map((tag) => (
            <span
              key={tag}
              className="badge badge-category"
              style={{ fontSize: "0.6875rem" }}
            >
              #{tag}
            </span>
          ))}
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
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            🕐 {a.timeAgo}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              id={`like-achievement-${a.id}`}
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="like-btn"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.8125rem",
                color: isLiked ? "#E03131" : "var(--color-text-muted)",
                fontWeight: 600,
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {isLiked ? "❤️" : "🤍"} {a.likes + (isLiked && !a.isLiked ? 1 : !isLiked && a.isLiked ? -1 : 0)}
            </button>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                fontWeight: 600,
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              💬 {a.comments}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Achievement List Item ───────────────────────────────────────────────────
function AchievementListItem({
  achievement: a,
  isLiked,
  onLike,
  onClick,
}: {
  achievement: Achievement;
  isLiked: boolean;
  onLike: () => void;
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
          background: `linear-gradient(135deg, ${a.bgColor}, ${a.bgColor}cc)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          flexShrink: 0,
        }}
      >
        {a.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.25rem",
              }}
            >
              {a.title}
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span className={`badge ${a.diffClass}`} style={{ fontSize: "0.6875rem" }}>
                {a.difficulty}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: a.isPublic ? "#16A34A" : "#888",
                  padding: "0.2rem 0.5rem",
                  background: a.isPublic ? "#DCFCE7" : "#F5F5F0",
                  borderRadius: "var(--radius-full)",
                }}
              >
                {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
            <button
              id={`list-like-${a.id}`}
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="like-btn"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.875rem",
                color: isLiked ? "#E03131" : "var(--color-text-muted)",
                fontWeight: 600,
                padding: "0.375rem 0.625rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {isLiked ? "❤️" : "🤍"} {a.likes}
            </button>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                fontWeight: 600,
                padding: "0.375rem 0.625rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              💬 {a.comments}
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: "0.625rem",
          }}
        >
          {a.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            📚{" "}
            <Link
              href={`/tutorials/${a.tutorial.id}`}
              style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
              onClick={(e) => e.stopPropagation()}
            >
              {a.tutorial.title}
            </Link>
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>🕐 {a.timeAgo}</span>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {a.tags.map((tag) => (
              <span key={tag} className="badge badge-category" style={{ fontSize: "0.6875rem" }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS animations injected globally
const detailModalStyle = typeof document !== "undefined" && !document.getElementById("achievement-modal-style")
  ? (() => {
      const s = document.createElement("style");
      s.id = "achievement-modal-style";
      s.innerHTML = "@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }";
      document.head.appendChild(s);
      return s;
    })()
  : null;
void detailModalStyle;
// ── Achievement Detail Modal ──────────────────────────────────────────────────────────────
function AchievementDetailModal({
  achievement: a,
  isLiked,
  onLike,
  onClose,
}: {
  achievement: Achievement;
  isLiked: boolean;
  onLike: () => void;
  onClose: () => void;
}) {
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
            background: `linear-gradient(135deg, ${a.bgColor}, ${a.bgColor}cc)`,
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6rem",
            position: "relative",
          }}
        >
          {a.emoji}
          {/* Close button */}
          <button
            id="close-detail-modal"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              borderRadius: "50%",
              padding: "0.5rem",
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(4px)",
              color: "white",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Privacy + difficulty badges */}
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", gap: "0.375rem" }}>
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
              {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
            </span>
            <span className={`badge ${a.diffClass}`}>{a.difficulty}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
            {a.title}
          </h2>

          {/* Meta */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            <span>🗓 {a.date}</span>
            <span>🕐 {a.timeAgo}</span>
          </div>

          <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
            {a.description}
          </p>

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
                href={`/tutorials/${a.tutorial.id}`}
                style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700 }}
                onClick={onClose}
              >
                {a.tutorial.title}
              </Link>
              <span style={{ color: "var(--color-text-muted)", marginLeft: "0.375rem" }}>by {a.tutorial.author}</span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {a.tags.map((tag) => (
              <span key={tag} className="badge badge-category">#{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
            <button
              id={`detail-like-${a.id}`}
              onClick={onLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-full)",
                border: "2px solid",
                borderColor: isLiked ? "#E03131" : "var(--color-border)",
                background: isLiked ? "#FFF5F5" : "transparent",
                color: isLiked ? "#E03131" : "var(--color-text-secondary)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {isLiked ? "❤️" : "🤍"} {a.likes + (isLiked && !a.isLiked ? 1 : !isLiked && a.isLiked ? -1 : 0)}
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-full)",
                border: "2px solid var(--color-border)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              💬 {a.comments}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: "auto", borderRadius: "var(--radius-full)" }}
              title="Chia sẻ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Achievement Modal ────────────────────────────────────────────────
function UploadAchievementModal({ onClose }: { onClose: () => void }) {
  const [isPublic, setIsPublic] = useState(true);

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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
              🏅 Thêm thành tựu mới
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Chia sẻ tác phẩm Origami bạn đã hoàn thành
            </p>
          </div>
          <button
            id="close-upload-modal"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: "50%", padding: "0.5rem" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload area */}
        <div
          style={{
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem",
            textAlign: "center",
            marginBottom: "1.25rem",
            background: "var(--color-surface-2)",
            cursor: "pointer",
            transition: "border-color var(--transition-fast)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-primary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)")
          }
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📸</div>
          <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
            Tải ảnh/video lên
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            PNG, JPG, MP4 tối đa 50MB
          </p>
          <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }}>
            Chọn file
          </button>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label">Tiêu đề thành tựu *</label>
            <input
              id="achievement-title"
              className="input-field"
              type="text"
              placeholder="VD: Rồng 3D hoàn thành sau 3 ngày!"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mô tả / Cảm nhận</label>
            <textarea
              id="achievement-description"
              className="input-field"
              rows={3}
              placeholder="Chia sẻ cảm nhận của bạn về tác phẩm này..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Liên kết bài hướng dẫn</label>
            <select id="achievement-tutorial" className="input-field">
              <option value="">Chọn bài hướng dẫn gốc...</option>
              <option value="1">Rồng Origami 3D</option>
              <option value="2">Phượng hoàng huyền thoại</option>
              <option value="3">Hạc giấy nghệ thuật</option>
            </select>
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
              id="toggle-privacy"
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

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button
              id="submit-achievement"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v10M5 12l7 7 7-7" />
              </svg>
              Đăng thành tựu
            </button>
            <button
              id="cancel-upload"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
