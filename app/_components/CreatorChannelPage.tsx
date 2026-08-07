"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { usersApi, tutorialsApi, type CreatorProfileDto, type TutorialListItemDto } from "@/lib/api";
import { achievementsApi, type AchievementDto } from "@/lib/api/achievements";
import { subscriptionsApi, VIP_FIXED_PRICE_VND, type MySubscriptionDto, type PaymentInstructionDto } from "@/lib/api/subscriptions";
import { getToken } from "@/lib/auth";
import { isValidImageUrl, getAvatarColor, getAvatarInitial } from "@/lib/utils";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatAchievementDate(dateStr: string): string {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

function getDiffClass(d?: string | null) {
  if (d === "Dễ" || d === "Easy") return "badge-easy";
  if (d === "Trung bình" || d === "Medium") return "badge-medium";
  return "badge-hard";
}

function getTypeLabel(t: string) {
  return t === "Free" ? "Miễn phí" : t;
}

interface Props {
  userId: string;
}

export default function CreatorChannelPage({ userId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tutorials" | "about" | "vip" | "achievements">("tutorials");
  const [filterType, setFilterType] = useState<"all" | "free" | "vip">("all");

  // VIP subscribe widget
  const [mySubscription, setMySubscription] = useState<MySubscriptionDto | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstructionDto | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [profile, setProfile] = useState<CreatorProfileDto | null>(null);
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTutorials, setLoadingTutorials] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken() ?? undefined;
    async function loadProfile() {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const data = await usersApi.getProfile(userId, token);
        setProfile(data);
        setFollowing(data.isFollowing);
      } catch {
        setProfileError("Không tìm thấy hồ sơ người dùng này.");
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [userId]);

  // BE không hỗ trợ lọc theo authorId trên GET /api/tutorials → tự lọc phía client
  useEffect(() => {
    async function loadTutorials() {
      setLoadingTutorials(true);
      try {
        const result = await tutorialsApi.getList({ sortBy: "date", pageSize: 100 });
        setTutorials(result.items.filter((t) => t.author.id === userId));
      } catch {
        setTutorials([]);
      } finally {
        setLoadingTutorials(false);
      }
    }
    loadTutorials();
  }, [userId]);

  useEffect(() => {
    async function loadAchievements() {
      setLoadingAchievements(true);
      setAchievementsError(null);
      try {
        const result = await achievementsApi.getByUser(userId, 1, 24);
        setAchievements(result.items);
      } catch {
        setAchievementsError("Không thể tải thành tựu.");
      } finally {
        setLoadingAchievements(false);
      }
    }
    loadAchievements();
  }, [userId]);

  useEffect(() => {
    const token = getToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) { setLoadingSubscription(false); return; }
    subscriptionsApi.getMySubscriptions(token, { pageSize: 50 })
      .then(result => {
        const active = result.items.find(s => s.creatorId === userId && s.status === "Active");
        setMySubscription(active ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingSubscription(false));
  }, [userId]);

  async function handleSubscribe() {
    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }
    setSubscribing(true);
    setSubscribeError(null);
    try {
      const result = await subscriptionsApi.subscribe(token, userId);
      setPendingTransactionId(result.transaction.id);
      setPaymentInstruction(result.paymentInstruction);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setSubscribeError(apiErr.message ?? "Không thể đăng ký VIP. Vui lòng thử lại.");
    } finally {
      setSubscribing(false);
    }
  }

  // Poll trạng thái giao dịch trong lúc chờ SePay tự động xác nhận qua webhook.
  useEffect(() => {
    if (!pendingTransactionId) return;
    const token = getToken();
    if (!token) return;

    pollRef.current = setInterval(async () => {
      try {
        const tx = await subscriptionsApi.getTransaction(token, pendingTransactionId);
        if (tx.status === "Confirmed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setSubscribeSuccess(true);
          setPendingTransactionId(null);
        }
      } catch {
        // lỗi mạng tạm thời — tiếp tục poll, lần sau thử lại
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingTransactionId]);

  async function handleFollow() {
    const token = getToken();
    if (!token) return;
    setFollowLoading(true);
    try {
      const res = await usersApi.toggleFollow(token, userId);
      setFollowing(res.isFollowing);
      if (profile) {
        setProfile({ ...profile, followerCount: profile.followerCount + (res.isFollowing ? 1 : -1) });
      }
    } catch {
      // ignore
    } finally {
      setFollowLoading(false);
    }
  }

  const filtered = tutorials.filter((t) => {
    if (filterType === "free") return t.type === "Free" || t.type === "Miễn phí";
    if (filterType === "vip") return t.type === "VIP";
    return true;
  });

  const vipCount = tutorials.filter((t) => t.type === "VIP").length;
  const aColor = getAvatarColor(profile?.avatarUrl);
  const initial = getAvatarInitial(profile?.displayName);

  // Loading state
  if (loadingProfile) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "1rem", color: "var(--color-text-muted)" }}>Đang tải hồ sơ...</div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>😕</div>
          <h2 style={{ color: "var(--color-text-primary)", fontWeight: 700 }}>{profileError ?? "Không tìm thấy người dùng"}</h2>
          <Link href="/" className="btn btn-outline">Về trang chủ</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

        {/* ── Cover ── */}
        <div style={{ background: `linear-gradient(135deg, #1B4332 0%, ${aColor} 50%, #40916C 100%)`, height: "220px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, fontSize: "12rem", opacity: 0.1, lineHeight: 1, userSelect: "none" }}>🐉</div>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* ── Profile Row ── */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1.25rem" }}>
              <div style={{ width: "6rem", height: "6rem", borderRadius: "50%", background: aColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "white", border: "4px solid var(--color-surface)", boxShadow: "var(--shadow-md)", flexShrink: 0, marginTop: "-3rem" }}>
                {initial}
              </div>
              <div style={{ paddingBottom: "0.375rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <h1 style={{ fontWeight: 800, fontSize: "1.625rem", color: "var(--color-text-primary)", lineHeight: 1 }}>{profile.displayName}</h1>
                  {profile.roles.includes("ContributorReviewer") && <span className="badge badge-vip" style={{ fontSize: "0.7rem" }}>Creator</span>}
                </div>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  {profile.isSuspended && <span style={{ color: "var(--color-error)", fontWeight: 600 }}>Tài khoản bị tạm khóa • </span>}
                  ID: {userId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", paddingBottom: "0.375rem" }}>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={following ? "btn btn-outline" : "btn btn-primary"}
                style={{ padding: "0.625rem 1.5rem", fontSize: "0.875rem", opacity: followLoading ? 0.7 : 1 }}>
                {following ? "✓ Đang theo dõi" : "+ Theo dõi"}
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
            {[
              { label: "Bài hướng dẫn", value: tutorials.length || profile.postCount, href: null, onClick: null },
              { label: "Người theo dõi", value: formatNumber(profile.followerCount), href: `/kenh/${userId}/nguoi-theo-doi`, onClick: null },
              { label: "Đang theo dõi", value: profile.followingCount, href: `/kenh/${userId}/dang-theo-doi`, onClick: null },
              { label: "Thành tựu", value: loadingAchievements ? profile.achievementCount : achievements.length, href: null, onClick: () => setActiveTab("achievements") },
            ].map((s) =>
              s.href ? (
                <Link key={s.label} href={s.href} style={{ textAlign: "center", textDecoration: "none" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
                </Link>
              ) : s.onClick ? (
                <button
                  key={s.label}
                  onClick={s.onClick}
                  style={{ textAlign: "center", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
                </button>
              ) : (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--color-primary)", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{s.label}</div>
                </div>
              )
            )}
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: "0", borderBottom: "2px solid var(--color-border)", marginBottom: "2rem" }}>
            {(
              [
                ["tutorials", "📚 Bài hướng dẫn"] as [typeof activeTab, string],
                ["achievements", "🏅 Thành tựu"] as [typeof activeTab, string],
                ...(vipCount > 0 ? [["vip", "⭐ VIP"] as [typeof activeTab, string]] : []),
                ["about", "👤 Giới thiệu"] as [typeof activeTab, string],
              ]
            )
              .map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: "0.875rem 1.5rem", border: "none", background: "none", borderBottom: `2.5px solid ${activeTab === key ? "var(--color-primary)" : "transparent"}`, marginBottom: "-2px", color: activeTab === key ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: activeTab === key ? 700 : 500, fontSize: "0.9375rem", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Tutorials tab ── */}
          {activeTab === "tutorials" && (
            <div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {([["all", "Tất cả"], ["free", "Miễn phí"], ["vip", "VIP"]] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setFilterType(key)}
                    style={{ padding: "0.375rem 1rem", borderRadius: "var(--radius-full)", border: `1.5px solid ${filterType === key ? "var(--color-primary)" : "var(--color-border)"}`, background: filterType === key ? "var(--color-primary)" : "transparent", color: filterType === key ? "white" : "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
                <span style={{ marginLeft: "auto", fontSize: "0.875rem", color: "var(--color-text-muted)", alignSelf: "center" }}>{filtered.length} bài</span>
              </div>

              {loadingTutorials ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem" }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite" }}>
                      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)" }} />
                      <div style={{ padding: "0.875rem" }}>
                        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.5rem" }} />
                        <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", marginBottom: "3rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                  <p style={{ color: "var(--color-text-muted)" }}>Chưa có bài hướng dẫn nào.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem", marginBottom: "3rem" }}>
                  {filtered.map((t) => (
                    <article key={t.id} className="card" style={{ overflow: "hidden" }}>
                      <Link href={`/huong-dan/${t.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                        <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative", overflow: "hidden" }}>
                          {isValidImageUrl(t.coverImageUrl)
                            ? <img src={t.coverImageUrl} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                            : "📄"
                          }
                          <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
                            <span className={`badge ${t.type === "VIP" ? "badge-vip" : "badge-free"}`}>{getTypeLabel(t.type)}</span>
                          </div>
                        </div>
                        <div style={{ padding: "0.875rem" }}>
                          <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{t.title}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            {t.difficulty && <span className={`badge ${getDiffClass(t.difficulty)}`}>{t.difficulty}</span>}
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.stepCount} bước</span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Achievements tab ── */}
          {activeTab === "achievements" && (
            <div style={{ marginBottom: "3rem" }}>
              {loadingAchievements ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem" }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", animation: "pulse 1.5s ease-in-out infinite" }}>
                      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)" }} />
                      <div style={{ padding: "0.875rem" }}>
                        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.5rem" }} />
                        <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : achievementsError ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                  <p style={{ color: "var(--color-text-muted)" }}>{achievementsError}</p>
                </div>
              ) : achievements.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏅</div>
                  <p style={{ color: "var(--color-text-muted)" }}>{profile.displayName} chưa có thành tựu công khai nào.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "1.25rem" }}>
                  {achievements.map((a) => (
                    <article key={a.id} className="card" style={{ overflow: "hidden" }}>
                      <div style={{ aspectRatio: "4/3", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", position: "relative", overflow: "hidden" }}>
                        {isValidImageUrl(a.photoUrl)
                          ? <img src={a.photoUrl!} alt={a.tutorialTitle} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                          : "🏅"
                        }
                      </div>
                      <div style={{ padding: "0.875rem" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{a.tutorialTitle}</h3>
                        {a.note && (
                          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "0.625rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {a.note}
                          </p>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Link href={`/huong-dan/${a.tutorialSlug}`} style={{ fontSize: "0.75rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
                            📚 Xem bài hướng dẫn
                          </Link>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{formatAchievementDate(a.createdAt)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── VIP tab ── */}
          {activeTab === "vip" && (
            <div style={{ maxWidth: "480px", marginBottom: "3rem" }}>
              {loadingSubscription ? (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Đang tải…
                </div>
              ) : mySubscription ? (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "2px solid #059669", padding: "1.75rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#059669", marginBottom: "0.5rem" }}>
                    Bạn là VIP của {profile.displayName}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    Còn <strong>{mySubscription.daysRemaining} ngày</strong> · Hết hạn {new Date(mySubscription.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ) : subscribeSuccess ? (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--color-border)", padding: "1.75rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Thanh toán thành công!</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                    VIP của bạn đã được kích hoạt.
                  </p>
                </div>
              ) : paymentInstruction ? (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "2px solid var(--color-accent)", padding: "1.75rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                    Quét mã để thanh toán
                  </h3>

                  <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                    <img
                      src={paymentInstruction.qrCodeUrl}
                      alt="QR chuyển khoản SePay"
                      style={{ width: "100%", maxWidth: "220px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)" }}
                    />
                  </div>

                  <div style={{ background: "#F0F9FF", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.25rem", border: "1.5px solid #BAE6FD" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0369A1", marginBottom: "0.5rem" }}>💳 Hoặc chuyển khoản thủ công:</p>
                    <ol style={{ margin: 0, padding: "0 0 0 1.25rem", fontSize: "0.8125rem", color: "#0C4A6E", lineHeight: 1.7 }}>
                      <li>Ngân hàng: <strong>{paymentInstruction.bankName}</strong></li>
                      <li>Số tài khoản: <strong>{paymentInstruction.bankAccountNumber}</strong> ({paymentInstruction.accountHolderName})</li>
                      <li>Số tiền: <strong>{formatCurrency(paymentInstruction.amount)}</strong></li>
                      <li>Nội dung (bắt buộc đúng nguyên văn): <strong style={{ fontFamily: "monospace" }}>{paymentInstruction.paymentCode}</strong></li>
                    </ol>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    <span className="spinner" style={{ width: "1rem", height: "1rem", border: "2px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Đang chờ xác nhận thanh toán tự động…
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "2px solid var(--color-accent)", padding: "1.75rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
                    ⭐ Đăng ký VIP của {profile.displayName}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
                    Mở khoá toàn bộ {vipCount} bài hướng dẫn VIP của creator này trong 30 ngày.
                  </p>

                  <div style={{ background: "rgba(212,113,59,0.06)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1.25rem", textAlign: "center", border: "1.5px solid rgba(212,113,59,0.2)" }}>
                    <p style={{ fontSize: "2rem", fontWeight: 900, color: "var(--color-accent)" }}>{formatCurrency(VIP_FIXED_PRICE_VND)}</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>/ 30 ngày</p>
                  </div>

                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    Sau khi bấm đăng ký, bạn sẽ thấy mã QR chuyển khoản — thanh toán được xác nhận <strong>tự động</strong>, không cần chờ admin duyệt.
                  </p>

                  {subscribeError && (
                    <p style={{ fontSize: "0.875rem", color: "#DC2626", background: "#FEE2E2", padding: "0.625rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>{subscribeError}</p>
                  )}

                  <button onClick={handleSubscribe} disabled={subscribing} className="btn btn-accent"
                    style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem", opacity: subscribing ? 0.7 : 1 }}>
                    {subscribing ? "Đang tạo giao dịch…" : "🔓 Đăng ký VIP"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── About tab ── */}
          {activeTab === "about" && (
            <div style={{ maxWidth: "640px", marginBottom: "3rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>Về {profile.displayName}</h3>
                {profile.bio ? (
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{profile.bio}</p>
                ) : (
                  <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Chưa có tiểu sử.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}
