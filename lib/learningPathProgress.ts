// lib/learningPathProgress.ts — Tiến trình lộ trình học, lưu tạm ở localStorage.
// Chưa có bảng tiến trình lộ trình thật ở BE (FT-33 chỉ có LearningPath/LearningPathItem) —
// dùng TutorialId thật để đối chiếu với Achievement thật khi user đã đăng nhập.

function storageKey(pathId: string) {
  return `origami_path_progress_${pathId}`;
}

export function getCompletedTutorialIds(pathId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(pathId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function setCompletedTutorialIds(pathId: string, ids: Set<string>) {
  try {
    localStorage.setItem(storageKey(pathId), JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}
