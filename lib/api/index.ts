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
  MyTutorialDto,
  TutorialStatusValue,
  CategoryDto,
  CreateTutorialRequest,
  UpdateTutorialRequest,
  CreateTutorialStepRequest,
  TutorialResponse,
  TutorialAuthorDetailDto,
  TutorialProgressDto,
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
  MediaItemDto,
  PostType,
  CommunityPostDto,
  CreateCommunityPostRequest,
  ToggleLikeResponse,
  CommentDto,
  AddCommentRequest,
} from "./community-posts";
export { communityPostsApi } from "./community-posts";

export type { NotificationDto, NotificationPagedResult } from "./notifications";
export { notificationsApi } from "./notifications";

export type { ReportTargetType, SubmitReportRequest } from "./reports";
export { reportsApi } from "./reports";

export type {
  SubscriptionDto,
  SubscriptionPagedResult,
  VipTierDto,
  CreatorRevenueDto,
  RevenueMonthDto,
} from "./subscriptions";
export { subscriptionsApi } from "./subscriptions";

export type { JournalDto, CreateJournalRequest, UpdateJournalRequest } from "./journals";
export { journalsApi } from "./journals";

export type {
  CreatorProfileDto,
  UpdateProfileRequest,
  ToggleFollowResponse,
  FollowerUserDto,
  UserPagedResult,
} from "./users";
export { usersApi } from "./users";

export type { WishlistToggleResponse, WishlistItemDto, WishlistPagedResult } from "./wishlists";
export { wishlistsApi } from "./wishlists";

export type {
  BlockedWordResponse,
  AdminUserResponse,
  PendingReportDto,
  ManagerQueueItemResponse,
  CategoryResponse,
} from "./admin";
export { adminApi } from "./admin";

export type {
  LearningPathStatusValue,
  LearningPathItemDto,
  LearningPathDto,
  LearningPathListItemDto,
  LearningPathContextDto,
  CreateLearningPathRequest,
  UpdateLearningPathRequest,
} from "./learning-paths";
export { learningPathsApi } from "./learning-paths";
