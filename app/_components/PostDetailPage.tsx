"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// Bình luận chỉ được tự xóa trong vòng 5 phút kể từ lúc gửi (khớp giới hạn phía BE).
const COMMENT_DELETE_WINDOW_MS = 5 * 60 * 1000;

// ── Comment Item ──────────────────────────────────────────────────────────────
function CommentItem({
  comment, profile, currentUserId, token, profiles, onChanged, highlightId, isReply = false,
}: {
  comment: CommentDto;
  profile?: CreatorProfileDto | null;
  currentUserId: string | null;
  token: string | null;
  profiles: Map<string, CreatorProfileDto>;
  onChanged: () => void;
  highlightId?: string | null;
  isReply?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const name = profile?.displayName ?? `#${comment.userId.slice(0, 6).toUpperCase()}`;
  const isOwn = currentUserId === comment.userId;
  const isHighlighted = !!highlightId && highlightId === comment.id;

  // Cập nhật định kỳ để nút "Xóa" tự ẩn ngay khi vượt mốc 5 phút, không cần tải lại trang.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const createdMs = new Date(comment.createdAt.endsWith("Z") ? comment.createdAt : comment.createdAt + "Z").getTime();
  const canDelete = isOwn && now - createdMs <= COMMENT_DELETE_WINDOW_MS;

  async function handleDelete() {
    if (!token) return;
    setDeleting(true);
    setDeleteError(null);
    try { await communityPostsApi.deleteComment(token, comment.id); onChanged(); }
    catch (err: unknown) {
      setDeleting(false);
      setDeleteError((err as { message?: string })?.message ?? "Không thể xóa bình luận. Vui lòng thử lại.");
    }
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !replyText.trim()) return;
    setSubmittingReply(true);
    setReplyError(null);
    try {
      await communityPostsApi.addComment(token, { targetId: comment.id, targetType: "Comment", content: replyText.trim() });
      setReplyText("");
      setReplying(false);
      onChanged();
    } catch (err: unknown) {
      setReplyError((err as { message?: string })?.message ?? "Không thể gửi trả lời.");
    } finally {
      setSubmittingReply(false);
    }
  }

  return (
    <div
      id={`comment-${comment.id}`}
      style={{
        display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.875rem 0.5rem",
        borderBottom: isReply ? "none" : "1px solid var(--color-border)",
        background: isHighlighted ? "rgba(212,113,59,0.12)" : "transparent",
        borderRadius: "var(--radius-md)",
        transition: "background 1s ease",
      }}
    >
      <AuthorLink authorId={comment.userId}>
        <Avatar userId={comment.userId} profile={profile} size={isReply ? 30 : 36} />
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

        {/* Trả lời — chỉ cho bình luận gốc, không cho phép trả lời một trả lời (khớp BE: chỉ lồng 1 cấp) */}
        {!isReply && token && (
          <button onClick={() => setReplying(r => !r)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.78rem", padding: 0, marginTop: "0.375rem", fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
            {replying ? "Hủy trả lời" : "Trả lời"}
          </button>
        )}

        {replying && (
          <form onSubmit={handleSubmitReply} style={{ marginTop: "0.625rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <textarea
              value={replyText} onChange={e => setReplyText(e.target.value)} autoFocus
              placeholder={`Trả lời ${name}...`} rows={1} maxLength={500}
              className="input-field" style={{ resize: "none", fontSize: "0.85rem", fontFamily: "inherit", flex: 1 }}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSubmitReply(e as unknown as React.FormEvent); }} />
            <button type="submit" disabled={!replyText.trim() || submittingReply} className="btn btn-primary btn-sm"
              style={{ opacity: !replyText.trim() || submittingReply ? 0.6 : 1, flexShrink: 0 }}>
              {submittingReply ? "..." : "Gửi"}
            </button>
          </form>
        )}
        {replyError && <p style={{ fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem" }}>{replyError}</p>}

        {/* Danh sách trả lời */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: "0.75rem", paddingLeft: "0.875rem", borderLeft: "2px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {comment.replies.map(r => (
              <CommentItem key={r.id} comment={r} profile={profiles.get(r.userId) ?? null}
                currentUserId={currentUserId} token={token} profiles={profiles}
                onChanged={onChanged} highlightId={highlightId} isReply />
            ))}
          </div>
        )}
      </div>
      {canDelete && (
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
export function PostDetailContent({ postId, autoFocusComment = false, highlightCommentId }: { postId: string; autoFocusComment?: boolean; highlightCommentId?: string }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  const [commentProfiles, setCommentProfiles] = useState<Map<string, CreatorProfileDto>>(new Map());
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
    setAuthReady(true);
  }, []);

  // Load post bằng API trực tiếp — cache theo postId+token, quay lại trang thấy ngay không cần chờ
  const postQuery = useQuery({
    queryKey: ["community-post", postId, token ?? "anon"],
    queryFn: async () => {
      const tok = token ?? undefined;
      const found = await communityPostsApi.getById(postId, tok);
      const profile = await usersApi.getProfile(found.authorId, tok).catch(() => null);
      return { post: found, profile };
    },
    enabled: authReady && !!postId,
  });

  const post = postQuery.data?.post ?? null;
  const postProfile = postQuery.data?.profile ?? null;
  const loadingPost = postQuery.isPending;
  const postError = postQuery.isError
    ? ((postQuery.error as { status?: number })?.status === 404
        ? "Bài viết này không tồn tại hoặc đã bị gỡ."
        : "Không thể tải bài viết. Vui lòng thử lại.")
    : null;

  // Đồng bộ trạng thái thích khi dữ liệu bài viết được tải/làm mới
  useEffect(() => {
    if (post) { setLiked(post.isLikedByCurrentUser); setLikeCount(post.likeCount); }
  }, [post]);

  // Load comments — cùng cơ chế cache
  const commentsQuery = useQuery({
    queryKey: ["community-comments", postId],
    queryFn: () => communityPostsApi.getComments(postId),
    enabled: !!postId,
  });

  const comments = commentsQuery.data?.items ?? [];
  const loadingComments = commentsQuery.isPending;

  // fetch profiles cho các tác giả bình luận (kể cả trả lời lồng bên trong) chưa có sẵn
  useEffect(() => {
    const allIds = new Set<string>();
    comments.forEach(c => {
      allIds.add(c.userId);
      c.replies?.forEach(r => allIds.add(r.userId));
    });
    const uniqueIds = [...allIds].filter(id => !commentProfiles.has(id));
    uniqueIds.forEach(id => {
      usersApi.getProfile(id, token ?? undefined)
        .then(p => setCommentProfiles(prev => { const m = new Map(prev); m.set(id, p); return m; }))
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  // Tự động focus ô nhập bình luận khi mở từ modal (bấm icon bình luận trên feed)
  useEffect(() => {
    if (autoFocusComment && loggedIn && !loadingComments) {
      commentInputRef.current?.focus();
    }
  }, [autoFocusComment, loggedIn, loadingComments]);

  // Đến từ link báo cáo vi phạm với 1 bình luận cụ thể — cuộn tới và làm nổi bật bình luận đó
  useEffect(() => {
    if (!highlightCommentId || loadingComments) return;
    const t = setTimeout(() => {
      document.getElementById(`comment-${highlightCommentId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(t);
  }, [highlightCommentId, loadingComments, comments]);

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
      await queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
    } catch (err: unknown) {
      setCommentError((err as { message?: string })?.message ?? "Không thể đăng bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  }

  function refreshComments() {
    queryClient.invalidateQueries({ queryKey: ["community-comments", postId] });
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
                    currentUserId={currentUserId} token={token} profiles={commentProfiles}
                    onChanged={refreshComments} highlightId={highlightCommentId} />
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
  const searchParams = useSearchParams();
  const fromReport = searchParams.get("fromReport") === "1";
  const highlightCommentId = searchParams.get("highlightComment") ?? undefined;

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

          {/* Đến từ trang quản trị báo cáo — cho phép quay lại nhanh */}
          {fromReport && (
            <Link
              href="/admin/reports"
              className="btn btn-outline btn-sm"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              Quay lại trang báo cáo
            </Link>
          )}

          <PostDetailContent postId={postId} highlightCommentId={highlightCommentId} />
        </div>
      </main>
      <Footer />
    </>
  );
}
