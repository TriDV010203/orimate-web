"use client";
// _components/CommentSection.tsx — Khối bình luận dùng chung (cộng đồng, bài hướng dẫn, ...)
// Mặc định chỉ hiện 5 bình luận gần nhất, bấm "Xem thêm" để tải thêm.

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import AuthorLink from "./AuthorLink";
import ReportModal from "./ReportModal";
import { getToken, isLoggedIn } from "@/lib/auth";
import { communityPostsApi, type CommentDto, type TargetType } from "@/lib/api/community-posts";
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
// Mỗi lần bấm "Xem thêm" tải thêm 5 bình luận.
const PAGE_SIZE_STEP = 5;

// ── Comment Item ──────────────────────────────────────────────────────────────
function CommentItem({
  comment, profile, currentUserId, token, profiles, onChanged, isReply = false,
}: {
  comment: CommentDto;
  profile?: CreatorProfileDto | null;
  currentUserId: string | null;
  token: string | null;
  profiles: Map<string, CreatorProfileDto>;
  onChanged: () => void;
  isReply?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showReport, setShowReport] = useState(false);

  const name = profile?.displayName ?? `#${comment.userId.slice(0, 6).toUpperCase()}`;
  const isOwn = currentUserId === comment.userId;

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
        borderRadius: "var(--radius-md)",
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

        {/* Trả lời / Báo cáo */}
        {token && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "0.375rem" }}>
            {/* Trả lời — chỉ cho bình luận gốc, không cho phép trả lời một trả lời (khớp BE: chỉ lồng 1 cấp) */}
            {!isReply && (
              <button onClick={() => setReplying(r => !r)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.78rem", padding: 0, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
                {replying ? "Hủy trả lời" : "Trả lời"}
              </button>
            )}
            {!isOwn && (
              <button onClick={() => setShowReport(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.78rem", padding: 0, fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
                Báo cáo
              </button>
            )}
          </div>
        )}

        <ReportModal isOpen={showReport} onClose={() => setShowReport(false)} targetId={comment.id} targetType="Comment" />

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
                onChanged={onChanged} isReply />
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

// ── Khối bình luận ───────────────────────────────────────────────────────────
export default function CommentSection({
  targetId, targetType, title = "Bình luận",
}: { targetId: string; targetType: TargetType; title?: string }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [commentProfiles, setCommentProfiles] = useState<Map<string, CreatorProfileDto>>(new Map());
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Số bình luận đang hiển thị — bắt đầu ở 5, mỗi lần "Xem thêm" tăng thêm 5.
  const [pageSize, setPageSize] = useState(PAGE_SIZE_STEP);

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

  const commentsQuery = useQuery({
    queryKey: ["comments", targetType, targetId, pageSize],
    queryFn: () => communityPostsApi.getComments(targetId, targetType, 1, pageSize),
    enabled: !!targetId,
  });

  const comments = commentsQuery.data?.items ?? [];
  const totalCount = commentsQuery.data?.totalCount ?? comments.length;
  // Tổng số bình luận hiển thị ở tiêu đề, tính cả trả lời lồng bên trong (khác với totalCount dùng để phân trang).
  const totalCommentCount = commentsQuery.data?.totalCommentCount ?? totalCount;
  const loadingComments = commentsQuery.isPending;
  const hasMore = comments.length < totalCount;

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

  function refreshComments() {
    // Bỏ pageSize khỏi key để làm mới mọi mức "Xem thêm" đã tải.
    queryClient.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !commentText.trim()) return;
    setCommentError(null);
    setSubmittingComment(true);
    try {
      await communityPostsApi.addComment(token, { targetId, targetType, content: commentText.trim() });
      setCommentText("");
      setPageSize(PAGE_SIZE_STEP); // về lại 5 bình luận gần nhất để thấy ngay bình luận vừa gửi
      refreshComments();
    } catch (err: unknown) {
      setCommentError((err as { message?: string })?.message ?? "Không thể đăng bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", padding: "1.5rem" }}>
      <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
        💬 {title} ({totalCommentCount})
      </h2>

      {/* Ô nhập bình luận */}
      {loggedIn ? (
        <form onSubmit={handleAddComment} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", flexShrink: 0, fontSize: "0.875rem" }}>✏️</div>
            <div style={{ flex: 1 }}>
              <textarea ref={commentInputRef} value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Viết bình luận..." rows={2} maxLength={500}
                className="input-field" style={{ resize: "none", lineHeight: 1.6, fontFamily: "inherit" }}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(e as unknown as React.FormEvent); }} />
              {commentError && <p style={{ color: "var(--color-error)", fontSize: "0.8rem", marginTop: "0.375rem" }}>{commentError}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Ctrl+Enter để gửi</span>
                <button type="submit" disabled={!commentText.trim() || submittingComment} className="btn btn-primary btn-sm"
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

      {/* Danh sách bình luận */}
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
              onChanged={refreshComments} />
          ))}
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button onClick={() => setPageSize(s => s + PAGE_SIZE_STEP)} disabled={commentsQuery.isFetching}
                className="btn btn-outline btn-sm" style={{ opacity: commentsQuery.isFetching ? 0.6 : 1 }}>
                {commentsQuery.isFetching ? "Đang tải..." : "Xem thêm bình luận"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
