"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { journalsApi, type JournalDto } from "@/lib/api/journals";
import { usersApi, type CreatorProfileDto } from "@/lib/api/users";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl, getAvatarColor, getAvatarInitial } from "@/lib/utils";

interface Props { userId: string; }

function timeAgo(iso: string) {
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  const diffD = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffD === 0) return "Hôm nay";
  if (diffD === 1) return "Hôm qua";
  if (diffD < 7) return `${diffD} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

export default function OtherUserJournalPage({ userId }: Props) {
  const [profile, setProfile] = useState<CreatorProfileDto | null>(null);
  const [journals, setJournals] = useState<JournalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [loggedIn] = useState(() => isLoggedIn());

  useEffect(() => {
    if (!userId) return;
    const token = getToken() ?? undefined;
    Promise.all([
      usersApi.getProfile(userId, token),
      journalsApi.getUserJournals(userId, { pageSize: 50 }, token),
    ])
      .then(([prof, journalResult]) => {
        setProfile(prof);
        setIsFollowing(prof.isFollowing);
        setJournals(journalResult?.items ?? []);
      })
      .catch(err => {
        const e = err as { message?: string };
        setError(e?.message ?? "Không thể tải nhật ký. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleToggleFollow() {
    const token = getToken();
    if (!token || togglingFollow) return;
    setTogglingFollow(true);
    try {
      const res = await usersApi.toggleFollow(token, userId);
      setIsFollowing(res.isFollowing);
      if (profile) {
        setProfile(prev => prev ? {
          ...prev,
          followerCount: prev.followerCount + (res.isFollowing ? 1 : -1),
          isFollowing: res.isFollowing,
        } : prev);
      }
    } catch { /* silent */ }
    finally { setTogglingFollow(false); }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-block", width: "2.5rem", height: "2.5rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ marginTop: "1rem", color: "var(--color-text-muted)" }}>Đang tải nhật ký...</p>
          </div>
        </main>
        <Footer />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
            <h1 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{error ?? "Không tìm thấy người dùng"}</h1>
            <Link href="/cong-dong" className="btn btn-primary" style={{ textDecoration: "none", marginTop: "1rem", display: "inline-flex" }}>← Về cộng đồng</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "720px" }}>

          {/* User Mini Profile */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: isValidImageUrl(profile.avatarUrl) ? "transparent" : getAvatarColor(profile.avatarUrl), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden", border: "2px solid var(--color-border)" }}>
              {isValidImageUrl(profile.avatarUrl)
                ? <img src={profile.avatarUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getAvatarInitial(profile.displayName)}
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>{profile.displayName}</h2>
                {profile.roles?.includes("Creator") && (
                  <span style={{ fontSize: "0.65rem", background: "linear-gradient(135deg,#D4713B,#e8955f)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "99px", fontWeight: 700 }}>Creator</span>
                )}
              </div>
              {profile.bio && <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>{profile.bio}</p>}
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                {profile.followerCount.toLocaleString()} người theo dõi
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
              <Link href={`/kenh/${userId}`} className="btn btn-outline" style={{ textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Xem kênh</Link>
              {loggedIn && (
                <button
                  onClick={handleToggleFollow}
                  disabled={togglingFollow}
                  className={isFollowing ? "btn btn-outline" : "btn btn-primary"}
                  style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: togglingFollow ? 0.6 : 1 }}
                >
                  {togglingFollow ? "..." : isFollowing ? "✓ Đang theo dõi" : "+ Theo dõi"}
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                Nhật ký công khai của {profile.displayName}
              </h1>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{journals.length} bài nhật ký công khai</p>
            </div>
          </div>

          {/* Notice */}
          <div style={{ background: "rgba(44,125,160,0.06)", border: "1.5px solid rgba(44,125,160,0.15)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>Chỉ hiển thị các bài nhật ký được đặt công khai bởi {profile.displayName}</span>
          </div>

          {/* Entries */}
          {journals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📔</div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Chưa có nhật ký công khai</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>{profile.displayName} chưa chia sẻ nhật ký nào.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {journals.map((entry) => (
                <article key={entry.id} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", gap: "1.25rem", padding: "1.5rem" }}>
                    <div style={{ flexShrink: 0, textAlign: "center", width: "3.5rem" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", lineHeight: 1.3 }}>{timeAgo(entry.createdAt)}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.625rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(45,106,79,0.08)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                          🌍 Công khai
                        </span>
                        {entry.linkedTutorialTitle && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(212,113,59,0.08)", color: "var(--color-accent)", borderRadius: "var(--radius-full)", padding: "0.2rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>
                            📌 {entry.linkedTutorialTitle}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.65, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-wrap" }}>
                        {entry.content}
                      </p>
                      {/* Images */}
                      {entry.imageUrls?.length > 0 && (
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                          {entry.imageUrls.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="" style={{ width: "5rem", height: "5rem", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }} />
                          ))}
                        </div>
                      )}
                      {entry.linkedTutorialSlug && (
                        <Link href={`/huong-dan/${entry.linkedTutorialSlug}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", textDecoration: "none", fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500 }}>
                          📌 {entry.linkedTutorialTitle}
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
