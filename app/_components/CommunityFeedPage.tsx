"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReportModal from "./ReportModal";
import AuthorLink from "./AuthorLink";
import { communityPostsApi, type CommunityPostDto } from "@/lib/api";
import { usersApi, type CreatorProfileDto } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl, getAvatarColor, getAvatarInitial } from "@/lib/utils";

const TRENDING_TAGS = ["#OrigamiViệtNam", "#HạcGiấy", "#Origami3D", "#TrẻEm", "#ModularOrigami", "#HoaGiấy", "#NghệThuậtGấp"];

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso.endsWith("Z") ? iso : iso + "Z").getTime()) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

// ── Author avatar / name mini component ──────────────────────────────────────
function AuthorBadge({ authorId, profile }: { authorId: string; profile?: CreatorProfileDto | null }) {
  const initials = profile?.displayName ? getAvatarInitial(profile.displayName) : authorId.slice(0, 1).toUpperCase();
  const name = profile?.displayName ?? `Người dùng #${authorId.slice(0, 6).toUpperCase()}`;
  const color = getAvatarColor(profile?.avatarUrl);

  return (
    <AuthorLink authorId={authorId} style={{ gap: "0.75rem" }}>
      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: isValidImageUrl(profile?.avatarUrl) ? "transparent" : color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden", border: "2px solid var(--color-border)" }}>
        {isValidImageUrl(profile?.avatarUrl)
          ? <img src={profile.avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{name}</div>
        {profile?.roles?.includes("Creator") && (
          <span style={{ fontSize: "0.7rem", background: "linear-gradient(135deg,#D4713B,#e8955f)", color: "white", padding: "0.1rem 0.4rem", borderRadius: "99px", fontWeight: 700 }}>Creator</span>
        )}
      </div>
    </AuthorLink>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({
  post, token, profileCache, onProfileLoaded,
}: {
  post: CommunityPostDto;
  token: string | null;
  profileCache: Map<string, CreatorProfileDto>;
  onProfileLoaded: (id: string, p: CreatorProfileDto) => void;
}) {
  const [liked, setLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const profile = profileCache.get(post.authorId) ?? null;

  useEffect(() => {
    if (!profileCache.has(post.authorId)) {
      usersApi.getProfile(post.authorId, token ?? undefined)
        .then(p => onProfileLoaded(post.authorId, p))
        .catch(() => {/* ignore */});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.authorId]);

  async function handleLike() {
    if (!token || liking) return;
    setLiking(true);
    setLikeError(null);
    const was = liked;
    setLiked(!was); setLikeCount(c => was ? c - 1 : c + 1);
    try { await communityPostsApi.toggleLike(token, post.id, "CommunityPost"); }
    catch (err: unknown) {
      setLiked(was); setLikeCount(c => was ? c + 1 : c - 1);
      setLikeError((err as { message?: string })?.message ?? "Không thể thích bài viết. Vui lòng thử lại.");
    }
    finally { setLiking(false); }
  }

  // Suy luận postType nếu backend không trả về
  const postType = post.postType
    ?? (post.linkedTutorialId && (post.media?.length ?? 0) === 0 ? "tutorial"
    : post.linkedTutorialId ? "achievement"
    : (post.media?.length ?? 0) > 0 ? "photo"
    : "standard");

  const hasMedia = (post.media?.length ?? 0) > 0;
  const gridCols = post.media?.length === 1 ? "1fr" : "1fr 1fr";

  return (
    <article style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)", overflow: "hidden", transition: "box-shadow var(--transition-normal)" }}>
      {/* Header */}
      <div style={{ padding: "1.125rem 1.25rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <AuthorBadge authorId={post.authorId} profile={profile} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {postType === "tutorial" && (
            <span style={{ fontSize: "0.7rem", background: "rgba(44,125,160,0.12)", color: "#2C7DA0", border: "1px solid rgba(44,125,160,0.25)", padding: "0.15rem 0.5rem", borderRadius: "99px", fontWeight: 700 }}>📚 Hướng dẫn</span>
          )}
          {postType === "achievement" && (
            <span style={{ fontSize: "0.7rem", background: "rgba(245,159,0,0.12)", color: "#c47d00", border: "1px solid rgba(245,159,0,0.3)", padding: "0.15rem 0.5rem", borderRadius: "99px", fontWeight: 700 }}>🏅 Thành tựu</span>
          )}
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{timeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 1.25rem 0.875rem" }}>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{post.content}</p>
      </div>

      {/* Media grid (ảnh tác phẩm hoặc ảnh thành tựu) */}
      {hasMedia && (
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "2px" }}>
          {post.media.slice(0, 4).map((m, i) =>
            m.mediaType === "Image" ? (
              <div key={i} style={{ position: "relative", overflow: "hidden" }}>
                <img src={m.mediaUrl} alt="" style={{ width: "100%", aspectRatio: post.media.length === 1 ? "16/9" : "4/3", objectFit: "cover", display: "block" }} />
                {i === 3 && post.media.length > 4 && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.5rem", fontWeight: 700 }}>+{post.media.length - 4}</div>
                )}
              </div>
            ) : (
              <video key={i} src={m.mediaUrl} controls style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
            )
          )}
        </div>
      )}

      {/* Tutorial card — hiển thị khi bài đăng chia sẻ hướng dẫn */}
      {post.linkedTutorialId && (
        <div style={{ margin: "0 1.25rem 1rem" }}>
          <Link
            href={post.linkedTutorialSlug ? `/huong-dan/${post.linkedTutorialSlug}` : `/huong-dan`}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: "rgba(44,125,160,0.06)", border: "1.5px solid rgba(44,125,160,0.2)", borderRadius: "var(--radius-md)", textDecoration: "none", transition: "border-color var(--transition-fast), background var(--transition-fast)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(44,125,160,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,125,160,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(44,125,160,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,125,160,0.2)"; }}
          >
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-sm)", background: "rgba(44,125,160,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>📚</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.7rem", color: "#2C7DA0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.15rem" }}>Hướng dẫn được chia sẻ</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.linkedTutorialTitle ?? "Xem hướng dẫn"}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C7DA0" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" /></svg>
          </Link>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.25rem", borderTop: "1px solid var(--color-border)" }}>
        <button id={`like-${post.id}`} onClick={handleLike} disabled={!token || liking}
          className="like-btn"
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", cursor: token ? "pointer" : "default", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: liked ? "#E03131" : "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", opacity: liking ? 0.6 : 1, transition: "color 0.15s" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likeCount}
        </button>

        <Link id={`comment-${post.id}`} href={`/cong-dong/${post.id}`}
          style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          {post.commentCount}
        </Link>

        <div style={{ flex: 1 }} />

        {token && (
          <button onClick={() => setShowReport(true)} title="Báo cáo"
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", cursor: "pointer", padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontSize: "0.75rem", fontWeight: 500, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
        )}
      </div>

      {likeError && (
        <div style={{ padding: "0 1.25rem 0.75rem", fontSize: "0.8rem", color: "var(--color-error)" }}>{likeError}</div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetId={post.id}
        targetType="CommunityPost"
      />
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem" }}>
        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--color-surface-2)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: "0.875rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.375rem", width: "40%" }} />
          <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "25%" }} />
        </div>
      </div>
      <div style={{ height: "4rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)" }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileCache, setProfileCache] = useState<Map<string, CreatorProfileDto>>(new Map());
  const tokenRef = useRef<string | null>(null);
  // tokenReady: true sau khi useEffect đọc xong token từ localStorage
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const t = getToken(); tokenRef.current = t;
    setToken(t); setLoggedIn(isLoggedIn());
    setTokenReady(true); // báo hiệu đã đọc xong token
  }, []);

  const handleProfileLoaded = useCallback((id: string, p: CreatorProfileDto) => {
    setProfileCache(prev => {
      const next = new Map(prev); next.set(id, p); return next;
    });
  }, []);

  const PAGE_SIZE = 10;

  const fetchFeed = useCallback(async (pageNum: number, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);
    try {
      const result = await communityPostsApi.getFeed({ page: pageNum, pageSize: PAGE_SIZE }, tokenRef.current ?? undefined);
      // Backend trả về PagedResult<CommunityPostDto> với field .items và .totalPages
      const safeItems = Array.isArray(result) ? result : (result?.items ?? []);
      const pages = (result as { totalPages?: number })?.totalPages ?? (safeItems.length >= PAGE_SIZE ? pageNum + 1 : pageNum);
      // Luôn hiển thị bài mới đăng trước, không phụ thuộc thứ tự trả về từ backend
      setPosts(prev => {
        const combined = append ? [...prev, ...safeItems] : safeItems;
        return [...combined].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      setTotalPages(pages);
    } catch {
      setError("Không thể tải bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  // Chờ tokenReady mới fetch — tránh race condition gửi request không có token
  useEffect(() => { if (tokenReady) { fetchFeed(1); setPage(1); } }, [tokenReady, fetchFeed]);

  function handleLoadMore() { const n = page + 1; setPage(n); fetchFeed(n, true); }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }} className="community-grid">
            {/* ── Main Feed ── */}
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div>
                  <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Cộng đồng 🌿</h1>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Chia sẻ tác phẩm và kết nối với cộng đồng Origami</p>
                </div>
                {loggedIn && (
                  <Link id="btn-create-post" href="/cong-dong/tao-bai" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Tạo bài viết
                  </Link>
                )}
              </div>

              {/* Quick composer */}
              {loggedIn && (
                <Link href="/cong-dong/tao-bai" id="quick-composer"
                  style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1rem 1.25rem", marginBottom: "1.25rem", boxShadow: "var(--shadow-xs)", textDecoration: "none", transition: "box-shadow var(--transition-fast)" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "var(--shadow-xs)")}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0, fontSize: "1rem" }}>✏️</div>
                  <span style={{ flex: 1, padding: "0.625rem 1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
                    Chia sẻ tác phẩm Origami của bạn...
                  </span>
                </Link>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", marginBottom: "1.25rem", color: "var(--color-error)", fontWeight: 500, textAlign: "center" }}>
                  {error}
                  <button onClick={() => fetchFeed(1)} style={{ marginLeft: "1rem", background: "none", border: "1px solid currentColor", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", cursor: "pointer", color: "var(--color-error)", fontSize: "0.8125rem" }}>Thử lại</button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[0,1,2].map(i => <PostSkeleton key={i} />)}
                </div>
              )}

              {/* Feed */}
              {!loading && (
                <>
                  {(posts?.length ?? 0) === 0 && !error ? (
                    <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px dashed var(--color-border)" }}>
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                      <h3 style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Chưa có bài viết nào</h3>
                      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>Hãy là người đầu tiên chia sẻ!</p>
                      {loggedIn && <Link href="/cong-dong/tao-bai" className="btn btn-primary" style={{ textDecoration: "none" }}>Tạo bài viết đầu tiên</Link>}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {posts.map(post => (
                        <PostCard key={post.id} post={post} token={token} profileCache={profileCache} onProfileLoaded={handleProfileLoaded} />
                      ))}
                    </div>
                  )}

                  {page < totalPages && (
                    <div style={{ textAlign: "center", marginTop: "2rem" }}>
                      <button id="btn-load-more" onClick={handleLoadMore} disabled={loadingMore} className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>
                        {loadingMore ? "Đang tải..." : "Xem thêm"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Trending Tags */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>🔥 Chủ đề hot</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {TRENDING_TAGS.map((tag, i) => (
                    <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < TRENDING_TAGS.length - 1 ? "1px solid var(--color-border)" : "none", textDecoration: "none" }}>
                      <span style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 500 }}>{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA / login prompt */}
              {!loggedIn ? (
                <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🌿</div>
                  <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Tham gia cộng đồng!</p>
                  <p style={{ fontSize: "0.8125rem", opacity: 0.8, marginBottom: "1rem" }}>Chia sẻ tác phẩm và kết nối với hàng ngàn nghệ nhân Origami</p>
                  <Link href="/dang-ky" className="btn" style={{ background: "white", color: "var(--color-primary)", width: "100%", justifyContent: "center", textDecoration: "none", display: "flex" }}>Đăng ký miễn phí</Link>
                </div>
              ) : (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>✨ Chia sẻ ngay</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {[
                      { href: "/cong-dong/tao-bai?type=photo", icon: "📸", label: "Đăng ảnh tác phẩm" },
                      { href: "/cong-dong/tao-bai?type=achievement", icon: "🏅", label: "Chia sẻ thành tựu" },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500, transition: "all var(--transition-fast)" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; e.currentTarget.style.background = "rgba(45,106,79,0.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-secondary)"; e.currentTarget.style.background = ""; }}>
                        <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 900px) { .community-grid { grid-template-columns: 1fr !important; } aside { position: static !important; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </>
  );
}
