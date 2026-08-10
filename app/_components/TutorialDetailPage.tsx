"use client";
// _components/TutorialDetailPage.tsx — Trang chi tiết hướng dẫn gấp giấy

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReportModal from "./ReportModal";
import AuthorLink from "./AuthorLink";
import CommentSection from "./CommentSection";
import Model3DViewer from "./Model3DViewer";
import ImageUploadField from "./ImageUploadField";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  tutorialsApi, achievementsApi, communityPostsApi, wishlistsApi, learningPathsApi,
  type TutorialDetailDto, type TutorialStepDto, type AchievementDto, type ApiError,
  type LearningPathContextDto, type PerceivedDifficultyValue,
} from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";
import { getCompletedTutorialIds, setCompletedTutorialIds } from "@/lib/learningPathProgress";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDiffLabel(d?: string | null) {
  if (!d) return "Không xác định";
  const l = d.toLowerCase();
  if (l === "beginner") return "Dễ";
  if (l === "intermediate") return "Trung bình";
  if (l === "advanced") return "Khó";
  return d;
}
function getDiffColor(d?: string | null) {
  const l = (d ?? "").toLowerCase();
  if (l === "beginner" || l === "dễ") return { bg: "#D1FAE5", text: "#065F46" };
  if (l === "intermediate" || l === "trung bình") return { bg: "#FEF3C7", text: "#92400E" };
  if (l === "advanced" || l === "khó") return { bg: "#FEE2E2", text: "#991B1B" };
  return { bg: "#F3F4F6", text: "#374151" };
}

function fmtLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const PERCEIVED_DIFFICULTY_OPTIONS: { value: PerceivedDifficultyValue; label: string; emoji: string }[] = [
  { value: "Easy", label: "Dễ", emoji: "🙂" },
  { value: "Medium", label: "Trung bình", emoji: "😐" },
  { value: "Hard", label: "Khó", emoji: "😣" },
];

// ─── Modal lưu thành tựu ─────────────────────────────────────────────────────
interface AchievementModalProps {
  tutorialId: string;
  tutorialTitle: string;
  /** Người dùng đã từng đánh giá độ khó bài này chưa — nếu rồi thì không hỏi lại (BE chỉ nhận lần đầu). */
  hasRated: boolean;
  onClose: () => void;
  onSuccess: (achievement: AchievementDto) => void;
}

function AchievementModal({ tutorialId, tutorialTitle, hasRated, onClose, onSuccess }: AchievementModalProps) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<PerceivedDifficultyValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const token = getToken()!;
      const result = await tutorialsApi.completeTutorial(token, tutorialId, {
        perceivedDifficulty: hasRated ? null : perceivedDifficulty,
        photoUrl: photoUrl.trim() || null,
        note: note.trim() || null,
        isPublic,
      });
      onSuccess(result.achievement);
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Không thể lưu thành tựu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: "480px", overflow: "hidden", animation: "slideUp 0.25s ease" }}>
        {/* Header */}
        <div style={{ background: "var(--gradient-primary)", padding: "1.75rem 1.5rem 1.25rem", position: "relative" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", textAlign: "center" }}>🏆</div>
          <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.25rem", textAlign: "center", marginBottom: "0.25rem" }}>Chúc mừng!</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", textAlign: "center" }}>
            Bạn đã hoàn thành &ldquo;{tutorialTitle}&rdquo;
          </p>
          <button onClick={onClose} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "2rem", height: "2rem", cursor: "pointer", color: "white", fontSize: "1.125rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#991B1B", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          {/* Photo */}
          <div style={{ marginBottom: "1rem" }}>
            <ImageUploadField
              value={photoUrl}
              onChange={setPhotoUrl}
              token={getToken() ?? ""}
              folder="achievements"
              label="📷 Ảnh tác phẩm của bạn (tùy chọn)"
              variant="compact"
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>Bạn có thể thêm ảnh sau trong trang Thành tựu</p>
          </div>

          {/* Note */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="achievement-note" style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem", color: "var(--color-text-primary)" }}>
              📝 Ghi chú (tùy chọn)
            </label>
            <textarea
              id="achievement-note" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về bài hướng dẫn này..."
              rows={3}
              style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "var(--color-text-primary)", background: "var(--color-bg)", resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Đánh giá độ khó (chỉ hỏi lần đầu hoàn thành — BE bỏ qua nếu đã có rating) */}
          {!hasRated && (
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                🤔 Bạn thấy bài này khó không? (tùy chọn)
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {PERCEIVED_DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPerceivedDifficulty((cur) => (cur === opt.value ? null : opt.value))}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                      padding: "0.625rem 0.5rem", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      border: perceivedDifficulty === opt.value ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                      background: perceivedDifficulty === opt.value ? "var(--color-surface-2)" : "var(--color-surface)",
                      fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Is Public */}
          <label htmlFor="achievement-public" style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "1.5rem" }}>
            <input id="achievement-public" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: "1.125rem", height: "1.125rem", accentColor: "var(--color-primary)" }} />
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Hiển thị thành tựu này công khai trên trang cá nhân
            </span>
          </label>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }} disabled={saving}>Để sau</button>
            <button onClick={handleSave} className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang lưu...
                </span>
              ) : <>🏆 Lưu thành tựu</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal thành công ─────────────────────────────────────────────────────────
interface SuccessModalProps {
  onClose: () => void;
  /** Có khi bài này thuộc 1 lộ trình — ưu tiên đưa người dùng quay lại đó. */
  pathReturn?: { pathId: string; pathTitle: string; isLastLesson: boolean };
}

function SuccessModal({ onClose, pathReturn }: SuccessModalProps) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1001, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.2s ease" }}>
      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: "400px", padding: "2.5rem 2rem", textAlign: "center", animation: "slideUp 0.25s ease" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontWeight: 800, fontSize: "1.375rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>Đã lưu thành tựu!</h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
          {pathReturn
            ? (pathReturn.isLastLesson
              ? `Đây là bài cuối cùng — quay lại lộ trình "${pathReturn.pathTitle}" để nhận huy hiệu hoàn thành!`
              : `Bài tiếp theo trong lộ trình "${pathReturn.pathTitle}" đã được mở khoá.`)
            : "Thành tựu của bạn đã được lưu. Hãy vào trang Thành tựu để xem và thêm ảnh tác phẩm nhé!"}
        </p>
        {pathReturn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <Link href={`/lo-trinh/${pathReturn.pathId}`} className="btn btn-primary" style={{ justifyContent: "center" }}>
              🗺️ Quay lại lộ trình
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button onClick={onClose} className="btn btn-outline btn-sm">Đóng</button>
              <Link href="/ho-so/thanh-tich" className="btn btn-outline btn-sm">Xem thành tựu</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button onClick={onClose} className="btn btn-outline">Đóng</button>
            <Link href="/ho-so/thanh-tich" className="btn btn-primary">
              Xem thành tựu
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step Viewer (1 bước / màn hình, điều hướng trái-phải) ────────────────────
interface StepViewerProps {
  step: TutorialStepDto;
  index: number;
  total: number;
  isCompleted: boolean;
  isLastStep: boolean;
  alreadyAchieved: boolean;
  onComplete: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  tutorialSlug: string;
}

function NavArrowButton({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Bước trước" : "Bước sau"}
      style={{
        position: "absolute", top: "50%", [direction]: "0.625rem", transform: "translateY(-50%)",
        width: "2.5rem", height: "2.5rem", borderRadius: "50%", flexShrink: 0,
        border: "none", background: disabled ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.92)",
        boxShadow: "var(--shadow-md)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
        transition: "all var(--transition-fast)",
        zIndex: 2,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
      </svg>
    </button>
  );
}

function StepViewer({ step, index, total, isCompleted, isLastStep, alreadyAchieved, onComplete, onPrev, onNext, hasPrev, hasNext, tutorialSlug }: StepViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);

  // Đóng chế độ toàn màn hình bằng phím Esc, khoá scroll nền trong lúc mở
  useEffect(() => {
    if (!fullscreen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFullscreen(false);
    }
    window.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  // Ở chế độ toàn màn hình, ảnh và mô tả nằm cạnh nhau (ảnh chiếm phần lớn chiều rộng)
  // để ảnh hiển thị to nhất có thể thay vì bị bó hẹp trong 1 khung nhỏ giữa màn hình.
  const imageHeight = fullscreen ? "min(78vh, 800px)" : "min(34vh, 260px)";
  const descHeight = fullscreen ? "min(78vh, 800px)" : "6rem";

  const footerNav = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
      <button onClick={onPrev} disabled={!hasPrev} className="btn btn-outline btn-sm" style={{ opacity: hasPrev ? 1 : 0.5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        Bước trước
      </button>

      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
        Bước {step.stepOrder} / {total}
      </span>

      {isLastStep ? (
        alreadyAchieved ? (
          <span className="btn btn-outline btn-sm" style={{ pointerEvents: "none", color: "#059669", borderColor: "#059669" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            Đã hoàn thành
          </span>
        ) : (
          <button id={`step-complete-${step.id}`} onClick={onComplete} className="btn btn-primary btn-sm" style={{ background: "#059669", borderColor: "#059669" }}>
            🏆 Hoàn thành
          </button>
        )
      ) : (
        <button onClick={onNext} disabled={!hasNext} className="btn btn-outline btn-sm" style={{ opacity: hasNext ? 1 : 0.5 }}>
          Bước sau
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}
    </div>
  );

  const card = (
    <div
      style={{
        border: `2px solid ${isCompleted ? "#D1FAE5" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        background: isCompleted ? "#F0FDF4" : "var(--color-surface)",
        padding: "1.25rem",
        ...(fullscreen
          ? { width: "100%", maxWidth: "min(96vw, 1500px)", maxHeight: "92vh", overflowY: "auto", boxShadow: "var(--shadow-xl)" }
          : {}),
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
          <div
            id={`step-check-${step.id}`}
            style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${isCompleted ? "#059669" : "var(--color-border)"}`,
              background: isCompleted ? "#059669" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all var(--transition-fast)",
              color: "white", fontWeight: 700, fontSize: "0.875rem",
            }}
          >
            {isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <span style={{ color: "var(--color-text-muted)", fontWeight: 700 }}>{step.stepOrder}</span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: isCompleted ? "#065F46" : "var(--color-text-primary)" }}>
            Bước {step.stepOrder} <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>/ {total}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
          <button
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? "Thu nhỏ" : "Xem toàn màn hình"}
            title={fullscreen ? "Thu nhỏ" : "Xem toàn màn hình"}
            style={{
              width: "2rem", height: "2rem", borderRadius: "50%", border: "1.5px solid var(--color-border)",
              background: "var(--color-surface)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-text-primary)",
            }}
          >
            {fullscreen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m8-5h3a2 2 0 0 1 2 2v3" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            )}
          </button>
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Bước trước"
            style={{
              width: "2rem", height: "2rem", borderRadius: "50%", border: "1.5px solid var(--color-border)",
              background: "var(--color-surface)", cursor: hasPrev ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: hasPrev ? "var(--color-text-primary)" : "var(--color-text-muted)", opacity: hasPrev ? 1 : 0.5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Bước sau"
            style={{
              width: "2rem", height: "2rem", borderRadius: "50%", border: "1.5px solid var(--color-border)",
              background: "var(--color-surface)", cursor: hasNext ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: hasNext ? "var(--color-text-primary)" : "var(--color-text-muted)", opacity: hasNext ? 1 : 0.5,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {step.isLocked ? (
        /* Bước bị khoá VIP — không còn description/imageUrl để hiển thị (đã bị server ẩn) */
        <div style={{
          position: "relative", marginBottom: "0.875rem", borderRadius: "var(--radius-md)",
          background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
          border: "1.5px dashed #F59E0B",
          padding: "2.5rem 1.5rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
          <p style={{ fontWeight: 700, color: "#92400E", fontSize: "1rem", marginBottom: "0.375rem" }}>
            Bước này chỉ dành cho thành viên VIP
          </p>
          <p style={{ color: "#B45309", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Đăng ký VIP của tác giả để xem toàn bộ nội dung bài hướng dẫn.
          </p>
          <Link href={`/huong-dan/${tutorialSlug}/vip`} className="btn btn-accent" style={{ textDecoration: "none", display: "inline-flex" }}>
            🔓 Mua VIP để xem tiếp
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: fullscreen ? "row" : "column",
            alignItems: fullscreen ? "flex-start" : "stretch",
            gap: fullscreen ? "1.5rem" : "0.875rem",
            marginBottom: fullscreen ? 0 : undefined,
          }}
        >
          {/* Image with side arrows */}
          {isValidImageUrl(step.imageUrl) && (
            <div
              style={{
                position: "relative",
                flex: fullscreen ? "1 1 64%" : undefined,
                minWidth: 0,
                width: fullscreen ? undefined : "100%",
                marginBottom: fullscreen ? 0 : "0.875rem",
              }}
            >
              <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", height: imageHeight, background: "var(--color-surface-2)" }}>
                <Image
                  src={step.imageUrl}
                  alt={`Bước ${step.stepOrder}`}
                  fill
                  sizes={fullscreen ? "64vw" : "(max-width: 768px) 100vw, 60vw"}
                  style={{ objectFit: "contain" }}
                  priority={index === 0}
                />
              </div>
              <NavArrowButton direction="left" onClick={onPrev} disabled={!hasPrev} />
              <NavArrowButton direction="right" onClick={onNext} disabled={!hasNext} />
            </div>
          )}

          {/* Cột phải (fullscreen): mô tả co giãn + nút điều hướng luôn nằm ngay dưới, không cần cuộn cả khung mới thấy */}
          <div
            style={{
              display: fullscreen ? "flex" : undefined,
              flexDirection: fullscreen ? "column" : undefined,
              height: fullscreen ? imageHeight : undefined,
              flex: fullscreen ? "1 1 36%" : undefined,
              minWidth: 0,
            }}
          >
            {/* Description — chiều cao cố định (không co giãn theo độ dài), cuộn riêng nếu quá dài */}
            <div
              style={{
                fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7,
                whiteSpace: "pre-wrap", overflowY: "auto", paddingRight: "0.375rem",
                height: fullscreen ? undefined : descHeight,
                flex: fullscreen ? "1 1 auto" : undefined,
                minHeight: 0,
              }}
            >
              {step.description}
            </div>

            {fullscreen && <div style={{ flexShrink: 0, marginTop: "1rem" }}>{footerNav}</div>}
          </div>
        </div>
      )}

      {/* Footer nav (không toàn màn hình): 1 thanh full-width bên dưới ảnh + mô tả */}
      {!fullscreen && <div style={{ marginTop: "1rem" }}>{footerNav}</div>}
    </div>
  );

  if (!fullscreen) return card;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem", animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setFullscreen(false); }}
    >
      {card}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TutorialDetailPageProps { slug: string; }

export default function TutorialDetailPage({ slug }: TutorialDetailPageProps) {
  // Chỉ hiển thị UI "thuộc lộ trình" (banner + nút quay lại lộ trình) khi người dùng
  // thực sự đến từ trang lộ trình (bấm "Học ngay" ở đó) — không hiển thị nếu vào thẳng
  // bài hướng dẫn từ nơi khác, dù bài này có thuộc 1 lộ trình đã xuất bản hay không.
  const searchParams = useSearchParams();
  const fromPathId = searchParams.get("tuLoTrinh");
  // true khi đến từ nút "Xem hướng dẫn" trong panel bài test mở khoá chế độ lộ trình.
  const cameFromModeTest = searchParams.get("tuBaiTest") === "1";
  const modeTestModeId = searchParams.get("modeId");
  const fromReport = searchParams.get("fromReport") === "1";

  const [tutorial, setTutorial] = useState<TutorialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đã bấm "Bắt đầu" chưa — false: trang thông tin đầy đủ, true: trình xem từng bước.
  // Mỗi lần bấm "Bắt đầu" các tích hoàn thành được reset về rỗng, bắt đầu lại từ bước 1
  // (không resume từ lần học trước) — BE vẫn ghi nhận tiến độ/thưởng ở hậu trường.
  const [started, setStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Like / Save state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Achievement
  const [existingAchievement, setExistingAchievement] = useState<AchievementDto | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Report
  const [showReportModal, setShowReportModal] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(isLoggedIn());
  }, []);

  // Load tutorial (với token nếu đã đăng nhập để nhận isLiked/isSaved/isCompleted)
  useEffect(() => {
    if (!slug) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    tutorialsApi
      .getBySlug(slug, getToken() ?? undefined)
      .then((data) => {
        setTutorial(data);
        setIsLiked(data.isLikedByCurrentUser ?? false);
        setLikeCount(data.likeCount ?? 0);
        setIsSaved(data.isWishlistedByCurrentUser ?? false);
        // Mở bước đầu tiên mặc định
        if (data.steps?.length > 0) {
          const sorted = [...data.steps].sort((a, b) => a.stepOrder - b.stepOrder);
          setActiveStep(sorted[0].id);
        }
      })
      .catch((err: ApiError) => {
        setError(err?.message ?? "Không tìm thấy bài hướng dẫn.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Kiểm tra achievement hiện có (nếu đã đăng nhập)
  useEffect(() => {
    if (!tutorial || !isLoggedIn()) return;
    const token = getToken()!;
    achievementsApi.getMine(token, 1, 100)
      .then((res) => {
        const found = res.items.find((a) => a.tutorialId === tutorial.id);
        if (found) setExistingAchievement(found);
      })
      .catch(() => { /* silent */ });
  }, [tutorial?.id]);

  // Bài này có thuộc 1 lộ trình học đã xuất bản không? (GET /api/learning-paths/for-tutorial/{id})
  const [pathCtx, setPathCtx] = useState<LearningPathContextDto | null>(null);
  useEffect(() => {
    if (!tutorial) return;
    let cancelled = false;
    learningPathsApi.getForTutorial(tutorial.id)
      .then((res) => { if (!cancelled) setPathCtx(res); })
      .catch(() => { if (!cancelled) setPathCtx(null); });
    return () => { cancelled = true; };
  }, [tutorial]);

  // true chỉ khi query param khớp đúng lộ trình mà bài này thuộc về — tức người dùng
  // đến đây bằng cách bấm "Học ngay" từ trang lộ trình đó.
  const cameFromPath = !!pathCtx && fromPathId === pathCtx.pathId;

  // Nếu bài này thuộc 1 lộ trình và đã có achievement từ trước (vd. hoàn thành trước khi
  // tính năng lộ trình tồn tại), đảm bảo lộ trình cũng ghi nhận bài này đã xong.
  useEffect(() => {
    if (!pathCtx || !existingAchievement || !tutorial) return;
    const done = getCompletedTutorialIds(pathCtx.pathId);
    if (!done.has(tutorial.id)) {
      done.add(tutorial.id);
      setCompletedTutorialIds(pathCtx.pathId, done);
    }
  }, [pathCtx, existingAchievement, tutorial]);

  const steps = useMemo(
    () => (tutorial ? [...tutorial.steps].sort((a, b) => a.stepOrder - b.stepOrder) : []),
    [tutorial]
  );

  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedSteps.has(s.id)).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Ghi nhận 1 bước đã hoàn thành lên BE (chạy nền, im lặng bỏ qua nếu đã hoàn thành từ trước
  // hoặc lỗi mạng) — dùng để BE cộng Hạt Gấp/streak/skill point, không chặn UI cục bộ.
  const markStepBackend = useCallback((stepId: string) => {
    if (!tutorial || !isLoggedIn()) return;
    const token = getToken();
    if (!token) return;
    tutorialsApi.completeStep(token, tutorial.id, stepId).catch(() => { /* đã hoàn thành / lỗi mạng — bỏ qua */ });
  }, [tutorial]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps((prev) => (prev.has(stepId) ? prev : new Set(prev).add(stepId)));
    markStepBackend(stepId);
  }, [markStepBackend]);

  const activeStepIndex = steps.findIndex((s) => s.id === activeStep);
  const hasPrevStep = activeStepIndex > 0;
  const hasNextStep = activeStepIndex >= 0 && activeStepIndex < steps.length - 1;
  const isLastStepActive = totalSteps > 0 && activeStepIndex === totalSteps - 1;

  const goPrevStep = useCallback(() => {
    if (activeStepIndex <= 0) return;
    setActiveStep(steps[activeStepIndex - 1].id);
  }, [steps, activeStepIndex]);

  // Chuyển sang bước tiếp theo tự động đánh dấu hoàn thành bước đang rời đi — quay lại
  // bước trước đó (goPrevStep / bấm bước bất kỳ) không xoá các tích đã có.
  const goNextStep = useCallback(() => {
    if (activeStepIndex < 0 || activeStepIndex >= steps.length - 1) return;
    markStepComplete(steps[activeStepIndex].id);
    const nextStep = steps[activeStepIndex + 1];
    if (!nextStep.isLocked) markStepComplete(nextStep.id);
    setActiveStep(nextStep.id);
  }, [steps, activeStepIndex, markStepComplete]);

  const goToStep = useCallback((step: TutorialStepDto) => {
    if (!step.isLocked) markStepComplete(step.id);
    setActiveStep(step.id);
  }, [markStepComplete]);

  // Bắt đầu (lại) bài hướng dẫn: luôn reset tích hoàn thành và về bước 1, kể cả khi
  // trước đó đã có thành tựu — chỉ nút "Hoàn thành" ở bước cuối sẽ không xuất hiện nữa.
  const handleStart = useCallback(() => {
    setCompletedSteps(new Set());
    if (steps.length > 0) {
      setActiveStep(steps[0].id);
      if (!steps[0].isLocked) markStepComplete(steps[0].id);
    }
    setStarted(true);
  }, [steps, markStepComplete]);

  // Điều hướng bước bằng phím mũi tên trái/phải
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowLeft") goPrevStep();
      else if (e.key === "ArrowRight") goNextStep();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrevStep, goNextStep]);

  const handleLike = useCallback(async () => {
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    if (!tutorial || likeLoading) return;
    const token = getToken()!;
    const prevLiked = isLiked;
    const prevCount = likeCount;
    // Optimistic
    setIsLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));
    setLikeLoading(true);
    try {
      const res = await communityPostsApi.toggleLike(token, tutorial.id, "Tutorial");
      // Server trả về trạng thái mới; nếu field không khớp thì giữ optimistic value
      if (typeof res.isLiked === "boolean") setIsLiked(res.isLiked);
    } catch (err) {
      console.error("[like] failed:", err);
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  }, [tutorial, isLiked, likeCount, likeLoading]);

  const handleSave = useCallback(async () => {
    if (!isLoggedIn()) { window.location.href = "/dang-nhap"; return; }
    if (!tutorial || saveLoading) return;
    const token = getToken()!;
    const prev = isSaved;
    setIsSaved(!prev);
    setSaveLoading(true);
    try {
      await wishlistsApi.toggle(token, tutorial.id);
    } catch (err) {
      console.error("[wishlist] failed:", err);
      setIsSaved(prev);
    } finally {
      setSaveLoading(false);
    }
  }, [tutorial, isSaved, saveLoading]);

  const handleCompleteAll = () => {
    if (!tutorial) return;
    // Đảm bảo mọi bước đều đã được đánh dấu hoàn thành trước khi gọi API hoàn thành tutorial
    // (BE yêu cầu đủ tất cả các bước) — phòng trường hợp người dùng nhảy thẳng tới bước cuối
    // bằng chấm chỉ mục / danh sách bước thay vì bấm "Bước sau" tuần tự.
    steps.forEach((s) => markStepComplete(s.id));
    if (loggedIn) {
      setShowAchievementModal(true);
    } else {
      window.location.href = "/dang-nhap";
    }
  };

  const handleAchievementSuccess = (achievement: AchievementDto) => {
    setExistingAchievement(achievement);
    setShowAchievementModal(false);
    setShowSuccessModal(true);
    setTutorial((prev) => (prev ? { ...prev, hasAchievement: true, hasRated: true } : prev));

    // Mở khoá bài tiếp theo trong lộ trình (nếu bài này thuộc 1 lộ trình)
    if (pathCtx && tutorial) {
      const done = getCompletedTutorialIds(pathCtx.pathId);
      done.add(tutorial.id);
      setCompletedTutorialIds(pathCtx.pathId, done);
    }
  };

  const diffColor = getDiffColor(tutorial?.difficulty);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "80vh" }}>
          <div style={{ background: "var(--color-surface-2)", padding: "3rem 0" }}>
            <div className="container">
              <div style={{ height: "2rem", background: "var(--color-border)", borderRadius: "var(--radius-sm)", width: "60%", marginBottom: "1rem", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: "1rem", background: "var(--color-border)", borderRadius: "var(--radius-sm)", width: "40%", animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
          <div className="container" style={{ padding: "2rem 1rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: "5rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", marginBottom: "0.875rem", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !tutorial) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không tìm thấy bài hướng dẫn</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>{error ?? "Bài hướng dẫn này không tồn tại hoặc đã bị xóa."}</p>
            <Link href="/huong-dan" className="btn btn-primary">← Quay lại thư viện</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      {showAchievementModal && (
        <AchievementModal
          tutorialId={tutorial.id}
          tutorialTitle={tutorial.title}
          hasRated={tutorial.hasRated ?? false}
          onClose={() => setShowAchievementModal(false)}
          onSuccess={handleAchievementSuccess}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          pathReturn={cameFromPath && pathCtx ? { pathId: pathCtx.pathId, pathTitle: pathCtx.pathTitle, isLastLesson: pathCtx.isLastLesson } : undefined}
        />
      )}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={tutorial.id}
        targetType="Tutorial"
        targetTitle={tutorial.title}
      />

      <main>
        {/* ── HERO — ảnh và nội dung tách riêng, không đè chữ lên ảnh ─────────── */}
        <div style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="container" style={{ paddingTop: "1.5rem" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem", fontSize: "0.8125rem", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Trang chủ</Link>
              <span style={{ color: "var(--color-border)" }}>›</span>
              <Link href="/huong-dan" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Hướng dẫn</Link>
              <span style={{ color: "var(--color-border)" }}>›</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{tutorial.title}</span>
            </div>

            {/* Đến từ trang quản trị báo cáo — cho phép quay lại nhanh */}
            {fromReport && (
              <Link
                href="/admin/reports"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "var(--color-surface)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
                  marginBottom: "0.875rem", textDecoration: "none",
                  color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                Quay lại trang báo cáo
              </Link>
            )}

            {/* Banner "thuộc lộ trình" — chỉ hiện khi đến từ trang lộ trình */}
            {cameFromPath && pathCtx && (
              <Link
                href={`/lo-trinh/${pathCtx.pathId}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "var(--color-surface)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
                  marginBottom: "0.875rem", textDecoration: "none",
                  color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 600,
                }}
              >
                🗺️ Thuộc lộ trình: {pathCtx.pathTitle} · Bài {pathCtx.lessonIndex + 1}/{pathCtx.totalLessons}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
            )}

            {/* Banner "quay lại bài test" — chỉ hiện khi đến từ panel mở khoá chế độ lộ trình */}
            {cameFromModeTest && (
              <Link
                href={modeTestModeId ? `/lo-trinh?moKhoa=${modeTestModeId}` : "/lo-trinh"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "var(--color-surface)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
                  marginBottom: "0.875rem", textDecoration: "none",
                  color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                Quay lại bài test mở khoá lộ trình
              </Link>
            )}
          </div>

          <div className="container tutorial-hero-grid">
            {/* Ảnh bìa */}
            <div
              style={{
                position: "relative", overflow: "hidden", borderRadius: "var(--radius-xl)",
                height: "clamp(260px, 34vw, 440px)", background: "var(--color-text-primary)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {isValidImageUrl(tutorial.coverImageUrl) ? (
                <>
                  <Image
                    src={tutorial.coverImageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" aria-hidden
                    style={{ objectFit: "cover", filter: "blur(28px) brightness(0.65)", transform: "scale(1.15)" }}
                  />
                  <Image
                    src={tutorial.coverImageUrl} alt={tutorial.title} fill sizes="(max-width: 768px) 100vw, 60vw"
                    style={{ objectFit: "contain" }} priority
                  />
                </>
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "3rem" }}>📄</span>
                </div>
              )}
            </div>

            {/* Thông tin */}
            <div style={{ alignSelf: "start", padding: 0 }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                <span style={{ background: "var(--color-surface)", color: "var(--color-text-secondary)", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)" }}>
                  🗂 {tutorial.categoryName}
                </span>
                <span style={{ background: diffColor.bg, color: diffColor.text, fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                  {getDiffLabel(tutorial.difficulty)}
                </span>
                <span style={{ background: tutorial.type?.toLowerCase() === "vip" ? "#FEF3C7" : "#D1FAE5", color: tutorial.type?.toLowerCase() === "vip" ? "#92400E" : "#065F46", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                  {tutorial.type?.toLowerCase() === "vip" ? "⭐ VIP" : "✓ Miễn phí"}
                </span>
                {existingAchievement && (
                  <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                    🏆 Đã hoàn thành
                  </span>
                )}
              </div>

              <h1 style={{ color: "var(--color-text-primary)", fontWeight: 900, fontSize: "clamp(1.75rem, 4vw, 3.25rem)", marginBottom: "0.75rem", lineHeight: 1.12 }}>
                {tutorial.title}
              </h1>

              <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.65, margin: 0 }}>
                {tutorial.description}
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <div className="container" style={{ padding: "2rem 1rem 4rem" }}>
          {started && tutorial.model3DUrl && (
            <Model3DViewer
              modelUrl={tutorial.model3DUrl}
              posterUrl={tutorial.model3DPosterUrl}
              title={tutorial.title}
            />
          )}

          {!started ? (
            /* ── TRANG THÔNG TIN ĐẦY ĐỦ — 1 bên là thông tin, 1 bên là các khối đã thiết kế sẵn ── */
            <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

              {/* ── TRÁI: 1 khung gộp — tác giả/hành động + thông tin bài hướng dẫn ── */}
              <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1.125rem 1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  {/* Tác giả + hành động thích/lưu/báo cáo */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.875rem", paddingBottom: "0.875rem", marginBottom: "0.875rem", borderBottom: "1px solid var(--color-border)" }}>
                    <AuthorLink authorId={tutorial.author.id} authorName={tutorial.author.displayName} style={{ gap: "0.5rem" }}>
                      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "white", flexShrink: 0 }}>
                        {tutorial.author.displayName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()}
                      </div>
                      <span style={{ color: "var(--color-text-primary)", fontSize: "0.9375rem", fontWeight: 700 }}>{tutorial.author.displayName}</span>
                    </AuthorLink>

                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                      {/* Like button */}
                      <button
                        onClick={handleLike}
                        disabled={likeLoading}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.375rem",
                          padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)",
                          border: "none",
                          background: isLiked ? "rgba(239,68,68,0.12)" : "var(--color-surface-2)",
                          color: isLiked ? "#dc2626" : "var(--color-text-secondary)",
                          cursor: likeLoading ? "wait" : "pointer",
                          fontSize: "0.875rem", fontWeight: 600,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {likeCount > 0 ? fmtLikes(likeCount) : (isLiked ? "Đã like" : "Like")}
                      </button>

                      {/* Report button */}
                      {loggedIn && (
                        <button
                          onClick={() => setShowReportModal(true)}
                          title="Báo cáo vi phạm"
                          style={{
                            display: "flex", alignItems: "center", gap: "0.375rem",
                            padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)",
                            border: "none",
                            background: "var(--color-surface-2)",
                            color: "var(--color-text-muted)",
                            cursor: "pointer",
                            fontSize: "0.875rem", fontWeight: 500,
                            transition: "all var(--transition-fast)",
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                            <line x1="4" y1="22" x2="4" y2="15" />
                          </svg>
                          Báo cáo
                        </button>
                      )}

                      {/* Save button */}
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.375rem",
                          padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)",
                          border: "none",
                          background: isSaved ? "rgba(16,185,129,0.12)" : "var(--color-surface-2)",
                          color: isSaved ? "#059669" : "var(--color-text-secondary)",
                          cursor: saveLoading ? "wait" : "pointer",
                          fontSize: "0.875rem", fontWeight: 600,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        {isSaved ? "Đã lưu" : "Lưu"}
                      </button>
                    </div>
                  </div>

                  {/* Thông tin đầy đủ */}
                  <h3 style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                    ℹ️ Thông tin bài hướng dẫn
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem 1.25rem", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Danh mục: </span>
                      <span style={{ fontWeight: 600 }}>🗂 {tutorial.categoryName}</span>
                    </span>
                    <span>
                      <span style={{ color: "var(--color-text-muted)" }}>Độ khó: </span>
                      <span style={{ fontWeight: 600, color: diffColor.text }}>{getDiffLabel(tutorial.difficulty)}</span>
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Số bước: </span>
                      <span style={{ fontWeight: 600 }}>📋 {totalSteps}</span>
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>Ngày đăng: </span>
                      <span style={{ fontWeight: 600 }}>📅 {new Date(tutorial.publishedAt).toLocaleDateString("vi-VN")}</span>
                    </span>
                    {typeof tutorial.completedCount === "number" && tutorial.completedCount > 0 && (
                      <span>
                        <span style={{ color: "var(--color-text-muted)" }}>Đã hoàn thành: </span>
                        <span style={{ fontWeight: 600, color: "#059669" }}>🏆 {fmtLikes(tutorial.completedCount)} người</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA bắt đầu */}
                <div style={{ textAlign: "center", paddingTop: "1.25rem", borderTop: "1px solid var(--color-border)" }}>
                  <h2 style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                    {totalSteps} bước thực hiện
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginBottom: "0.875rem", lineHeight: 1.4 }}>
                    {existingAchievement
                      ? "Bạn có thể làm lại bài hướng dẫn này bất cứ lúc nào để luyện tập thêm."
                      : "Sẵn sàng bắt tay vào gấp? Bấm bắt đầu để xem hướng dẫn từng bước."}
                  </p>
                  <button id="start-tutorial-btn" onClick={handleStart} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}>
                    ▶ Bắt đầu
                  </button>

                  {!loggedIn && (
                    <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#92400E" }}>
                      💡 <Link href="/dang-nhap" style={{ color: "#92400E", fontWeight: 600 }}>Đăng nhập</Link> để lưu tiến trình và thành tựu
                    </p>
                  )}
                </div>
              </div>

              {/* ── PHẢI: đánh giá độ khó lên đầu + các khối VIP / thành tựu / bắt đầu ── */}
              <div style={{ position: "sticky", top: "5.5rem" }}>
                {/* Đánh giá độ khó theo cộng đồng — đưa lên đầu cột phải, chỉ hiện khi đã có ít nhất 1 lượt đánh giá */}
                {!!tutorial.ratingSummary?.totalCount && (
                  <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.25rem 1.5rem", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
                      🤔 Người học đánh giá độ khó
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {PERCEIVED_DIFFICULTY_OPTIONS.map((opt) => {
                        const count = tutorial.ratingSummary?.counts?.[opt.value] ?? 0;
                        const total = tutorial.ratingSummary?.totalCount ?? 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.8125rem", width: "5.5rem", flexShrink: 0, color: "var(--color-text-secondary)" }}>
                              {opt.emoji} {opt.label}
                            </span>
                            <div style={{ flex: 1, height: "6px", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "var(--color-primary)", borderRadius: "var(--radius-full)" }} />
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", width: "1.75rem", textAlign: "right", flexShrink: 0 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tutorial.isVipLocked && (
                  <div style={{
                    background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #D4713B 100%)",
                    borderRadius: "var(--radius-xl)", padding: "1.25rem", marginBottom: "1rem",
                  }}>
                    <p style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                      ⭐ Bài hướng dẫn VIP
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem", lineHeight: 1.55, marginBottom: "1rem" }}>
                      Xem trước vài bước đầu miễn phí. Đăng ký VIP của {tutorial.author.displayName} để mở khoá toàn bộ {totalSteps} bước.
                    </p>
                    <Link href={`/huong-dan/${tutorial.slug}/vip`} className="btn btn-accent btn-sm" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                      🔓 Mua VIP
                    </Link>
                  </div>
                )}

                {/* Đã có thành tựu từ trước — vẫn có thể bấm "Bắt đầu" để làm lại */}
                {existingAchievement && (
                  <div style={{
                    marginBottom: "1rem",
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    border: "2px solid #F59E0B",
                    borderRadius: "var(--radius-xl)",
                    padding: "1.25rem",
                  }}>
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🏆</div>
                    <h3 style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#92400E", marginBottom: "0.25rem" }}>
                      Đã có thành tựu!
                    </h3>
                    <p style={{ color: "#B45309", fontSize: "0.8125rem", marginBottom: "0.875rem" }}>
                      Lưu vào {new Date(existingAchievement.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <Link href="/ho-so/thanh-tich" className="btn btn-sm" style={{ background: "#F59E0B", color: "white", border: "none", fontWeight: 600, width: "100%", justifyContent: "center" }}>
                      Xem thành tựu
                    </Link>
                  </div>
                )}

              </div>
            </div>

            {/* Bình luận về bài hướng dẫn */}
            <div style={{ marginTop: "2rem" }}>
              <CommentSection targetId={tutorial.id} targetType="Tutorial" title="Bình luận" />
            </div>
            </>
          ) : (
            /* ── TRÌNH XEM TỪNG BƯỚC — bắt đầu từ bước 1, tự đánh dấu hoàn thành khi chuyển bước sau ── */
            <>
              <button
                onClick={() => setStarted(false)}
                className="btn btn-outline btn-sm"
                style={{ marginBottom: "1.25rem" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                Quay lại thông tin
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>

                {/* ── LEFT: Steps list ─────────────────────────────────────────── */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                      Các bước thực hiện
                    </h2>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {completedCount}/{totalSteps} bước
                    </span>
                  </div>

                  {/* Paywall banner — chỉ hiện vài bước đầu, gợi ý mua VIP của tác giả */}
                  {tutorial.isVipLocked && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.875rem",
                      background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #D4713B 100%)",
                      borderRadius: "var(--radius-xl)", padding: "1.25rem 1.5rem", marginBottom: "1.25rem",
                    }}>
                      <div>
                        <p style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                          ⭐ Đây là bài hướng dẫn VIP của {tutorial.author.displayName}
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8125rem" }}>
                          Bạn đang xem trước một vài bước đầu. Đăng ký VIP để mở khoá toàn bộ {totalSteps} bước.
                        </p>
                      </div>
                      <Link href={`/huong-dan/${tutorial.slug}/vip`} className="btn btn-accent" style={{ textDecoration: "none", flexShrink: 0 }}>
                        🔓 Mua VIP
                      </Link>
                    </div>
                  )}

                  {/* Dot indicators — bấm để nhảy nhanh tới bước bất kỳ (không tự đánh dấu hoàn thành) */}
                  {totalSteps > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.875rem" }}>
                      {steps.map((step, i) => (
                        <button
                          key={step.id}
                          onClick={() => goToStep(step)}
                          aria-label={`Đi tới bước ${step.stepOrder}`}
                          style={{
                            width: "0.5rem", height: "0.5rem", borderRadius: "50%", border: "none", padding: 0,
                            cursor: "pointer",
                            background: i === activeStepIndex
                              ? "var(--color-primary)"
                              : completedSteps.has(step.id)
                                ? "#6ee7b7"
                                : "var(--color-border)",
                            transition: "all var(--transition-fast)",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {activeStepIndex >= 0 && steps[activeStepIndex] && (
                    <StepViewer
                      step={steps[activeStepIndex]}
                      index={activeStepIndex}
                      total={totalSteps}
                      isCompleted={completedSteps.has(steps[activeStepIndex].id)}
                      isLastStep={isLastStepActive}
                      alreadyAchieved={!!existingAchievement}
                      onComplete={handleCompleteAll}
                      onPrev={goPrevStep}
                      onNext={goNextStep}
                      hasPrev={hasPrevStep}
                      hasNext={hasNextStep}
                      tutorialSlug={tutorial.slug}
                    />
                  )}
                </div>

                {/* ── RIGHT: Sidebar ────────────────────────────────────────────── */}
                <div style={{ position: "sticky", top: "5.5rem" }}>
                  {/* Progress card */}
                  <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Tiến trình</h3>
                      <span style={{ fontWeight: 800, fontSize: "1.25rem", color: progressPct === 100 ? "#059669" : "var(--color-primary)" }}>
                        {progressPct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: "8px", background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", overflow: "hidden", marginBottom: "0.75rem" }}>
                      <div style={{
                        width: `${progressPct}%`, height: "100%",
                        background: progressPct === 100 ? "linear-gradient(to right, #059669, #10B981)" : "var(--gradient-primary)",
                        borderRadius: "var(--radius-full)",
                        transition: "width var(--transition-normal)",
                      }} />
                    </div>

                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                      {completedCount} / {totalSteps} bước đã hoàn thành
                    </p>

                    {!loggedIn && (
                      <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "#FEF3C7", border: "1px solid #FCD34D" }}>
                        <p style={{ fontSize: "0.8125rem", color: "#92400E", marginBottom: "0.5rem" }}>
                          💡 Đăng nhập để lưu tiến trình và thành tựu
                        </p>
                        <Link href="/dang-nhap" className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                          Đăng nhập
                        </Link>
                      </div>
                    )}

                    {isLastStepActive && (
                      <div style={{ marginTop: "1rem", textAlign: "center" }}>
                        {existingAchievement ? (
                          <span style={{ fontSize: "0.8125rem", color: "#059669", fontWeight: 600 }}>✓ Bạn đã có thành tựu bài này</span>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "#B45309", fontWeight: 600 }}>🎉 Đã đến bước cuối — bấm &ldquo;Hoàn thành&rdquo; để lưu thành tựu!</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick jump */}
                  <div style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>
                      📋 Danh sách bước
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      {steps.map((step) => (
                        <button
                          key={step.id}
                          id={`jump-step-${step.id}`}
                          onClick={() => goToStep(step)}
                          style={{
                            display: "flex", alignItems: "center", gap: "0.625rem",
                            padding: "0.5rem 0.625rem", borderRadius: "var(--radius-sm)",
                            background: activeStep === step.id ? "var(--color-surface-2)" : "transparent",
                            border: "none", cursor: "pointer", textAlign: "left",
                            transition: "background var(--transition-fast)",
                          }}
                        >
                          <div style={{
                            width: "1.375rem", height: "1.375rem", borderRadius: "50%", flexShrink: 0,
                            background: completedSteps.has(step.id) ? "#059669" : activeStep === step.id ? "var(--color-primary)" : "var(--color-surface-2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.625rem", fontWeight: 700, color: "white",
                          }}>
                            {completedSteps.has(step.id) ? "✓" : step.stepOrder}
                          </div>
                          <span style={{
                            fontSize: "0.8125rem", fontWeight: 500,
                            color: completedSteps.has(step.id) ? "#065F46" : "var(--color-text-secondary)",
                            lineHeight: 1.3,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {`Bước ${step.stepOrder}`}{step.isLocked ? " 🔒" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      <Footer />
    </>
  );
}
