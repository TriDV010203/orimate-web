// lib/api/index.ts — Barrel export: tập hợp toàn bộ API modules
// Import từ "@/lib/api" vẫn hoạt động bình thường như trước

export type { ApiError } from "./client";

export type { AuthResponse, MessageResponse } from "./auth";
export { authApi } from "./auth";

export type {
  AuthorDto,
  TutorialStepDto,
  TutorialListItemDto,
  TutorialDetailDto,
  PagedResult,
} from "./tutorials";
export { tutorialsApi } from "./tutorials";

export type {
  AchievementDto,
  CreateAchievementRequest,
  UpdateAchievementRequest,
  PaginatedResult,
} from "./achievements";
export { achievementsApi } from "./achievements";

export type {
  BlockedWordResponse,
  AdminUserResponse,
  PendingReportDto,
  TutorialReviewItemResponse,
  CategoryResponse,
} from "./admin";
export { adminApi } from "./admin";
