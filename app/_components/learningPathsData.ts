// _components/learningPathsData.ts — Dữ liệu tĩnh (mock) cho tính năng "Lộ trình học"
//
// Chưa nối API — đây là bản thiết kế để demo UX trước khi có BE thật cho LearningPath.
// Theo thiết kế đã thống nhất: lộ trình do admin/manager biên soạn từ chính bài
// hướng dẫn họ đã đăng (không lấy bài của creator khác), xếp theo thứ tự cố định,
// mở khoá tuần tự (phải hoàn thành bài trước mới học được bài sau).

export interface PathLesson {
  id: string;
  title: string;
  emoji: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  minutes: number;
  /** Nếu có slug, bài này trỏ tới một tutorial thật đã tồn tại trong hệ thống. */
  tutorialSlug?: string;
}

export interface LearningPath {
  slug: string;
  title: string;
  tagline: string;
  level: "Cơ bản" | "Nâng cao";
  coverEmoji: string;
  coverGradient: string;
  accentColor: string;
  estimatedTime: string;
  rating: number;
  learnerCount: number;
  rewardBadge: { icon: string; title: string };
  lessons: PathLesson[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "khoi-dau-voi-origami",
    title: "Khởi đầu với Origami",
    tagline: "5 bài gấp nền tảng giúp bạn quen tay với các nếp gấp cơ bản nhất — từ gấp đôi, gấp chéo đến mô hình hoàn chỉnh đầu tiên.",
    level: "Cơ bản",
    coverEmoji: "🐣",
    coverGradient: "linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)",
    accentColor: "#1b4332",
    estimatedTime: "~2 giờ",
    rating: 4.8,
    learnerCount: 8213,
    rewardBadge: { icon: "🌱", title: "Người mới bắt đầu" },
    lessons: [
      { id: "l1", title: "Thuyền giấy cơ bản", emoji: "⛵", difficulty: "Dễ", minutes: 10 },
      { id: "l2", title: "Con bướm giấy", emoji: "🦋", difficulty: "Dễ", minutes: 15 },
      { id: "l3", title: "Hộp giấy Masu", emoji: "📦", difficulty: "Dễ", minutes: 15 },
      { id: "l4", title: "Hạc giấy cổ điển", emoji: "🦢", difficulty: "Trung bình", minutes: 25, tutorialSlug: "huong-dan-gap-hac-giay" },
      { id: "l5", title: "Hoa Tulip giấy", emoji: "🌷", difficulty: "Trung bình", minutes: 20 },
    ],
  },
  {
    slug: "chinh-phuc-modular-origami",
    title: "Chinh phục Modular Origami",
    tagline: "6 bài nâng cao dành cho người đã nắm chắc kỹ thuật cơ bản, tiến tới ghép các mô-đun thành mô hình phức tạp, nhiều lớp.",
    level: "Nâng cao",
    coverEmoji: "🔺",
    coverGradient: "linear-gradient(135deg, #d4713b 0%, #e8955f 100%)",
    accentColor: "#8a3f1c",
    estimatedTime: "~5 giờ",
    rating: 4.7,
    learnerCount: 3026,
    rewardBadge: { icon: "💎", title: "Nghệ nhân Modular" },
    lessons: [
      { id: "l1", title: "Đơn vị Sonobe cơ bản", emoji: "🔷", difficulty: "Trung bình", minutes: 20 },
      { id: "l2", title: "Khối lập phương Sonobe", emoji: "🧊", difficulty: "Trung bình", minutes: 30 },
      { id: "l3", title: "Ngôi sao Kusudama 8 cánh", emoji: "✨", difficulty: "Khó", minutes: 40 },
      { id: "l4", title: "Quả cầu Kusudama hoa", emoji: "🌸", difficulty: "Khó", minutes: 45 },
      { id: "l5", title: "Rồng giấy modular", emoji: "🐉", difficulty: "Khó", minutes: 60 },
      { id: "l6", title: "Đèn lồng hình học 3D", emoji: "🏮", difficulty: "Khó", minutes: 50 },
    ],
  },
];

export function getPathBySlug(slug: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.slug === slug);
}

/** Tìm xem 1 tutorial (theo slug) thuộc lộ trình nào — dùng để trang chi tiết
 *  tutorial biết "mình đang nằm trong lộ trình X, ở vị trí thứ mấy". */
export function findLessonContext(
  tutorialSlug: string
): { path: LearningPath; lesson: PathLesson; index: number } | undefined {
  for (const path of LEARNING_PATHS) {
    const index = path.lessons.findIndex((l) => l.tutorialSlug === tutorialSlug);
    if (index !== -1) return { path, lesson: path.lessons[index], index };
  }
  return undefined;
}

/** Bài kế tiếp trong lộ trình có mở khoá được không, dựa trên bài hiện tại đã hoàn thành. */
export function isLessonUnlocked(path: LearningPath, index: number, completed: Set<string>): boolean {
  return index === 0 || completed.has(path.lessons[index - 1].id);
}

// ── Tiến trình (mock, lưu localStorage) ────────────────────────────────────────

function storageKey(pathSlug: string) {
  return `origami_path_progress_${pathSlug}`;
}

export function getCompletedLessonIds(pathSlug: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(pathSlug));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function setCompletedLessonIds(pathSlug: string, ids: Set<string>) {
  try {
    localStorage.setItem(storageKey(pathSlug), JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function getPathProgress(path: LearningPath): { completed: number; total: number; percent: number } {
  const done = getCompletedLessonIds(path.slug);
  const completed = path.lessons.filter((l) => done.has(l.id)).length;
  const total = path.lessons.length;
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}
