"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthorLink from "./AuthorLink";
import { getToken, isLoggedIn } from "@/lib/auth";
import { communityPostsApi, type CommunityPostDto, type CommentDto } from "@/lib/api/community-posts";
import { usersApi, type CreatorProfileDto } from "@/lib/api/users";
import { isValidImageUrl, getAvatarColor, getAvatarInitial } from "@/lib/utils";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso.endsWith("Z") ? iso : iso + "Z").getTime()) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

function Avatar({ userId, profile, size = 40 }: { userId: string; profile?: CreatorProfileDto | null; size?: number }) {
  const initials = profile?.displayName ? getAvatarInitial(profile.displayName) : userId.slice(0, 1).toUpperCase();
  const color = getAvatarColor(profile?.avatarUrl);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: isValidImageUrl(profile?.avatarUrl) ? "transparent" : color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden", border: "2px solid var(--color-border)" }}>
      {isValidImageUrl(profile?.avatarUrl)
        ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : initials}
    </div>
  );
}

// ── Comment Item ──────────────────────────────────────────────────────────────
function CommentItem({
  comment, profile, currentUserId, token, onDelete,
}: {
  comment: CommentDto;
  profile?: CreatorProfileDto | null;
  currentUserId: string | null;
  token: string | null;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const name = profile?.displayName ?? `#${comment.userId.slice(0, 6).toUpperCase()}`;
  const isOwn = currentUserId === comment.userId;

  async function handleDelete() {
    if (!token) return;
    setDeleting(true);
    setDeleteError(null);
    try { await communityPostsApi.deleteComment(token, comment.id); onDelete(comment.id); }
    catch (err: unknown) {
      setDeleting(false);
      setDeleteError((err as { message?: string })?.message ?? "Không thể xóa bình luận. Vui lòng thử lại.");
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.875rem 0", borderBottom: "1px solid var(--color-border)" }}>
      <AuthorLink authorId={comment.userId}>
        <Avatar userId={comment.userId} profile={profile} size={36} />
      </AuthorLink>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
          <AuthorLink authorId={comment.userId}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{name}</span>
          </AuthorLink>
          {profile?.roles?.includes("Creator") && (
            <span style={{ fontSize: "0.65rem", background: "linear-gradient(135deg,#D4713B,#e8955f)", color: "white", padding: "0.1rem 0.35rem", borderRadius: "99px", fontWeight: 700 }}>Creator</span>
          )}
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{timeAgo(comment.createdAt)}</span>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{comment.content}</p>
        {deleteError && <p style={{ fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem" }}>{deleteError}</p>}
      </div>
      {isOwn && (
        <button onClick={handleDelete} disabled={deleting}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "var(--radius-sm)", opacity: deleting ? 0.5 : 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-error)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
          {deleting ? "..." : "Xóa"}
        </button>
      )}
    </div>
  );
}

// ── Content (dùng chung cho trang chi tiết và modal) ────────────────────────────
export function PostDetailContent({ postId, autoFocusComment = false }: { postId: string; autoFocusComment?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [post, setPost] = useState<CommunityPostDto | null>(null);
  const [postProfile, setPostProfile] = useState<CreatorProfileDto | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentProfiles, setCommentProfiles] = useState<Map<string, CreatorProfileDto>>(new Map());
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Decode JWT to get userId
  function decodeUserId(tok: string | null): string | null {
    if (!tok) return null;
    try {
      const payload = JSON.parse(atob(tok.split(".")[1]));
      return payload["sub"] || payload["nameid"] || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    } catch { return null; }
  }

  useEffect(() => {
    const t = getToken();
    setToken(t); setLoggedIn(isLoggedIn());
    setCurrentUserId(decodeUserId(t));
  }, []);

  // Load post bằng API trực tiếp
  useEffect(() => {
    if (!postId) return;
    setLoadingPost(true);
    const tok = token ?? undefined;
    communityPostsApi.getById(postId, tok)
      .then(found => {
        setPost(found);
        setLiked(found.isLikedByCurrentUser);
        setLikeCount(found.likeCount);
        return usersApi.getProfile(found.authorId, tok);
      })
      .then(profile => { if (profile) setPostProfile(profile); })
      .catch(() => setPostError("Không thể tải bài viết. Vui lòng thử lại."))
      .finally(() => setLoadingPost(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, token]);

  // Load comments
  useEffect(() => {
    if (!postId) return;
    setLoadingComments(true);
    communityPostsApi.getComments(postId)
      .then(result => {
        setComments(result.items);
        // fetch profiles for unique authors
        const uniqueIds = [...new Set(result.items.map(c => c.userId))];
        uniqueIds.forEach(id => {
          usersApi.getProfile(id, token ?? undefined)
            .then(p => setCommentProfiles(prev => { const m = new Map(prev); m.set(id, p); return m; }))
            .catch(() => {});
        });
      })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Tự động focus ô nhập bình luận khi mở từ modal (bấm icon bình luận trên feed)
  useEffect(() => {
    if (autoFocusComment && loggedIn && !loadingComments) {
      commentInputRef.current?.focus();
    }
  }, [autoFocusComment, loggedIn, loadingComments]);

  async function handleLike() {
    if (!token || liking) return;
    setLiking(true);
    setLikeError(null);
    const was = liked;
    setLiked(!was); setLikeCount(c => was ? c - 1 : c + 1);
    try { await communityPostsApi.toggleLike(token, postId, "CommunityPost"); }
    catch (err: unknown) {
      setLiked(was); setLikeCount(c => was ? c + 1 : c - 1);
      setLikeError((err as { message?: string })?.message ?? "Không thể thích bài viết. Vui lòng thử lại.");
    }
    finally { setLiking(false); }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !commentText.trim()) return;
    setCommentError(null);
    setSubmittingComment(true);
    try {
      await communityPostsApi.addComment(token, { targetId: postId, targetType: "CommunityPost", content: commentText.trim() });
      setCommentText("");
      // Reload comments
      const result = await communityPostsApi.getComments(postId);
      setComments(result.items);
      const uniqueIds = [...new Set(result.items.map(c => c.userId))];
      uniqueIds.forEach(id => {
        if (!commentProfiles.has(id)) {
          usersApi.getProfile(id, token ?? undefined)
            .then(p => setCommentProfiles(prev => { const m = new Map(prev); m.set(id, p); return m; }))
            .catch(() => {});
        }
      });
    } catch (err: unknown) {
      setCommentError((err as { message?: string })?.message ?? "Không thể đăng bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  }

  function handleDeleteComment(id: string) {
    setComments(prev => prev.filter(c => c.id !== id));
  }

  const authorName = postProfile?.displayName ?? (post ? `#${post.authorId.slice(0,6).toUpperCase()}` : "");

  return (
    <>
      {/* Loading */}
      {loadingPost && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
          <div style={{ display: "inline-block", width: "2.5rem", height: "2.5rem", border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <p style={{ marginTop: "1rem" }}>Đang tải bài viết...</p>
        </div>
      )}

      {/* Error */}
      {postError && !loadingPost && (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
          <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{postError}</h2>
          <Link href="/cong-dong" className="btn btn-primary" style={{ textDecoration: "none", marginTop: "1rem", display: "inline-flex" }}>← Về cộng đồng</Link>
        </div>
      )}

      {/* Post Detail */}
      {post && !loadingPost && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Post card */}
          <article style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
            {/* Author header */}
            <div style={{ padding: "1.5rem 1.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <AuthorLink authorId={post.authorId} style={{ gap: "0.875rem" }}>
                <Avatar userId={post.authorId} profile={postProfile} size={48} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{authorName}</div>
                  {postProfile?.roles?.includes("Creator") && (
                    <span style={{ fontSize: "0.7rem", background: "linear-gradient(135deg,#D4713B,#e8955f)", color: "white", padding: "0.15rem 0.5rem", borderRadius: "99px", fontWeight: 700 }}>Creator</span>
                  )}
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>{timeAgo(post.createdAt)}</div>
                </div>
              </AuthorLink>
              <Link href={`/kenh/${post.authorId}`}
                style={{ fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "none", padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)", border: "1px solid var(--color-primary)", fontWeight: 600 }}>
                Xem hồ sơ
              </Link>
            </div>

            {/* Content */}
            <div style={{ padding: "0 1.5rem 1.25rem" }}>
              <p style={{ fontSize: "1rem", color: "var(--color-text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{post.content}</p>
            </div>

            {/* Media */}
            {post.media?.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: post.media.length === 1 ? "1fr" : "1fr 1fr", gap: "2px" }}>
                {post.media.slice(0, 4).map((m, i) =>
                  m.mediaType === "Image" ? (
                    <img key={i} src={m.mediaUrl} alt="" style={{ width: "100%", aspectRatio: post.media.length === 1 ? "16/9" : "4/3", objectFit: "cover", display: "block" }} />
                  ) : (
                    <video key={i} src={m.mediaUrl} controls style={{ width: "100%", aspectRatio: "16/9", display: "block" }} />
                  )
                )}
              </div>
            )}

            {/* Like / Comment counts */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <button id="btn-like-post" onClick={handleLike} disabled={!token || liking}
                className="like-btn"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: liked ? "rgba(224,49,49,0.08)" : "var(--color-surface-2)", border: "none", cursor: token ? "pointer" : "default", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", color: liked ? "#E03131" : "var(--color-text-muted)", fontWeight: 600, fontSize: "0.9375rem", transition: "all 0.15s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likeCount} Thích
              </button>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                💬 {comments.length} bình luận
              </span>
            </div>
            {likeError && (
              <div style={{ padding: "0 1.5rem 1rem", fontSize: "0.8rem", color: "var(--color-error)" }}>{likeError}</div>
            )}
          </article>

          {/* Comments section */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
              💬 Bình luận ({comments.length})
            </h2>

            {/* Add comment */}
            {loggedIn ? (
              <form onSubmit={handleAddComment} style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0, fontSize: "0.875rem" }}>✏️</div>
                  <div style={{ flex: 1 }}>
                    <textarea id="comment-input" ref={commentInputRef} value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Viết bình luận..." rows={2} maxLength={500}
                      className="input-field" style={{ resize: "none", lineHeight: 1.6, fontFamily: "inherit" }}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(e as unknown as React.FormEvent); }} />
                    {commentError && <p style={{ color: "var(--color-error)", fontSize: "0.8rem", marginTop: "0.375rem" }}>{commentError}</p>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Ctrl+Enter để gửi</span>
                      <button id="btn-submit-comment" type="submit" disabled={!commentText.trim() || submittingComment} className="btn btn-primary btn-sm"
                        style={{ opacity: !commentText.trim() || submittingComment ? 0.6 : 1 }}>
                        {submittingComment ? "Đang gửi..." : "Gửi"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ padding: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", textAlign: "center", marginBottom: "1.5rem" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  <Link href="/dang-nhap" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>Đăng nhập</Link> để bình luận
                </span>
              </div>
            )}

            {/* Comments list */}
            {loadingComments ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải bình luận...</div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--color-text-muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💬</div>
                <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div>
                {comments.map(c => (
                  <CommentItem key={c.id} comment={c} profile={commentProfiles.get(c.userId) ?? null}
                    currentUserId={currentUserId} token={token} onDelete={handleDeleteComment} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── Trang chi tiết đầy đủ (truy cập trực tiếp qua URL / F5) ─────────────────────
export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container-sm">
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            <Link href="/cong-dong" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Cộng đồng</Link>
            <span style={{ color: "var(--color-text-muted)" }}>›</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Bài viết</span>
          </div>

          <PostDetailContent postId={postId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
