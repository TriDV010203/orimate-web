// lib/api/badges.ts — Danh hiệu (FT-35)

import { request } from "./client";

export type BadgeCategory =
  | "TutorialCount"
  | "DifficultyCount"
  | "StreakLearning"
  | "StreakChallenge"
  | "ChallengeRank"
  | "Author"
  | string;

export interface BadgeDto {
  id: string;
  code: string;
  name: string;
  description: string;
  iconEmoji: string;
  category: BadgeCategory;
  threshold: number | null;
}

export interface UserBadgeDto {
  badgeId: string;
  code: string;
  name: string;
  description: string;
  iconEmoji: string;
  category: BadgeCategory;
  earnedAt: string;
}

export const badgesApi = {
  /** GET /api/gamification/badges — toàn bộ danh mục danh hiệu (public) */
  getCatalog(): Promise<BadgeDto[]> {
    return request<BadgeDto[]>("/api/gamification/badges");
  },

  /** GET /api/gamification/me/badges — danh hiệu người dùng hiện tại đã đạt (cần đăng nhập) */
  getMyBadges(token: string): Promise<UserBadgeDto[]> {
    return request<UserBadgeDto[]>("/api/gamification/me/badges", { token });
  },
};
