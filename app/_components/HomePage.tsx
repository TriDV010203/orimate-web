"use client";
// Component chính của trang chủ — được import vào app/page.tsx

import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorLink from "./AuthorLink";
import { useEffect, useState, useCallback } from "react";
import { tutorialsApi, communityPostsApi, wishlistsApi, dailyChallengeApi, type TutorialListItemDto, type DailyChallengeDto } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";
import { DIFFICULTY_META, useCountdownToMidnightGmt7 } from "./DailyChallengePage";

const CREATORS = [
  { name: "Quang Minh", tutorials: 48, followers: "12.4K", color: "#2D6A4F", initial: "QM", tag: "Origami Nâng cao" },
  { name: "Thu Hương", tutorials: 32, followers: "8.7K", color: "#D4713B", initial: "TH", tag: "Hoa & Nghệ thuật" },
  { name: "Hoàng Nam", tutorials: 61, followers: "21.3K", color: "#2C7DA0", initial: "HN", tag: "Origami 3D" },
  { name: "Lan Anh", tutorials: 27, followers: "6.2K", color: "#9B59B6", initial: "LA", tag: "Origami trẻ em" },
];

const STATS = [
  { num: "10K+", label: "Bài hướng dẫn" },
  { num: "50K+", label: "Thành viên" },
  { num: "500+", label: "Nhà sáng tạo" },
  { num: "4.9★", label: "Đánh giá" },
];

const DIFFICULTY_EMOJIS: Record<string, string> = {
  "Dễ": "⭐", "Trung bình": "🌟", "Khó": "💫",
  "Easy": "⭐", "Medium": "🌟", "Hard": "💫",
};
const FALLBACK_EMOJIS = ["🦢", "🌸", "🐉", "🦋", "🐟", "⭐", "🦅", "🐼", "🎋", "🏮"];
const FALLBACK_COLORS = [
  "#E8F5E8", "#FFF0F5", "#F0F0FF", "#FFFBF0",
  "#F0F8FF", "#FFFDF0", "#FFF5F0", "#F5F5F5",
  "#E8F4FD", "#FDF2F8",
];

function getDiffClass(difficulty?: string | null) {
  if (!difficulty) return "badge-easy";
  const d = difficulty.toLowerCase();
  if (d === "dễ" || d === "easy") return "badge-easy";
  if (d === "trung bình" || d === "medium") return "badge-medium";
  if (d === "khó" || d === "hard") return "badge-hard";
  return "badge-easy";
}
function getTypeClass(type: string) { return type?.toLowerCase() === "vip" ? "badge-vip" : "badge-free"; }
function getTypeLabel(type: string) { return type?.toLowerCase() === "vip" ? "VIP" : "Miễn phí"; }
function getDiffLabel(difficulty?: string | null) {
  if (!difficulty) return "Dễ";
  const d = difficulty.toLowerCase();
  if (d === "easy") return "Dễ";
  if (d === "medium") return "Trung bình";
  if (d === "hard") return "Khó";
  return difficulty;
}

function SkeletonCard() {
  return (
    <article className="card tutorial-card" style={{ cursor: "default" }}>
      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", animation: "pulse 1.5s infinite" }} />
      <div style={{ padding: "1rem" }}>
        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.625rem", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "60%", marginBottom: "0.75rem", animation: "pulse 1.5s infinite" }} />
        <div style={{ height: "2rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-sm)", animation: "pulse 1.5s infinite" }} />
      </div>
    </article>
  );
}

// ===== DAILY CHALLENGE TEASER — giới thiệu tính năng thử thách hàng ngày =====
function ChallengeTeaser() {
  const countdown = useCountdownToMidnightGmt7();
  const [challenge, setChallenge] = useState<DailyChallengeDto | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dailyChallengeApi.getToday(getToken() ?? undefined)
      .then(setChallenge)
      .catch(() => setChallenge(null))
      .finally(() => setLoaded(true));
  }, []);

  // Chưa tải xong, hoặc hôm nay không có thử thách nào → ẩn hẳn khối teaser
  if (!loaded || !challenge) return null;

  const diffStyle = DIFFICULTY_META[challenge.tutorialDifficulty] ?? DIFFICULTY_META.Beginner;

  return (
    <section style={{ padding: "3rem 0" }}>
      <div className="container">
        <div
          className="challenge-teaser-grid"
          style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.75rem", alignItems: "center",
            background: "var(--gradient-hero)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)",
            padding: "2rem 2.25rem", boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Icon */}
          <div style={{
            width: "5rem", height: "5rem", borderRadius: "var(--radius-lg)", background: "var(--color-surface)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
            boxShadow: "var(--shadow-md)", flexShrink: 0,
          }}>
            🦢
          </div>

          {/* Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "white", background: "var(--gradient-accent)", padding: "0.2rem 0.625rem", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                🔥 Thử thách hàng ngày
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: diffStyle.fg, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, padding: "0.2rem 0.625rem", borderRadius: "99px" }}>
                {diffStyle.label}
              </span>
            </div>
            <h2 className="text-heading" style={{ fontSize: "1.375rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
              Hôm nay: {challenge.tutorialTitle}
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", maxWidth: "480px", lineHeight: 1.6, marginBottom: "0.625rem" }}>
              Mỗi ngày một mẫu gấp mới — cùng cả cộng đồng tham gia, giữ streak và leo bảng xếp hạng.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                {challenge.submissionCount} người đã tham gia
              </span>
            </div>
          </div>

          {/* Countdown + CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", minWidth: "180px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>Kết thúc sau</div>
              <div style={{ fontFamily: "monospace", fontSize: "1.375rem", fontWeight: 700, color: "var(--color-accent-dark)", letterSpacing: "0.05em" }}>
                {countdown}
              </div>
            </div>
            <Link id="btn-join-challenge-home" href="/thach-thuc" className="btn btn-accent" style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}>
              Tham gia ngay
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .challenge-teaser-grid { grid-template-columns: 1fr !important; text-align: center; }
          .challenge-teaser-grid > div:first-child { margin: 0 auto; }
          .challenge-teaser-grid > div:nth-child(2) > div:last-child { justify-content: center; }
        }
      `}</style>
    </section>
  );
}

// State per-card cho like/save (dùng map để tránh re-render toàn bộ list)
interface CardState { isLiked: boolean; likeCount: number; isSaved: boolean; }

export default function HomePage() {
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Tất cả");
  const [loggedIn, setLoggedIn] = useState(false);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});

  useEffect(() => { setLoggedIn(isLoggedIn()); }, []);

  useEffect(() => {
    const token = isLoggedIn() ? getToken() ?? undefined : undefined;
    // Lấy tutorial nổi bật nhất theo lượt like
    tutorialsApi.getList({ pageSize: 8, sortBy: "likes" }, token)
      .then((res) => {
        setTutorials(res.items);
        const states: Record<string, CardState> = {};
        res.items.forEach((t) => {
          states[t.id] = {
            isLiked: t.isLikedByCurrentUser ?? false,
            likeCount: t.likeCount ?? 0,
            isSaved: t.isWishlistedByCurrentUser ?? false,
          };
        });
        setCardStates(states);
      })
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = useCallback(async (tutorialId: string) => {
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    const token = getToken()!;
    const prev = cardStates[tutorialId] ?? { isLiked: false, likeCount: 0, isSaved: false };
    // Optimistic update
    setCardStates((s) => ({
      ...s,
      [tutorialId]: { ...prev, isLiked: !prev.isLiked, likeCount: prev.likeCount + (prev.isLiked ? -1 : 1) },
    }));
    try {
      const res = await communityPostsApi.toggleLike(token, tutorialId, "Tutorial");
      if (typeof res.isLiked === "boolean") {
        setCardStates((s) => ({
          ...s,
          [tutorialId]: { ...s[tutorialId], isLiked: res.isLiked },
        }));
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

  // Filter client-side (BE đã sort by likes, filter chỉ lọc thêm)
  const displayTutorials = tutorials.filter((t) => {
    if (activeFilter === "Dễ")        return (t.difficulty ?? "").toLowerCase() === "easy" || t.difficulty === "Dễ";
    if (activeFilter === "Trung bình") return (t.difficulty ?? "").toLowerCase() === "medium" || t.difficulty === "Trung bình";
    if (activeFilter === "Khó")       return (t.difficulty ?? "").toLowerCase() === "hard" || t.difficulty === "Khó";
    if (activeFilter === "Miễn phí")  return t.type?.toLowerCase() === "free";
    if (activeFilter === "VIP")       return t.type?.toLowerCase() === "vip";
    return true;
  });

  return (
    <>
      <Navbar />
      <main>
        {/* ===== HERO ===== */}
        <section className="hero-section" style={{ padding: "5rem 0 4rem" }}>
          <div className="container">
            <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
              {/* Left */}
              <div className="animate-fade-in">
                <div className="section-tag">
                  <span>✦</span> Nền tảng Origami #1 Việt Nam
                </div>
                <h1 className="text-display" style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", marginBottom: "1.25rem", color: "var(--color-text-primary)" }}>
                  Khám phá nghệ thuật{" "}
                  <span style={{ color: "var(--color-primary)", position: "relative" }}>
                    gấp giấy
                    <svg style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", height: "8px" }} viewBox="0 0 200 8" preserveAspectRatio="none">
                      <path d="M0 6 Q50 0 100 5 Q150 10 200 3" stroke="var(--color-accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>{" "}
                  Origami
                </h1>
                <p style={{ fontSize: "1.0625rem", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "480px" }}>
                  Tham gia cộng đồng hơn <strong>50.000 người</strong> yêu thích Origami. Học từ hàng nghìn bài hướng dẫn, chia sẻ thành quả và kết nối với các nhà sáng tạo tài năng.
                </p>
                <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
                  <Link href="/dang-ky" className="btn btn-primary btn-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    Bắt đầu miễn phí
                  </Link>
                  <Link href="/huong-dan" className="btn btn-outline btn-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Xem hướng dẫn
                  </Link>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)" }}>
                  {STATS.map((s) => (
                    <div key={s.label} className="stat-card" style={{ padding: "0.75rem 0", textAlign: "left" }}>
                      <div className="stat-number" style={{ fontSize: "1.5rem" }}>{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Hero Image */}
              <div className="animate-fade-in delay-200" style={{ position: "relative" }}>
                <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-xl)", aspectRatio: "5/4" }}>
                  <Image src="/origami-hero.png" alt="Nghệ thuật gấp giấy Origami" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
                </div>
                {/* Floating badge */}
                <div style={{ position: "absolute", bottom: "1.5rem", left: "-1.5rem", background: "white", borderRadius: "var(--radius-lg)", padding: "0.875rem 1.125rem", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid var(--color-border)" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", background: "var(--gradient-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>🏆</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Bài hot nhất tuần</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                      {tutorials[0] ? `${tutorials[0].title} · ${tutorials[0].stepCount} bước` : "Đang tải..."}
                    </div>
                  </div>
                </div>
                <div style={{ position: "absolute", top: "1.25rem", right: "-1rem", background: "white", borderRadius: "var(--radius-lg)", padding: "0.75rem 1rem", boxShadow: "var(--shadow-lg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Thành viên mới hôm nay</div>
                  <div style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1.125rem" }}>+124 người</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DAILY CHALLENGE TEASER ===== */}
        <ChallengeTeaser />

        {/* ===== TUTORIALS SECTION — nổi bật theo lượt like ===== */}
        <section style={{ padding: "4rem 0", background: "var(--color-bg)" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="section-tag"><span>🔥</span> Nổi bật nhất</div>
                <h2 className="section-title">Hướng dẫn được yêu thích</h2>
                <p className="section-subtitle">Những bài hướng dẫn được cộng đồng like nhiều nhất</p>
              </div>
              <Link href="/huong-dan" className="btn btn-outline btn-sm">
                Xem tất cả
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {["Tất cả", "Dễ", "Trung bình", "Khó", "Miễn phí", "VIP"].map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip${activeFilter === cat ? " active" : ""}`}
                  id={`filter-${cat}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Cards grid */}
            <div className="tutorials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem" }}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : (displayTutorials.length === 0
                    ? (
                      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                        <p>Chưa có bài hướng dẫn nào. Hãy quay lại sau!</p>
                      </div>
                    )
                    : displayTutorials.map((t, idx) => {
                        const emoji = DIFFICULTY_EMOJIS[t.difficulty ?? ""] ?? FALLBACK_EMOJIS[idx % FALLBACK_EMOJIS.length];
                        const bgColor = FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                        const initials = t.author.displayName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();
                        const cs = cardStates[t.id] ?? { isLiked: false, likeCount: t.likeCount ?? 0, isSaved: false };
                        return (
                          <article key={t.id} className="card tutorial-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                            {/* Thumbnail */}
                            <Link href={`/huong-dan/${t.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                              <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                                {isValidImageUrl(t.coverImageUrl) ? (
                                  <Image src={t.coverImageUrl} alt={t.title} fill sizes="(max-width: 768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
                                ) : (
                                  <span>{emoji}</span>
                                )}
                                <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem", display: "flex", gap: "0.375rem" }}>
                                  <span className={`badge ${getDiffClass(t.difficulty)}`}>{getDiffLabel(t.difficulty)}</span>
                                </div>
                                <div style={{ position: "absolute", top: "0.625rem", right: "0.625rem" }}>
                                  <span className={`badge ${getTypeClass(t.type)}`}>{getTypeLabel(t.type)}</span>
                                </div>
                              </div>
                              <div style={{ padding: "1rem 1rem 0.5rem" }}>
                                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.5rem", color: "var(--color-text-primary)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.title}</h3>
                                <AuthorLink authorId={t.author.id} style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                                  <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0 }}>
                                    {initials}
                                  </div>
                                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{t.author.displayName}</span>
                                </AuthorLink>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                                  <span>🗂 {t.categoryName}</span>
                                  <span>📋 {t.stepCount} bước</span>
                                </div>
                              </div>
                            </Link>

                            {/* Actions: like / save / xem */}
                            <div style={{ padding: "0.625rem 1rem 1rem", marginTop: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                                title={cs.isSaved ? "Bỏ lưu" : "Lưu vào yêu thích"}
                                style={{
                                  display: "flex", alignItems: "center",
                                  padding: "0.375rem 0.5rem", borderRadius: "var(--radius-sm)",
                                  border: `1.5px solid ${cs.isSaved ? "var(--color-primary)" : "var(--color-border)"}`,
                                  background: cs.isSaved ? "#F0FDF4" : "transparent",
                                  color: cs.isSaved ? "var(--color-primary)" : "var(--color-text-muted)",
                                  cursor: "pointer",
                                  transition: "all var(--transition-fast)",
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={cs.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                </svg>
                              </button>

                              {/* Xem */}
                              <Link
                                href={`/huong-dan/${t.slug}`}
                                className="btn btn-primary btn-sm"
                                style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}
                              >
                                Xem ngay
                              </Link>
                            </div>
                          </article>
                        );
                      })
                  )
              }
            </div>


          </div>
        </section>

        {/* ===== COMMUNITY BANNER ===== */}
        <section style={{ background: "var(--color-primary-dark)", padding: "5rem 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="section-tag" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)", marginBottom: "1rem", display: "inline-flex" }}>
              <span>🌟</span> Cộng đồng
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, color: "white", marginBottom: "1rem", letterSpacing: "-0.01em" }}>
              Tham gia cộng đồng OriGami
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", maxWidth: "540px", margin: "0 auto 3rem", lineHeight: 1.7 }}>
              Chia sẻ thành quả, học hỏi từ nhau và tạo nên những kỷ niệm đặc biệt cùng gia đình qua nghệ thuật gấp giấy.
            </p>
            <div className="community-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
              {[
                { icon: "🖼️", title: "Chia sẻ thành quả", desc: "Đăng ảnh/video những tác phẩm Origami bạn đã hoàn thành và nhận phản hồi từ cộng đồng." },
                { icon: "👥", title: "Follow nhà sáng tạo", desc: "Theo dõi các NST yêu thích và không bỏ lỡ bất kỳ bài hướng dẫn mới nào của họ." },
              ].map((f) => (
                <div key={f.title} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-lg)", padding: "2rem", border: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.875rem" }}>{f.icon}</div>
                  <h3 style={{ color: "white", fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/dang-ky" className="btn btn-accent btn-lg">
              Tham gia ngay — Miễn phí
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </section>



        {/* ===== FEATURED CREATORS ===== */}
        <section style={{ padding: "4rem 0", background: "var(--color-surface-2)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-tag" style={{ display: "inline-flex" }}><span>✨</span> Nổi bật</div>
              <h2 className="section-title">Nhà sáng tạo nổi bật</h2>
              <p className="section-subtitle">Những nhà sáng tạo được yêu thích nhất trên OriGami</p>
            </div>
            <div className="creators-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }}>
              {CREATORS.map((c) => (
                <div key={c.name} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.125rem", margin: "0 auto 1rem", boxShadow: `0 4px 16px ${c.color}40` }}>
                    {c.initial}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>{c.name}</h3>
                  <span className="badge badge-category" style={{ marginBottom: "1rem", display: "inline-block" }}>{c.tag}</span>
                  <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginBottom: "1.125rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{c.tutorials}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Bài viết</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{c.followers}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Người theo dõi</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ width: "100%" }} id={`follow-${c.name.replace(/\s/g, "-")}`}>
                    + Theo dõi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== COLLECTION CTA ===== */}
        <section style={{ padding: "4rem 0" }}>
          <div className="container">
            <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", position: "relative", height: "320px", boxShadow: "var(--shadow-xl)" }}>
              <Image src="/origami-collection.png" alt="Bộ sưu tập Origami" fill sizes="100vw" style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(27,67,50,0.85) 0%, rgba(27,67,50,0.3) 60%, transparent 100%)", display: "flex", alignItems: "center", padding: "3rem" }}>
                <div>
                  <h2 style={{ color: "white", fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 800, marginBottom: "0.75rem" }}>
                    Bộ sưu tập Origami<br />của bạn bắt đầu từ đây
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                    Lưu những bài hướng dẫn yêu thích vào Wishlist cá nhân
                  </p>
                  <Link href={loggedIn ? "/danh-sach-yeu-thich" : "/dang-ky"} className="btn" style={{ background: "white", color: "var(--color-primary-dark)", fontWeight: 700 }}>
                    {loggedIn ? "Xem danh sách yêu thích" : "Tạo tài khoản miễn phí"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


      </main>
      <Footer />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </>
  );
}
