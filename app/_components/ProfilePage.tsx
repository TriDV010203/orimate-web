"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// ── Mock data ──────────────────────────────────────────────────────────────
const USER = {
  id: "quang-minh",
  name: "Quang Minh",
  username: "@quangminh_origami",
  bio: "Đam mê nghệ thuật gấp giấy Origami từ năm 2015. Chuyên về Origami 3D và Modular Origami. Mình tin rằng mỗi tờ giấy đều có thể trở thành một tác phẩm nghệ thuật! 🐉",
  avatar: "QM",
  avatarColor: "#2D6A4F",
  coverGradient: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
  joinDate: "Tháng 3, 2022",
  location: "Hà Nội, Việt Nam",
  website: "quangminh-origami.com",
  isVip: true,
  vipTier: "50K",
  isVerified: true,
  stats: {
    tutorials: 48,
    followers: 12400,
    following: 234,
    likes: 89600,
    achievements: 24,
    completedByOthers: 3780,
  },
  badges: [
    { icon: "🏆", label: "Top Creator", color: "#D4713B" },
    { icon: "⭐", label: "Verified", color: "#2C7DA0" },
    { icon: "🔥", label: "Trending", color: "#E03131" },
    { icon: "💎", label: "VIP Creator", color: "#7950F2" },
  ],
};

const TUTORIALS = [
  { id: 1, title: "Rồng Origami 3D", emoji: "🐉", color: "#F0F0FF", difficulty: "Khó", diffClass: "badge-hard", type: "VIP", typeClass: "badge-vip", views: "8.7K", likes: 1203, steps: 28 },
  { id: 2, title: "Phượng hoàng huyền thoại", emoji: "🦅", color: "#FFF5F0", difficulty: "Khó", diffClass: "badge-hard", type: "VIP", typeClass: "badge-vip", views: "5.2K", likes: 876, steps: 30 },
  { id: 3, title: "Hạc giấy nghệ thuật", emoji: "🦢", color: "#E8F5E8", difficulty: "Trung bình", diffClass: "badge-medium", type: "Miễn phí", typeClass: "badge-free", views: "3.1K", likes: 428, steps: 15 },
  { id: 4, title: "Kỳ lân giấy", emoji: "🦄", color: "#FFF0F5", difficulty: "Khó", diffClass: "badge-hard", type: "VIP", typeClass: "badge-vip", views: "6.4K", likes: 921, steps: 26 },
  { id: 5, title: "Bướm 3D modular", emoji: "🦋", color: "#FFFBF0", difficulty: "Trung bình", diffClass: "badge-medium", type: "Miễn phí", typeClass: "badge-free", views: "2.9K", likes: 367, steps: 18 },
  { id: 6, title: "Cá koi đơn giản", emoji: "🐟", color: "#F0F8FF", difficulty: "Dễ", diffClass: "badge-easy", type: "Miễn phí", typeClass: "badge-free", views: "1.8K", likes: 241, steps: 10 },
];

const ACHIEVEMENTS_PREVIEW = [
  { id: 1, title: "Rồng 3D hoàn thành!", emoji: "🐉", date: "12/06/2025", likes: 234, comments: 18, isPublic: true },
  { id: 2, title: "Thành công với Phượng Hoàng", emoji: "🦅", date: "05/05/2025", likes: 189, comments: 12, isPublic: true },
  { id: 3, title: "Bộ sưu tập hạc 1000 con", emoji: "🦢", date: "20/04/2025", likes: 512, comments: 43, isPublic: true },
];

const TABS = ["Bài hướng dẫn", "Thành tựu", "Cộng đồng"] as const;
type Tab = (typeof TABS)[number];

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Bài hướng dẫn");
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
        {/* ── Cover Photo ── */}
        <div
          style={{
            height: "260px",
            background: USER.coverGradient,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative origami patterns */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}
            viewBox="0 0 800 260"
            preserveAspectRatio="xMidYMid slice"
          >
            <polygon points="100,20 160,120 40,120" fill="white" />
            <polygon points="300,10 380,130 220,130" fill="white" />
            <polygon points="600,30 680,150 520,150" fill="white" />
            <polygon points="750,0 800,80 700,80" fill="white" />
            <polygon points="450,50 510,160 390,160" fill="white" opacity="0.5" />
          </svg>

          {/* Floating badges */}
          <div
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "2rem",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {USER.badges.map((b) => (
              <div
                key={b.label}
                title={b.label}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.8125rem",
                  color: "white",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Profile Header ── */}
        <div className="container">
          <div
            style={{
              position: "relative",
              marginTop: "-5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-xl)",
                padding: "1.75rem 2rem",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "6rem",
                      height: "6rem",
                      borderRadius: "50%",
                      background: USER.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1.75rem",
                      border: "4px solid var(--color-surface)",
                      boxShadow: `0 0 0 3px ${USER.avatarColor}40`,
                    }}
                  >
                    {USER.avatar}
                  </div>
                  {USER.isVerified && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "1.625rem",
                        height: "1.625rem",
                        background: "#2C7DA0",
                        borderRadius: "50%",
                        border: "2px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      flexWrap: "wrap",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "1.625rem",
                        fontWeight: 800,
                        color: "var(--color-text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {USER.name}
                    </h1>
                    {USER.isVip && (
                      <span className="badge badge-vip" style={{ fontSize: "0.6875rem" }}>
                        💎 VIP Creator {USER.vipTier}K
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.625rem",
                    }}
                  >
                    {USER.username}
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.65,
                      maxWidth: "560px",
                      marginBottom: "0.875rem",
                    }}
                  >
                    {USER.bio}
                  </p>
                  {/* Meta info */}
                  <div
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      flexWrap: "wrap",
                      color: "var(--color-text-muted)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <span>📍 {USER.location}</span>
                    <span>📅 Tham gia {USER.joinDate}</span>
                    {USER.website && (
                      <a
                        href={`https://${USER.website}`}
                        style={{ color: "var(--color-primary)", textDecoration: "none" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🌐 {USER.website}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.625rem",
                    flexShrink: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    id="profile-follow-btn"
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`btn ${isFollowing ? "btn-ghost" : "btn-primary"} btn-sm`}
                    style={{ minWidth: "110px" }}
                  >
                    {isFollowing ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                        Đang theo dõi
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
                        Theo dõi
                      </>
                    )}
                  </button>
                  <button
                    id="profile-vip-btn"
                    className="btn btn-accent btn-sm"
                  >
                    💎 Đăng ký VIP
                  </button>
                  <button
                    id="profile-more-btn"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "0.425rem 0.75rem", borderRadius: "var(--radius-md)" }}
                    aria-label="Thêm tùy chọn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>
                  </button>
                </div>
              </div>

              {/* ── Stats Row ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "0",
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                {[
                  { label: "Bài viết", value: USER.stats.tutorials, icon: "📚" },
                  { label: "Người theo dõi", value: formatNumber(USER.stats.followers), icon: "👥" },
                  { label: "Đang theo dõi", value: USER.stats.following, icon: "➡️" },
                  { label: "Lượt thích", value: formatNumber(USER.stats.likes), icon: "❤️" },
                  { label: "Thành tựu", value: USER.stats.achievements, icon: "🏅" },
                  { label: "Người đã làm được", value: formatNumber(USER.stats.completedByOthers), icon: "✅" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      textAlign: "center",
                      padding: "0.5rem",
                      borderRight: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        color: "var(--color-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      {s.icon} {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              borderBottom: "2px solid var(--color-border)",
              marginBottom: "2rem",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`profile-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: activeTab === tab ? "var(--color-primary)" : "var(--color-text-muted)",
                  borderBottom: activeTab === tab ? "2px solid var(--color-primary)" : "2px solid transparent",
                  marginBottom: "-2px",
                  transition: "all var(--transition-fast)",
                  borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                }}
              >
                {tab === "Bài hướng dẫn" && "📚 "}
                {tab === "Thành tựu" && "🏅 "}
                {tab === "Cộng đồng" && "💬 "}
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div style={{ paddingBottom: "4rem" }}>
            {/* Tutorials Tab */}
            {activeTab === "Bài hướng dẫn" && (
              <div className="animate-fade-in">
                <div
                  className="tutorials-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}
                >
                  {TUTORIALS.map((t) => (
                    <article key={t.id} className="card tutorial-card" style={{ cursor: "pointer" }}>
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          aspectRatio: "4/3",
                          background: t.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "3.5rem",
                        }}
                      >
                        {t.emoji}
                        <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem" }}>
                          <span className={`badge ${t.diffClass}`}>{t.difficulty}</span>
                        </div>
                        <div style={{ position: "absolute", top: "0.625rem", right: "0.625rem" }}>
                          <span className={`badge ${t.typeClass}`}>{t.type}</span>
                        </div>
                      </div>
                      <div style={{ padding: "1rem" }}>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9375rem",
                            marginBottom: "0.75rem",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {t.title}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "var(--color-text-muted)",
                            fontSize: "0.8125rem",
                            marginBottom: "0.875rem",
                          }}
                        >
                          <span>👁 {t.views}</span>
                          <span>❤️ {t.likes}</span>
                          <span>📋 {t.steps} bước</span>
                        </div>
                        <Link
                          href={`/tutorials/${t.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Xem ngay
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "Thành tựu" && (
              <div className="animate-fade-in">
                {/* Achievement summary */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #FFF8F0 0%, #FFF5F0 100%)",
                    border: "1px solid rgba(212,113,59,0.2)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: "4rem",
                      height: "4rem",
                      background: "var(--gradient-accent)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem",
                      flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(212,113,59,0.3)",
                    }}
                  >
                    🏅
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.25rem" }}>
                      {USER.stats.achievements} thành tựu đã ghi lại
                    </div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                      Chia sẻ hành trình Origami của bạn với cộng đồng
                    </div>
                  </div>
                  <Link href="/achievements" className="btn btn-accent btn-sm">
                    Xem tất cả thành tựu
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Recent achievements grid */}
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}
                >
                  {ACHIEVEMENTS_PREVIEW.map((a) => (
                    <div key={a.id} className="card" style={{ cursor: "pointer", overflow: "hidden" }}>
                      {/* Photo placeholder */}
                      <div
                        style={{
                          aspectRatio: "4/3",
                          background: "linear-gradient(135deg, #F0F7F4 0%, #E8F5E8 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "4rem",
                          position: "relative",
                        }}
                      >
                        {a.emoji}
                        <div
                          style={{
                            position: "absolute",
                            top: "0.625rem",
                            right: "0.625rem",
                            background: a.isPublic ? "#DCFCE7" : "#F5F5F0",
                            color: a.isPublic ? "#16A34A" : "#888",
                            borderRadius: "var(--radius-full)",
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                          }}
                        >
                          {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
                        </div>
                      </div>
                      <div style={{ padding: "0.875rem" }}>
                        <h3
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            marginBottom: "0.5rem",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {a.title}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "var(--color-text-muted)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <span>📅 {a.date}</span>
                          <div style={{ display: "flex", gap: "0.75rem" }}>
                            <span>❤️ {a.likes}</span>
                            <span>💬 {a.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === "Cộng đồng" && (
              <div className="animate-fade-in">
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                  <p style={{ fontSize: "1rem" }}>Bài đăng cộng đồng sẽ hiển thị ở đây</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
