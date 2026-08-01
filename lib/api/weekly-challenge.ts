import { request } from "./client";
import { PagedResult } from "./daily-challenge";

export type WeeklyChallengeStatus = "Scheduled" | "Active" | "Closed";

export interface WeeklyChallengeDto {
  id: string;
  title: string;
  theme: string | null;
  startDate: string;
  endDate: string;
  tutorialId: string;
  tutorialTitle: string;
  tutorialSlug: string;
  tutorialDifficulty: string;
  tutorialAuthorName: string | null;
  createdByUserId: string | null;
  status: WeeklyChallengeStatus;
  submissionCount: number;
  hasSubmittedThisWeek: boolean | null;
  myWeeklyPoints: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface WeeklyChallengeSubmissionDto {
  id: string;
  weeklyChallengeId: string;
  userId: string;
  userDisplayName: string | null;
  userAvatarUrl: string | null;
  photoUrl: string;
  note: string | null;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  finalRank: number | null;
  createdAt: string;
}

export interface CreateWeeklyChallengeDto {
  title: string;
  theme?: string | null;
  startDate: string;
  endDate: string;
  tutorialId: string;
}

export interface UpdateWeeklyChallengeDto {
  title?: string;
  theme?: string;
  startDate?: string;
  endDate?: string;
  tutorialId?: string;
}

export interface SubmitWeeklyChallengeDto {
  photoUrl: string;
  note?: string | null;
}

export const weeklyChallengeApi = {
  // User endpoints
  getCurrent(token?: string): Promise<WeeklyChallengeDto> {
    return request<WeeklyChallengeDto>("/api/weekly-challenges/current", { token });
  },

  getSubmissions(
    challengeId: string,
    params?: { page?: number; pageSize?: number },
    token?: string
  ): Promise<PagedResult<WeeklyChallengeSubmissionDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<WeeklyChallengeSubmissionDto>>(
      `/api/weekly-challenges/${challengeId}/submissions${qs}`,
      { token }
    );
  },

  submit(
    challengeId: string,
    token: string,
    body: SubmitWeeklyChallengeDto
  ): Promise<WeeklyChallengeSubmissionDto> {
    return request<WeeklyChallengeSubmissionDto>(`/api/weekly-challenges/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  toggleSubmissionLike(token: string, submissionId: string): Promise<void> {
    return request<void>(`/api/weekly-challenges/submissions/${submissionId}/toggle-like`, {
      method: "POST",
      token,
    });
  },

  // Admin endpoints
  adminGetChallenges(
    token: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PagedResult<WeeklyChallengeDto>> {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.pageSize) q.set("pageSize", String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PagedResult<WeeklyChallengeDto>>(`/api/weekly-challenges/admin${qs}`, {
      token,
    });
  },

  adminCreate(token: string, body: CreateWeeklyChallengeDto): Promise<WeeklyChallengeDto> {
    return request<WeeklyChallengeDto>("/api/weekly-challenges/admin", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  adminUpdate(
    token: string,
    challengeId: string,
    body: UpdateWeeklyChallengeDto
  ): Promise<WeeklyChallengeDto> {
    return request<WeeklyChallengeDto>(`/api/weekly-challenges/admin/${challengeId}`, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    });
  },

  adminDelete(token: string, challengeId: string): Promise<void> {
    return request<void>(`/api/weekly-challenges/admin/${challengeId}`, {
      method: "DELETE",
      token,
    });
  },
};
