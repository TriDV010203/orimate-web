// lib/api/community-posts.ts — Community posts API endpoints

import { request } from "./client";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface MediaItemDto {
  mediaUrl: string;
  mediaType: "Image" | "Video";
}

export type PostType = "photo" | "achievement" | "tutorial" | "standard";

export interface CommunityPostDto {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  media: MediaItemDto[];
  // Loại bài đăng (backend có thể trả về hoặc suy luận từ linkedTutorialId + media)
  postType?: PostType | null;
  // Tutorial được liên kết (khi postType = "tutorial" hoặc "achievement")
  linkedTutorialId?: string | null;
  linkedTutorialTitle?: string | null;
  linkedTutorialSlug?: string | null;
}

export interface CreateCommunityPostRequest {
  content: string;
  tutorialId?: string | null;
  mediaItems?: MediaItemDto[] | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ToggleLikeResponse {
  isLiked: boolean;
}

export interface CommentDto {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface AddCommentRequest {
  targetId: string;
  targetType: "CommunityPost" | "Tutorial";
  content: string;
}

// ── Community Posts API ───────────────────────────────────────────────────────

export const communityPostsApi = {
  /** GET /api/community-posts/feed — Danh sách bài đăng (phân trang) */
  getFeed(
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<PagedResult<CommunityPostDto>> {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<CommunityPostDto>>(
      `/api/community-posts/feed${qs}`,
      { token }
    );
  },

  /** GET /api/community-posts/{id} — Lấy một bài viết theo ID */
  getById(
    postId: string,
    token?: string
  ): Promise<CommunityPostDto> {
    return request<CommunityPostDto>(`/api/community-posts/${postId}`, { token });
  },

  /** POST /api/community-posts — Tạo bài viết mới (cần đăng nhập) */
  createPost(
    token: string,
    body: CreateCommunityPostRequest
  ): Promise<{ postId: string }> {
    return request<{ postId: string }>("/api/community-posts", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  /** POST /api/likes/toggle — Like / Unlike (cần đăng nhập) */
  toggleLike(
    token: string,
    targetId: string,
    targetType: "CommunityPost" | "Tutorial"
  ): Promise<ToggleLikeResponse> {
    // Dùng PascalCase key vì backend dùng C# positional record (TargetId, TargetType)
    return request<ToggleLikeResponse>("/api/likes/toggle", {
      method: "POST",
      body: JSON.stringify({ TargetId: targetId, TargetType: targetType }),
      token,
    });
  },

  /** GET /api/comments?targetId=&targetType=CommunityPost — Lấy comments của một bài */
  getComments(
    targetId: string,
    targetType: "CommunityPost" | "Tutorial" = "CommunityPost",
    page = 1,
    pageSize = 20
  ): Promise<PagedResult<CommentDto>> {
    return request<PagedResult<CommentDto>>(
      `/api/comments?targetId=${targetId}&targetType=${targetType}&page=${page}&pageSize=${pageSize}`
    );
  },

  /** POST /api/comments — Đăng bình luận (cần đăng nhập) */
  addComment(
    token: string,
    body: AddCommentRequest
  ): Promise<{ commentId: string }> {
    // Dùng PascalCase key vì backend dùng C# positional record (TargetId, TargetType, Content)
    return request<{ commentId: string }>("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        TargetId: body.targetId,
        TargetType: body.targetType,
        Content: body.content,
      }),
      token,
    });
  },

  /** DELETE /api/comments/{id} — Xóa bình luận của mình (cần đăng nhập) */
  deleteComment(token: string, commentId: string): Promise<void> {
    return request<void>(`/api/comments/${commentId}`, {
      method: "DELETE",
      token,
    });
  },
};
