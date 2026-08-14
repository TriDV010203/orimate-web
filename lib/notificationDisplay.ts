// lib/notificationDisplay.ts — Ánh xạ loại thông báo (BE enum NotificationType) sang icon, màu sắc,
// nhãn tiếng Việt và đường dẫn điều hướng. Dùng chung cho NotificationPopover và NotificationsPage.

import type { NotificationDto } from "./api/notifications";

interface NotifTypeMeta {
  icon: string;
  color: string;
  label: string;
}

const TYPE_META: Record<string, NotifTypeMeta> = {
  follow: { icon: "👤", color: "#2C7DA0", label: "Người theo dõi mới" },
  newfollower: { icon: "👤", color: "#2C7DA0", label: "Người theo dõi mới" },
  like: { icon: "❤️", color: "#D4713B", label: "Lượt thích" },
  comment: { icon: "💬", color: "#2D6A4F", label: "Bình luận" },
  newcomment: { icon: "💬", color: "#2D6A4F", label: "Bình luận mới" },
  tutorialstatuschanged: { icon: "📋", color: "#6B7280", label: "Cập nhật hướng dẫn" },
  system: { icon: "📢", color: "#6B7280", label: "Hệ thống" },
  newtutorialpendingreview: { icon: "🕓", color: "#F59F00", label: "Chờ duyệt" },
  tutorialreadyformanagerapproval: { icon: "🕓", color: "#F59F00", label: "Chờ duyệt" },
  tutorialrevisionrequired: { icon: "✏️", color: "#D4713B", label: "Cần chỉnh sửa" },
  tutorialpublished: { icon: "🎉", color: "#2D6A4F", label: "Đã xuất bản" },
  tutorialrejected: { icon: "✏️", color: "#D4713B", label: "Cần chỉnh sửa" },
  tutorialremoved: { icon: "🗑️", color: "#E03131", label: "Đã gỡ bỏ" },
  tutorialeditpublished: { icon: "🎉", color: "#2D6A4F", label: "Chỉnh sửa đã duyệt" },
  tutorialeditrejected: { icon: "✏️", color: "#D4713B", label: "Chỉnh sửa bị từ chối" },
  accountsuspended: { icon: "🚫", color: "#E03131", label: "Tài khoản bị khoá" },
  accountactivated: { icon: "✅", color: "#2D6A4F", label: "Tài khoản được kích hoạt" },
  milestoneunlocked: { icon: "🏆", color: "#F59F00", label: "Thành tựu" },
  learningpathcompleted: { icon: "🎓", color: "#2D6A4F", label: "Hoàn thành lộ trình" },
  streakmilestonereached: { icon: "🔥", color: "#D4713B", label: "Chuỗi ngày" },
  tutorialselectedaschallenge: { icon: "🌟", color: "#F59F00", label: "Thử thách" },
  dailychallengeresult: { icon: "🏆", color: "#F59F00", label: "Kết quả thử thách" },
  badgeearned: { icon: "🎖️", color: "#F59F00", label: "Huy hiệu mới" },
  newmodeunlocksubmission: { icon: "📩", color: "#2C7DA0", label: "Bài nộp mới" },
  modeunlockapproved: { icon: "✅", color: "#2D6A4F", label: "Mở khoá thành công" },
  modeunlockrejected: { icon: "✏️", color: "#D4713B", label: "Chưa đạt yêu cầu" },
  achievement: { icon: "🏆", color: "#F59F00", label: "Thành tựu" },
  vip: { icon: "💎", color: "#D4713B", label: "VIP" },
};

const DEFAULT_META: NotifTypeMeta = { icon: "📢", color: "#6B7280", label: "Thông báo" };

function getMeta(type: string): NotifTypeMeta {
  return TYPE_META[type?.toLowerCase()] ?? DEFAULT_META;
}

export function getNotifIcon(type: string): string {
  return getMeta(type).icon;
}

export function getNotifColor(type: string): string {
  return getMeta(type).color;
}

/** Nhãn phân loại tiếng Việt, hiển thị như một tag nhỏ để người dùng biết ngay đây là thông báo gì. */
export function getNotifLabel(type: string): string {
  return getMeta(type).label;
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

/** Điều hướng đến đúng nơi liên quan đến thông báo, tuỳ theo loại thực thể (entityType) từ BE. */
export function getNotifLink(notif: NotificationDto): string {
  const { entityType, entityId } = notif;
  if (!entityType || !entityId) return "#";
  switch (entityType) {
    // Hướng dẫn của mình (cần sửa, được duyệt, có bình luận/lượt thích...) → vào thẳng Creator Studio.
    case "Tutorial":
      return `/studio/${entityId}`;
    case "CommunityPost":
      return `/cong-dong/${entityId}`;
    case "Achievement":
    case "Badge":
    case "PersonalMilestone":
    case "StreakLog":
      return "/ho-so/thanh-tich";
    case "LearningPath":
      return `/lo-trinh/${entityId}`;
    case "WeeklyChallenge":
    case "WeeklyChallengeSubmission":
      return "/thach-thuc-tuan";
    case "DailyChallenge":
    case "DailyChallengeSubmission":
      return "/thach-thuc";
    case "ModeUnlockSubmission":
      return "/lo-trinh";
    default:
      return "#";
  }
}
