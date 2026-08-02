// lib/api/gamification.ts — Hạt Gấp, Streak, Daily Quest, Skill Level, Level (FT-25/26/27/28)

import { request } from "./client";

export interface SkillLevelDto {
  skillPoints: number;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | string;
}

export interface StreakDto {
  currentStreak: number;
  longestStreak: number;
  freezeCount: number;
}

export interface QuestProgressDto {
  title: string;
  progress: number;
  targetValue: number;
  isCompleted: boolean;
}

export interface HatGapBalanceDto {
  balance: number;
}

export interface HatGapLevelDto {
  level: number;
  totalEarned: number;
  balance: number;
  currentLevelFloor: number;
  nextLevelThreshold: number;
  hatGapToNextLevel: number;
  progressPercent: number;
}

export const gamificationApi = {
  /** GET /api/gamification/skill-level */
  getSkillLevel(token: string): Promise<SkillLevelDto> {
    return request<SkillLevelDto>("/api/gamification/skill-level", { token });
  },

  /** GET /api/gamification/streak */
  getStreak(token: string): Promise<StreakDto> {
    return request<StreakDto>("/api/gamification/streak", { token });
  },

  /** GET /api/gamification/quest-today — null nếu không có quest nào đang hoạt động */
  getQuestToday(token: string): Promise<QuestProgressDto | null> {
    return request<QuestProgressDto | null>("/api/gamification/quest-today", { token });
  },

  /** GET /api/gamification/hatgap-balance */
  getBalance(token: string): Promise<HatGapBalanceDto> {
    return request<HatGapBalanceDto>("/api/gamification/hatgap-balance", { token });
  },

  /** GET /api/gamification/level — Cấp độ hiện tại + tiến trình lên cấp tiếp theo */
  getLevel(token: string): Promise<HatGapLevelDto> {
    return request<HatGapLevelDto>("/api/gamification/level", { token });
  },

  /** POST /api/gamification/streak-freeze — Đổi 20 Hạt Gấp lấy 1 Streak Freeze (tối đa 2) */
  purchaseStreakFreeze(token: string): Promise<StreakDto> {
    return request<StreakDto>("/api/gamification/streak-freeze", { method: "POST", token });
  },
};
