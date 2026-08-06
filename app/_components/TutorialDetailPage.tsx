"use client";
// _components/TutorialDetailPage.tsx — Trang chi tiết hướng dẫn gấp giấy

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReportModal from "./ReportModal";
import AuthorLink from "./AuthorLink";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  tutorialsApi, achievementsApi, communityPostsApi, wishlistsApi, learningPathsApi,
  type TutorialDetailDto, type TutorialStepDto, type AchievementDto, type ApiError,
  type LearningPathContextDto,
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

// ─── Modal lưu thành tựu ─────────────────────────────────────────────────────
interface AchievementModalProps {
  tutorialId: string;
  tutorialTitle: string;
  onClose: () => void;
  onSuccess: (achievement: AchievementDto) => void;
}

function AchievementModal({ tutorialId, tutorialTitle, onClose, onSuccess }: AchievementModalProps) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const token = getToken()!;
      const result = await achievementsApi.create(token, {
        tutorialId,
        photoUrl: photoUrl.trim() || null,
        note: note.trim() || null,
        isPublic,
      });
      onSuccess(result);
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

          {/* Photo URL */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="achievement-photo-url" style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem", color: "var(--color-text-primary)" }}>
              📷 Ảnh tác phẩm của bạn (tùy chọn)
            </label>
            <input
              id="achievement-photo-url" type="url" value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/my-origami.jpg"
              style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "var(--color-text-primary)", background: "var(--color-bg)", outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
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
  onToggle: () => void;
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

function StepViewer({ step, index, total, isCompleted, onToggle, onPrev, onNext, hasPrev, hasNext, tutorialSlug }: StepViewerProps) {
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

      <button
        id={`step-done-${step.id}`}
        onClick={onToggle}
        className={isCompleted ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"}
      >
        {isCompleted ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            Bỏ đánh dấu
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            Đã hoàn thành
          </>
        )}
      </button>

      <button onClick={onNext} disabled={!hasNext} className="btn btn-outline btn-sm" style={{ opacity: hasNext ? 1 : 0.5 }}>
        Bước sau
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
      </button>
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
          <button
            id={`step-check-${step.id}`}
            onClick={onToggle}
            style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${isCompleted ? "#059669" : "var(--color-border)"}`,
              background: isCompleted ? "#059669" : "transparent",
              cursor: "pointer",
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
          </button>
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

  const [tutorial, setTutorial] = useState<TutorialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step progress (lưu vào localStorage để persist qua sessions)
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

  // Tải tiến độ bước từ localStorage (hiển thị tức thời, kể cả khách chưa đăng nhập),
  // rồi đồng bộ lên BE nếu đã đăng nhập — BE là nơi thật sự cộng Hạt Gấp khi hoàn thành
  // toàn bộ tutorial, nên các bước từng tick offline nhưng chưa gửi lên BE cần được "bù" lại.
  useEffect(() => {
    if (!tutorial) return;
    const key = `origami_steps_${tutorial.id}`;
    let localIds: string[] = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) localIds = JSON.parse(saved) as string[];
    } catch { /* ignore */ }

    if (localIds.length > 0) setCompletedSteps(new Set(localIds));

    if (!isLoggedIn()) return;
    const token = getToken();
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const progress = await tutorialsApi.getProgress(token, tutorial.id);
        const merged = new Set(progress.completedStepIds);
        const toBackfill = localIds.filter((id) => !merged.has(id));

        for (const stepId of toBackfill) {
          try {
            const updated = await tutorialsApi.completeStep(token, tutorial.id, stepId);
            updated.completedStepIds.forEach((id) => merged.add(id));
          } catch {
            // bước không thuộc tutorial này hoặc lỗi mạng — bỏ qua, không chặn các bước còn lại
          }
        }

        if (!cancelled && merged.size > 0) {
          setCompletedSteps((prev) => new Set([...prev, ...merged]));
        }
      } catch {
        /* BE không khả dụng — vẫn giữ tiến độ localStorage để hiển thị */
      }
    })();

    return () => { cancelled = true; };
  }, [tutorial?.id]);

  // Lưu step progress vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (!tutorial) return;
    const key = `origami_steps_${tutorial.id}`;
    try {
      localStorage.setItem(key, JSON.stringify([...completedSteps]));
    } catch { /* ignore */ }
  }, [completedSteps, tutorial?.id]);

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
  const allCompleted = totalSteps > 0 && completedCount === totalSteps;

  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
        // Ghi nhận lên BE để cộng Hạt Gấp khi đây là bước cuối cùng hoàn thành tutorial.
        if (tutorial && isLoggedIn()) {
          const token = getToken();
          if (token) {
            tutorialsApi.completeStep(token, tutorial.id, stepId).catch(() => {
              // đã hoàn thành từ trước hoặc lỗi mạng — không ảnh hưởng checkbox cục bộ
            });
          }
        }
      }
      return next;
    });
  }, [tutorial]);

  const activeStepIndex = steps.findIndex((s) => s.id === activeStep);
  const hasPrevStep = activeStepIndex > 0;
  const hasNextStep = activeStepIndex >= 0 && activeStepIndex < steps.length - 1;

  const goPrevStep = useCallback(() => {
    setActiveStep((cur) => {
      const idx = steps.findIndex((s) => s.id === cur);
      return idx > 0 ? steps[idx - 1].id : cur;
    });
  }, [steps]);

  const goNextStep = useCallback(() => {
    setActiveStep((cur) => {
      const idx = steps.findIndex((s) => s.id === cur);
      return idx >= 0 && idx < steps.length - 1 ? steps[idx + 1].id : cur;
    });
  }, [steps]);

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
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: isValidImageUrl(tutorial.coverImageUrl)
              ? `linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.78) 100%)`
              : "var(--gradient-primary)",
            position: "relative",
            overflow: "hidden",
            minHeight: "320px",
            display: "flex", alignItems: "flex-end",
          }}
        >
          {isValidImageUrl(tutorial.coverImageUrl) && (
            <Image src={tutorial.coverImageUrl} alt={tutorial.title} fill sizes="100vw" style={{ objectFit: "cover", zIndex: 0 }} priority />
          )}
          <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "3rem 0 2rem" }}>
            <div className="container">
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Trang chủ</Link>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
                <Link href="/huong-dan" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Hướng dẫn</Link>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{tutorial.title}</span>
              </div>

              {/* Banner "thuộc lộ trình" — chỉ hiện khi đến từ trang lộ trình */}
              {cameFromPath && pathCtx && (
                <Link
                  href={`/lo-trinh/${pathCtx.pathId}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
                    marginBottom: "0.875rem", textDecoration: "none",
                    color: "rgba(255,255,255,0.95)", fontSize: "0.8125rem", fontWeight: 600,
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
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: "var(--radius-full)", padding: "0.375rem 0.875rem",
                    marginBottom: "0.875rem", textDecoration: "none",
                    color: "rgba(255,255,255,0.95)", fontSize: "0.8125rem", fontWeight: 600,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  Quay lại bài test mở khoá lộ trình
                </Link>
              )}

              {/* Badges */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                <span style={{ background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,255,255,0.2)" }}>
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

              <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", marginBottom: "0.75rem", textShadow: "0 2px 8px rgba(0,0,0,0.3)", lineHeight: 1.2 }}>
                {tutorial.title}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.65, marginBottom: "1.25rem", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                {tutorial.description}
              </p>

              {/* Meta row */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                {/* Author */}
                <AuthorLink authorId={tutorial.author.id} style={{ gap: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--gradient-primary)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.6875rem", color: "white", flexShrink: 0 }}>
                    {tutorial.author.displayName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: 600 }}>{tutorial.author.displayName}</span>
                </AuthorLink>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>📋 {totalSteps} bước</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>
                  📅 {new Date(tutorial.publishedAt).toLocaleDateString("vi-VN")}
                </div>

                {/* Like button */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.375rem 0.875rem", borderRadius: "var(--radius-full)",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    background: isLiked ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.12)",
                    color: isLiked ? "#fca5a5" : "rgba(255,255,255,0.9)",
                    cursor: likeLoading ? "wait" : "pointer",
                    fontSize: "0.875rem", fontWeight: 600,
                    transition: "all var(--transition-fast)",
                    backdropFilter: "blur(4px)",
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
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      cursor: "pointer",
                      fontSize: "0.875rem", fontWeight: 500,
                      transition: "all var(--transition-fast)",
                      backdropFilter: "blur(4px)",
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
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    background: isSaved ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.12)",
                    color: isSaved ? "#6ee7b7" : "rgba(255,255,255,0.9)",
                    cursor: saveLoading ? "wait" : "pointer",
                    fontSize: "0.875rem", fontWeight: 600,
                    transition: "all var(--transition-fast)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                  {isSaved ? "Đã lưu" : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <div className="container" style={{ padding: "2rem 1rem 4rem" }}>
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

              {/* Dot indicators — bấm để nhảy nhanh tới bước bất kỳ */}
              {totalSteps > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.875rem" }}>
                  {steps.map((step, i) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
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
                  onToggle={() => toggleStep(steps[activeStepIndex].id)}
                  onPrev={goPrevStep}
                  onNext={goNextStep}
                  hasPrev={hasPrevStep}
                  hasNext={hasNextStep}
                  tutorialSlug={tutorial.slug}
                />
              )}

              {/* Completion CTA — chưa có achievement (ẩn nếu còn bước bị khoá VIP) */}
              {allCompleted && !existingAchievement && !tutorial.isVipLocked && (
                <div style={{
                  marginTop: "2rem",
                  background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
                  border: "2px solid #059669",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  textAlign: "center",
                  animation: "slideUp 0.3s ease",
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
                  <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "#065F46", marginBottom: "0.5rem" }}>
                    Bạn đã hoàn thành tất cả {totalSteps} bước!
                  </h3>
                  <p style={{ color: "#047857", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    Xuất sắc! Hãy lưu thành tựu để ghi nhớ kỹ năng của bạn.
                  </p>
                  <button id="save-achievement-btn" onClick={handleCompleteAll} className="btn btn-primary" style={{ background: "#059669", borderColor: "#059669" }}>
                    🏆 Lưu vào thành tựu
                  </button>
                </div>
              )}

              {/* Banner đã có achievement */}
              {existingAchievement && (
                <div style={{
                  marginTop: "2rem",
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  border: "2px solid #F59E0B",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.5rem 1.75rem",
                  display: "flex", alignItems: "center", gap: "1rem",
                  animation: "slideUp 0.3s ease",
                }}>
                  <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#92400E", marginBottom: "0.25rem" }}>
                      Bạn đã hoàn thành bài hướng dẫn này!
                    </h3>
                    <p style={{ color: "#B45309", fontSize: "0.8125rem" }}>
                      Đã lưu thành tựu vào {new Date(existingAchievement.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Link href="/ho-so/thanh-tich" className="btn btn-sm" style={{ background: "#F59E0B", color: "white", border: "none", fontWeight: 600, flexShrink: 0 }}>
                    Xem thành tựu
                  </Link>
                </div>
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

                {allCompleted && loggedIn && !existingAchievement && !tutorial.isVipLocked && (
                  <button
                    id="sidebar-save-achievement"
                    onClick={handleCompleteAll}
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
                  >
                    🏆 Lưu thành tựu
                  </button>
                )}

                {existingAchievement && (
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#059669", fontWeight: 600 }}>✓ Đã lưu thành tựu</span>
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
                      onClick={() => setActiveStep(step.id)}
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
