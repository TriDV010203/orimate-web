"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorLink from "./AuthorLink";
import { isLoggedIn, getToken, getUser } from "@/lib/auth";
import { achievementsApi, AchievementDto } from "@/lib/api/achievements";
import { usersApi, CreatorProfileDto } from "@/lib/api/users";
import { wishlistsApi } from "@/lib/api/wishlists";
import { tutorialsApi } from "@/lib/api/tutorials";
import type { TutorialListItemDto } from "@/lib/api/tutorials";
import type { ApiError } from "@/lib/api/client";
import { isValidImageUrl } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#2D6A4F", "#1B4332", "#40916C", "#D4713B",
  "#2C7DA0", "#7950F2", "#E03131", "#F59F00",
  "#1098AD", "#74C0FC", "#A9E34B", "#FF6B6B",
];

const TABS = ["Bài hướng dẫn", "Thành tựu", "Wishlist"] as const;
type Tab = (typeof TABS)[number];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** Nếu avatarUrl bắt đầu bằng '#' → đây là mã màu, không phải URL ảnh */
function getAvatarColor(avatarUrl?: string | null): string {
  if (avatarUrl?.startsWith("#")) return avatarUrl;
  return "#2D6A4F";
}

function getAvatarInitials(displayName?: string | null): string {
  return (displayName?.trim() || "?").charAt(0).toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Bài hướng dẫn");
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<CreatorProfileDto | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatarColor: "#2D6A4F",
  });

  // Tutorials preview (bài hướng dẫn của bản thân)
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);

  // Achievements preview
  const [achievementsPreview, setAchievementsPreview] = useState<AchievementDto[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  // Wishlist preview
  const [wishlistItems, setWishlistItems] = useState<TutorialListItemDto[]>([]);
  const [wishlistSavedAt, setWishlistSavedAt] = useState<Record<string, string>>({});
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistTotal, setWishlistTotal] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const token = getToken();
      const storedUser = getUser();
      const loggedIn = isLoggedIn();

      setIsOwnProfile(loggedIn);

      if (!token || !storedUser || !loggedIn) {
        setProfileLoading(false);
        return;
      }

      try {
        const data = await usersApi.getProfile(storedUser.userId, token);
        setProfile(data);
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          avatarColor: getAvatarColor(data.avatarUrl),
        });
      } catch {
        setProfileError("Không thể tải hồ sơ. Vui lòng thử lại.");
      } finally {
        setProfileLoading(false);
      }
    }

    load();

    function onAuthChange() { load(); }
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  // ── Load own tutorials when tab active ─────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Bài hướng dẫn") return;
    const storedUser = getUser();
    if (!storedUser) return;
    const tok = getToken() ?? undefined;
    setTutorialsLoading(true);
    tutorialsApi.getList({ authorId: storedUser.userId, pageSize: 6 }, tok)
      .then((r) => setTutorials(r.items.filter((t) => t.author.id === storedUser.userId)))
      .catch(() => {})
      .finally(() => setTutorialsLoading(false));
  }, [activeTab]);

  // ── Load achievements preview when tab active ─────────────────────────────
  useEffect(() => {
    if (activeTab !== "Thành tựu") return;
    const tok = getToken();
    if (!tok) return;
    setAchievementsLoading(true);
    achievementsApi.getMine(tok, 1, 3)
      .then((r) => setAchievementsPreview(r.items))
      .catch(() => {})
      .finally(() => setAchievementsLoading(false));
  }, [activeTab]);

  // ── Load wishlist preview when tab active ─────────────────────────────────
  useEffect(() => {
    if (activeTab !== "Wishlist") return;
    const tok = getToken();
    if (!tok) return;
    setWishlistLoading(true);
    wishlistsApi.getMyWishlist(tok, { pageSize: 6 })
      .then((res) => {
        const tutorials: TutorialListItemDto[] = [];
        const atMap: Record<string, string> = {};
        for (const item of res.items) {
          if (item.tutorial) {
            tutorials.push(item.tutorial);
            atMap[item.tutorial.id] = item.savedAt;
          }
        }
        setWishlistItems(tutorials);
        setWishlistSavedAt(atMap);
        setWishlistTotal(tutorials.length);
      })
      .catch(() => {})
      .finally(() => setWishlistLoading(false));
  }, [activeTab]);

  // ── Close modal on Escape ─────────────────────────────────────────────────
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

  // ── Open modal: reset form to current profile ─────────────────────────────
  function openEdit() {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      avatarColor: getAvatarColor(profile.avatarUrl),
    });
    setSaveError(null);
    setEditOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    const storedUser = getUser();
    if (!token || !storedUser) return;

    setSaving(true);
    setSaveError(null);

    try {
      await usersApi.updateProfile(token, {
        displayName: form.displayName.trim(),
        avatarUrl: form.avatarColor,   // lưu mã màu vào avatarUrl
        bio: form.bio.trim() || null,
      });

      // Refresh profile data
      const updated = await usersApi.getProfile(storedUser.userId, token);
      setProfile(updated);

      setSaved(true);
      setEditOpen(false);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      const apiErr = err as ApiError;
      setSaveError(apiErr?.message ?? "Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  // ── Derived display values ────────────────────────────────────────────────
  const avatarColor = getAvatarColor(profile?.avatarUrl);
  const avatarInitials = getAvatarInitials(profile?.displayName);
  const coverGradient = `linear-gradient(135deg, ${avatarColor}CC 0%, ${avatarColor} 100%)`;

  // ── Render: loading / error / not logged in ───────────────────────────────
  if (profileLoading) {
    return (
      <>
        <Navbar />
        <main style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
            <div style={{ display: "inline-block", width: "2.5rem", height: "2.5rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ marginTop: "1rem" }}>Đang tải hồ sơ...</p>
          </div>
        </main>
        <Footer />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (!isOwnProfile || profileError) {
    return (
      <>
        <Navbar />
        <main style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h2 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>
              {profileError ?? "Bạn chưa đăng nhập"}
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
              {profileError
                ? "Không thể tải thông tin hồ sơ."
                : "Đăng nhập để xem và chỉnh sửa hồ sơ của bạn."}
            </p>
            <Link href="/dang-nhap" className="btn btn-primary">
              Đăng nhập ngay
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

        {/* ── Cover Photo ── */}
        <div style={{ height: "260px", background: coverGradient, position: "relative", overflow: "hidden" }}>
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

          {/* VIP / role badges */}
          {profile?.roles && profile.roles.length > 0 && (
            <div style={{ position: "absolute", top: "1.5rem", right: "2rem", display: "flex", gap: "0.5rem" }}>
              {profile.roles.includes("Creator") && (
                <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-full)", padding: "0.375rem 0.75rem", fontSize: "0.8125rem", color: "white", fontWeight: 600 }}>
                  ✏️ Creator
                </div>
              )}
              {profile.roles.includes("Admin") && (
                <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-full)", padding: "0.375rem 0.75rem", fontSize: "0.8125rem", color: "white", fontWeight: 600 }}>
                  🛡️ Admin
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile Header ── */}
        <div className="container">
          <div style={{ position: "relative", marginTop: "-5rem", marginBottom: "2rem" }}>
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "1.75rem 2rem", boxShadow: "var(--shadow-lg)", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>

                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {isValidImageUrl(profile?.avatarUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      style={{ width: "6rem", height: "6rem", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--color-surface)", boxShadow: `0 0 0 3px ${avatarColor}40` }}
                    />
                  ) : (
                    <div style={{ width: "6rem", height: "6rem", borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.75rem", border: "4px solid var(--color-surface)", boxShadow: `0 0 0 3px ${avatarColor}40` }}>
                      {avatarInitials}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                    <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                      {profile?.displayName || "Người dùng"}
                    </h1>
                    {profile?.roles?.includes("Creator") && (
                      <span className="badge badge-vip" style={{ fontSize: "0.6875rem" }}>✏️ Creator</span>
                    )}
                  </div>

                  {profile?.bio ? (
                    <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: "560px", marginBottom: "0.875rem" }}>
                      {profile.bio}
                    </p>
                  ) : (
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: "0.875rem" }}>
                      Chưa có tiểu sử. Hãy chỉnh sửa hồ sơ để thêm!
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0, flexWrap: "wrap" }}>
                  <button
                    onClick={openEdit}
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
                    href="/studio"
                    className="btn btn-outline btn-sm"
                    style={{ minWidth: "110px", justifyContent: "center" }}
                  >
                    🎬 Creator Studio
                  </Link>
                  <Link
                    href="/ho-so/thanh-tich"
                    className="btn btn-outline btn-sm"
                    style={{ minWidth: "110px", justifyContent: "center" }}
                  >
                    🏅 Thành tựu
                  </Link>
                  <Link
                    href="/ho-so/doi-mat-khau"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: "110px", justifyContent: "center" }}
                  >
                    🔑 Đổi mật khẩu
                  </Link>
                </div>
              </div>

              {/* ── Stats Row ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-border)" }}>
                {[
                  { label: "Bài viết", value: formatNumber(profile?.postCount ?? 0), icon: "📚", tab: "Bài hướng dẫn" as Tab | null, href: null },
                  { label: "Người theo dõi", value: formatNumber(profile?.followerCount ?? 0), icon: "👥", tab: null, href: "/ho-so/nguoi-theo-doi" },
                  { label: "Đang theo dõi", value: formatNumber(profile?.followingCount ?? 0), icon: "➡️", tab: null, href: "/ho-so/dang-theo-doi" },
                  { label: "Thành tựu", value: formatNumber(profile?.achievementCount ?? 0), icon: "🏅", tab: "Thành tựu" as Tab | null, href: null },
                ].map((s, i, arr) => {
                  const cellStyle = {
                    textAlign: "center" as const,
                    padding: "0.5rem",
                    borderRight: i < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                    cursor: s.tab || s.href ? "pointer" : "default",
                    transition: "background var(--transition-fast)",
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                    display: "block",
                  };
                  const content = (
                    <>
                      <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--color-primary)", lineHeight: 1 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                        {s.icon} {s.label}
                      </div>
                    </>
                  );
                  if (s.href) {
                    return (
                      <Link key={s.label} href={s.href} style={cellStyle}>
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <div
                      key={s.label}
                      onClick={() => { if (s.tab) setActiveTab(s.tab); }}
                      style={cellStyle}
                      onMouseEnter={(e) => { if (s.tab) (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface-2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: "0.25rem", borderBottom: "2px solid var(--color-border)", marginBottom: "2rem" }}>
            {TABS.map((tab) => (
              <button
                key={tab}
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
                {tab === "Wishlist" && "🔖 "}
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div style={{ paddingBottom: "4rem" }}>

            {/* Tutorials Tab */}
            {activeTab === "Bài hướng dẫn" && (
              <div className="animate-fade-in">
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                      📚 Bài hướng dẫn đã đăng
                    </h2>
                    {!tutorialsLoading && (
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                        {formatNumber(profile?.postCount ?? tutorials.length)} bài viết
                      </p>
                    )}
                  </div>
                  <Link href="/studio" className="btn btn-outline btn-sm">
                    Quản lý trong Studio
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Loading */}
                {tutorialsLoading && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                    <div style={{ display: "inline-block", width: "2rem", height: "2rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  </div>
                )}

                {/* Empty */}
                {!tutorialsLoading && tutorials.length === 0 && (
                  <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-text-muted)", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                    <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Chưa có bài hướng dẫn nào</p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>Các bài hướng dẫn của bạn sẽ hiện ở đây.</p>
                    <Link href="/studio" className="btn btn-primary" style={{ textDecoration: "none" }}>Tạo bài hướng dẫn</Link>
                  </div>
                )}

                {/* Grid */}
                {!tutorialsLoading && tutorials.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem" }}>
                    {tutorials.map((t) => (
                      <Link
                        key={t.id}
                        href={t.type?.toLowerCase() === "vip" ? `/huong-dan/${t.slug}/vip` : `/huong-dan/${t.slug}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <div
                          className="card"
                          style={{ overflow: "hidden", cursor: "pointer", transition: "transform var(--transition-normal), box-shadow var(--transition-normal)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"; }}
                        >
                          <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative", overflow: "hidden" }}>
                            {isValidImageUrl(t.coverImageUrl)
                              ? <img src={t.coverImageUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                              : "📄"
                            }
                            <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem" }}>
                              <span style={{ background: t.type?.toLowerCase() === "vip" ? "#FEF3C7" : "#D1FAE5", color: t.type?.toLowerCase() === "vip" ? "#92400E" : "#065F46", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
                                {t.type?.toLowerCase() === "vip" ? "VIP" : "Miễn phí"}
                              </span>
                            </div>
                          </div>
                          <div style={{ padding: "0.875rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.375rem", color: "var(--color-text-primary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {t.title}
                            </h3>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "flex", justifyContent: "space-between" }}>
                              <span>{t.categoryName}</span>
                              <span>{t.stepCount} bước</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "Thành tựu" && (
              <div className="animate-fade-in">
                <div style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFF5F0 100%)", border: "1px solid rgba(212,113,59,0.2)", borderRadius: "var(--radius-lg)", padding: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                  <div style={{ width: "4rem", height: "4rem", background: "var(--gradient-accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0, boxShadow: "0 4px 16px rgba(212,113,59,0.3)" }}>
                    🏅
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.25rem" }}>
                      {profile?.achievementCount ?? 0} thành tựu đã ghi lại
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
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"; }}
                        >
                          <div style={{ aspectRatio: "4/3", background: a.photoUrl ? "var(--color-surface-2)" : "linear-gradient(135deg, #F0F7F4 0%, #E8F5E8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative", overflow: "hidden" }}>
                            {a.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.photoUrl} alt={a.tutorialTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : "🏅"}
                            <div style={{ position: "absolute", top: "0.625rem", right: "0.625rem", background: a.isPublic ? "#DCFCE7" : "#F5F5F0", color: a.isPublic ? "#16A34A" : "#888", borderRadius: "var(--radius-full)", padding: "0.2rem 0.5rem", fontSize: "0.6875rem", fontWeight: 600 }}>
                              {a.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
                            </div>
                          </div>
                          <div style={{ padding: "0.875rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>{a.tutorialTitle}</h3>
                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                              📅 {formatDate(a.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "Wishlist" && (
              <div className="animate-fade-in">
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                      🔖 Danh sách yêu thích
                    </h2>
                    {!wishlistLoading && (
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                        {wishlistTotal} bài đã lưu
                      </p>
                    )}
                  </div>
                  <Link href="/danh-sach-yeu-thich" className="btn btn-outline btn-sm">
                    Xem tất cả
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                </div>

                {/* Loading */}
                {wishlistLoading && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                    <div style={{ display: "inline-block", width: "2rem", height: "2rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  </div>
                )}

                {/* Empty */}
                {!wishlistLoading && wishlistItems.length === 0 && (
                  <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--color-text-muted)", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔖</div>
                    <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Chưa có bài nào được lưu</p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>Lưu bài hướng dẫn yêu thích để xem lại sau.</p>
                    <Link href="/huong-dan" className="btn btn-primary" style={{ textDecoration: "none" }}>Khám phá thư viện</Link>
                  </div>
                )}

                {/* Grid */}
                {!wishlistLoading && wishlistItems.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
                    {wishlistItems.map((t) => {
                      const savedDate = wishlistSavedAt[t.id];
                      return (
                        <Link
                          key={t.id}
                          href={t.type?.toLowerCase() === "vip" ? `/huong-dan/${t.slug}/vip` : `/huong-dan/${t.slug}`}
                          style={{ textDecoration: "none", display: "block" }}
                        >
                          <div
                            className="card"
                            style={{ overflow: "hidden", cursor: "pointer", transition: "transform var(--transition-normal), box-shadow var(--transition-normal)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)"; }}
                          >
                            <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative", overflow: "hidden" }}>
                              {isValidImageUrl(t.coverImageUrl)
                                ? <img src={t.coverImageUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                                : "📄"
                              }
                              <div style={{ position: "absolute", top: "0.625rem", left: "0.625rem" }}>
                                <span style={{ background: t.type?.toLowerCase() === "vip" ? "#FEF3C7" : "#D1FAE5", color: t.type?.toLowerCase() === "vip" ? "#92400E" : "#065F46", fontSize: "0.6875rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
                                  {t.type?.toLowerCase() === "vip" ? "VIP" : "Miễn phí"}
                                </span>
                              </div>
                            </div>
                            <div style={{ padding: "0.875rem" }}>
                              {savedDate && (
                                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                                  🔖 {formatDate(savedDate)}
                                </div>
                              )}
                              <h3 style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.375rem", color: "var(--color-text-primary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {t.title}
                              </h3>
                              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "flex", justifyContent: "space-between" }}>
                                <AuthorLink authorId={t.author.id}>{t.author.displayName}</AuthorLink>
                                <span>{t.stepCount} bước</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* View all link if there are more items */}
                {!wishlistLoading && wishlistTotal > 6 && (
                  <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <Link href="/danh-sach-yeu-thich" className="btn btn-outline">
                      Xem thêm {wishlistTotal - 6} bài khác
                    </Link>
                  </div>
                )}
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
          style={{ position: "fixed", inset: 0, background: "rgba(10,20,15,0.55)", backdropFilter: "blur(6px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease" }}
        >
          <div
            ref={modalRef}
            style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto", animation: "slideUp 0.22s ease", border: "1px solid var(--color-border)" }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, background: "var(--color-surface)", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-md)", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                  ✏️
                </div>
                <h2 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Chỉnh sửa hồ sơ</h2>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                aria-label="Đóng"
                style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: "none", background: "var(--color-surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "1.1rem", transition: "background var(--transition-fast)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-border)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)")}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Avatar preview + color picker */}
              <div>
                <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)", display: "block", marginBottom: "0.75rem" }}>
                  Màu avatar
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: form.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.25rem", flexShrink: 0, border: "3px solid var(--color-surface)", boxShadow: `0 0 0 3px ${form.avatarColor}50`, transition: "background var(--transition-normal)" }}>
                    {(form.displayName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, avatarColor: color }))}
                        title={color}
                        style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", background: color, border: form.avatarColor === color ? "3px solid var(--color-text-primary)" : "2px solid transparent", cursor: "pointer", transition: "transform var(--transition-fast), border var(--transition-fast)", transform: form.avatarColor === color ? "scale(1.18)" : "scale(1)" }}
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

              {/* Bio */}
              <div className="input-group">
                <label className="input-label" htmlFor="modal-bio">Tiểu sử</label>
                <textarea
                  id="modal-bio"
                  name="bio"
                  className="input-field"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Chia sẻ về bản thân, đam mê Origami của bạn..."
                  maxLength={300}
                  style={{ resize: "vertical" }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {form.bio.length}/300
                </span>
              </div>

              {/* Error message */}
              {saveError && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving || !form.displayName.trim()}
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
                  disabled={saving}
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
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "var(--radius-lg)", padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "0.625rem", color: "#15803D", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)", zIndex: 600, animation: "slideUp 0.22s ease" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Hồ sơ đã được cập nhật thành công!
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
