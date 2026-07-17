"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { isLoggedIn, getToken } from "@/lib/auth";
import { achievementsApi, AchievementDto } from "@/lib/api/achievements";


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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const TABS = ["Bài hướng dẫn", "Thành tựu", "Cộng đồng"] as const;
type Tab = (typeof TABS)[number];

const AVATAR_COLORS = [
  "#2D6A4F", "#1B4332", "#40916C", "#D4713B",
  "#2C7DA0", "#7950F2", "#E03131", "#F59F00",
  "#1098AD", "#74C0FC", "#A9E34B", "#FF6B6B",
];

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Bài hướng dẫn");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    displayName: USER.name,
    username: USER.username,
    bio: USER.bio,
    location: USER.location,
    website: USER.website,
    avatarColor: USER.avatarColor,
  });
  const [achievementsPreview, setAchievementsPreview] = useState<AchievementDto[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function refreshAuth() {
      setIsOwnProfile(isLoggedIn());
    }
    refreshAuth();
    window.addEventListener("authChange", refreshAuth);
    window.addEventListener("storage", refreshAuth);
    return () => {
      window.removeEventListener("authChange", refreshAuth);
      window.removeEventListener("storage", refreshAuth);
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "Thành tựu") return;
    const tok = getToken();
    if (!tok) return;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAchievementsLoading(true);

    achievementsApi.getMine(tok, 1, 3)
      .then((r) => setAchievementsPreview(r.items))
      .catch(() => {})
      .finally(() => setAchievementsLoading(false));
  }, [activeTab]);

  // Close modal on Escape
  useEffect(() => {
    if (!editOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setEditOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [editOpen]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: gọi PUT /api/users/me khi BE có endpoint
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setEditOpen(false);
    setTimeout(() => setSaved(false), 3500);
  }


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
                  {isOwnProfile ? (
                    // Trang của chính mình → hiện nút chỉnh sửa
                    <>
                      <button
                        id="profile-edit-btn"
                        onClick={() => setEditOpen(true)}
                        className="btn btn-primary btn-sm"
                        style={{ minWidth: "130px", justifyContent: "center" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Chỉnh sửa hồ sơ
                      </button>
                      <Link
                        id="profile-achievements-btn"
                        href="/ho-so/thanh-tich"
                        className="btn btn-outline btn-sm"
                        style={{ minWidth: "110px", justifyContent: "center" }}
                      >
                        🏅 Thành tựu
                      </Link>
                    </>
                  ) : (
                    // Trang người khác → hiện nút follow / VIP
                    <>
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
                    </>
                  )}
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
                  { label: "Bài viết", value: USER.stats.tutorials, icon: "📚", tab: "Bài hướng dẫn" as Tab | null, href: null },
                  { label: "Người theo dõi", value: formatNumber(USER.stats.followers), icon: "👥", tab: null, href: null },
                  { label: "Đang theo dõi", value: USER.stats.following, icon: "➡️", tab: null, href: null },
                  { label: "Lượt thích", value: formatNumber(USER.stats.likes), icon: "❤️", tab: null, href: null },
                  { label: "Thành tựu", value: USER.stats.achievements, icon: "🏅", tab: "Thành tựu" as Tab | null, href: "/profile/achievements" },
                  { label: "Người đã làm được", value: formatNumber(USER.stats.completedByOthers), icon: "✅", tab: null, href: null },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    onClick={() => {
                      if (s.tab) setActiveTab(s.tab);
                    }}
                    style={{
                      textAlign: "center",
                      padding: "0.5rem",
                      borderRight: i < 5 ? "1px solid var(--color-border)" : "none",
                      cursor: s.tab ? "pointer" : "default",
                      transition: "background var(--transition-fast)",
                      borderRadius: "var(--radius-sm)",
                    }}
                    onMouseEnter={(e) => {
                      if (s.tab) (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: 800,
                        color: s.tab ? "var(--color-primary)" : "var(--color-primary)",
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
                          href={`/huong-dan/${t.id}`}
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
                  <Link href="/ho-so/thanh-tich" className="btn btn-accent btn-sm">
                    Xem tất cả thành tựu
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Recent achievements grid */}
                {achievementsLoading ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                    <div style={{ display: "inline-block", width: "2rem", height: "2rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  </div>
                ) : achievementsPreview.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏅</div>
                    <p style={{ fontSize: "0.875rem" }}>Chưa có thành tựu nào. Hãy thêm thành tựu đầu tiên!</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
                    {achievementsPreview.map((a) => (
                      <Link key={a.id} href="/ho-so/thanh-tich" style={{ textDecoration: "none", display: "block" }}>
                        <div
                          className="card"
                          style={{ cursor: "pointer", overflow: "hidden", transition: "transform var(--transition-normal), box-shadow var(--transition-normal)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
                          }}
                        >
                          <div
                            style={{
                              aspectRatio: "4/3",
                              background: a.photoUrl ? "var(--color-surface-2)" : "linear-gradient(135deg, #F0F7F4 0%, #E8F5E8 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "4rem",
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
                            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                              {a.tutorialTitle}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                              <span>📅 {formatDate(a.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,20,15,0.55)",
            backdropFilter: "blur(6px)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.18s ease",
          }}
        >
          <div
            ref={modalRef}
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "slideUp 0.22s ease",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--color-border)",
                position: "sticky",
                top: 0,
                background: "var(--color-surface)",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  ✏️
                </div>
                <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
                  Chỉnh sửa hồ sơ
                </h2>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                aria-label="Đóng"
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--color-surface-2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "1.1rem",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)")}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Avatar color */}
              <div>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)", display: "block", marginBottom: "0.75rem" }}>
                  Màu avatar
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "50%",
                      background: form.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      flexShrink: 0,
                      border: "3px solid var(--color-surface)",
                      boxShadow: `0 0 0 3px ${form.avatarColor}50`,
                      transition: "background var(--transition-normal)",
                    }}
                  >
                    {form.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, avatarColor: color }))}
                        title={color}
                        style={{
                          width: "1.875rem",
                          height: "1.875rem",
                          borderRadius: "50%",
                          background: color,
                          border: form.avatarColor === color ? "3px solid var(--color-text-primary)" : "2px solid transparent",
                          cursor: "pointer",
                          transition: "transform var(--transition-fast), border var(--transition-fast)",
                          transform: form.avatarColor === color ? "scale(1.18)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div className="input-group">
                <label className="input-label" htmlFor="modal-displayName">
                  Tên hiển thị <span style={{ color: "#E03131" }}>*</span>
                </label>
                <input
                  id="modal-displayName"
                  name="displayName"
                  className="input-field"
                  type="text"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="Tên của bạn"
                  required
                  maxLength={60}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {form.displayName.length}/60
                </span>
              </div>

              {/* Username */}
              <div className="input-group">
                <label className="input-label" htmlFor="modal-username">Username</label>
                <input
                  id="modal-username"
                  name="username"
                  className="input-field"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="@username"
                  maxLength={40}
                />
              </div>

              {/* Bio */}
              <div className="input-group">
                <label className="input-label" htmlFor="modal-bio">Tiểu sử</label>
                <textarea
                  id="modal-bio"
                  name="bio"
                  className="input-field"
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Chia sẻ về bản thân..."
                  maxLength={300}
                  style={{ resize: "vertical" }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {form.bio.length}/300
                </span>
              </div>

              {/* Location & Website */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="modal-location">Địa điểm</label>
                  <input
                    id="modal-location"
                    name="location"
                    className="input-field"
                    type="text"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="VD: Hà Nội, Việt Nam"
                    maxLength={80}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="modal-website">Website</label>
                  <input
                    id="modal-website"
                    name="website"
                    className="input-field"
                    type="text"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="VD: yoursite.com"
                    maxLength={120}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                  id="modal-save-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span style={{ display: "inline-block", width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setEditOpen(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success toast */}
      {saved && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            background: "#DCFCE7",
            border: "1px solid #86EFAC",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            color: "#15803D",
            fontWeight: 600,
            fontSize: "0.9rem",
            boxShadow: "var(--shadow-lg)",
            zIndex: 600,
            animation: "slideUp 0.22s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Hồ sơ đã được cập nhật thành công!
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>
    </>
  );
}
