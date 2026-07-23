"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { usersApi, type FollowerUserDto } from "@/lib/api/users";
import { getToken, getUser, isLoggedIn } from "@/lib/auth";

const AVATAR_COLORS = ["#2D6A4F", "#D4713B", "#2C7DA0", "#9B59B6", "#E03131", "#F59F00", "#1098AD"];
function avatarColor(id: string) { return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]; }

export default function FollowingListPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowerUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [unfollowedIds, setUnfollowedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/dang-nhap"); return; }
    const user = getUser();
    const token = getToken();
    if (!user || !token) return;

    setLoading(true);
    usersApi.getFollowing(user.userId, { pageSize: 100 }, token)
      .then(result => {
        setFollowing(result?.items ?? []);
      })
      .catch(err => {
        const e = err as { message?: string };
        setError(e?.message ?? "Không thể tải danh sách đang theo dõi.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const unfollow = useCallback(async (userId: string) => {
    const token = getToken();
    if (!token || togglingId) return;
    setTogglingId(userId);
    try {
      await usersApi.toggleFollow(token, userId);
      setUnfollowedIds(prev => new Set([...prev, userId]));
    } catch { /* silent */ }
    finally { setTogglingId(null); }
  }, [togglingId]);

  const filtered = following
    .filter(u => !unfollowedIds.has(u.userId))
    .filter(u => {
      if (!search) return true;
      const q = search.toLowerCase();
      return u.displayName.toLowerCase().includes(q);
    });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "720px" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            <Link href="/ho-so" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Trang cá nhân</Link>
            <span>/</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Đang theo dõi</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h1 className="text-heading" style={{ fontSize: "1.75rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                Đang theo dõi
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                {loading ? "Đang tải..." : `${filtered.length} người bạn đang theo dõi`}
              </p>
            </div>
            <Link href="/ho-so/nguoi-theo-doi" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Xem người theo dõi →
            </Link>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: "0.9375rem", outline: "none", color: "var(--color-text-primary)" }} />
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", animation: "pulse 1.5s ease-in-out infinite" }}>
                  <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "var(--color-surface-2)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "0.875rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "45%", marginBottom: "0.5rem" }} />
                    <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "3rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{error}</p>
            </div>
          )}

          {/* List */}
          {!loading && !error && (
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>👥</div>
                  <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                    {search ? "Không tìm thấy" : "Chưa theo dõi ai"}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    {search ? "Thử từ khóa khác" : "Khám phá các creator Origami tài năng"}
                  </p>
                  {!search && (
                    <Link href="/huong-dan" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: "1rem" }}>Khám phá</Link>
                  )}
                </div>
              ) : (
                filtered.map((user, i) => (
                  <div key={user.userId} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <Link href={`/kenh/${user.userId}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                      <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: user.avatarUrl ? "transparent" : avatarColor(user.userId), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, color: "white", overflow: "hidden", border: "2px solid var(--color-border)" }}>
                        {user.avatarUrl
                          ? <img src={user.avatarUrl} alt={user.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : user.displayName.charAt(0)}
                      </div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.125rem" }}>
                        <Link href={`/kenh/${user.userId}`} style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", textDecoration: "none" }}>{user.displayName}</Link>
                        {user.roles?.includes("Creator") && (
                          <span style={{ fontSize: "0.65rem", background: "linear-gradient(135deg,#D4713B,#e8955f)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "99px", fontWeight: 700 }}>Creator</span>
                        )}
                      </div>
                      {user.bio && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.bio}</p>}
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                        {user.tutorialCount} bài · {user.followerCount.toLocaleString()} người theo dõi
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <Link href={`/kenh/${user.userId}`} className="btn btn-outline" style={{ padding: "0.375rem 0.875rem", fontSize: "0.8125rem", textDecoration: "none" }}>Xem kênh</Link>
                      <button
                        onClick={() => unfollow(user.userId)}
                        disabled={togglingId === user.userId}
                        style={{ padding: "0.375rem 0.875rem", fontSize: "0.8125rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-full)", background: "transparent", color: "var(--color-text-muted)", cursor: "pointer", fontWeight: 500, opacity: togglingId === user.userId ? 0.6 : 1 }}
                      >
                        {togglingId === user.userId ? "..." : "Bỏ theo dõi"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </>
  );
}
