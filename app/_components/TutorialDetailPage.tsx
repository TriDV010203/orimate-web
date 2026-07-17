"use client";
// _components/TutorialDetailPage.tsx — Trang chi tiết hướng dẫn gấp giấy

import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useEffect, useState, useCallback } from "react";
import { tutorialsApi, achievementsApi, type TutorialDetailDto, type TutorialStepDto, type ApiError } from "@/lib/api";
import { getToken, getUser, isLoggedIn } from "@/lib/auth";

// ─── Difficulty helpers ───────────────────────────────────────────────────────
function getDiffLabel(d?: string | null) {
  if (!d) return "Không xác định";
  const l = d.toLowerCase();
  if (l === "easy") return "Dễ";
  if (l === "medium") return "Trung bình";
  if (l === "hard") return "Khó";
  return d;
}
function getDiffColor(d?: string | null) {
  const l = (d ?? "").toLowerCase();
  if (l === "easy" || l === "dễ") return { bg: "#D1FAE5", text: "#065F46" };
  if (l === "medium" || l === "trung bình") return { bg: "#FEF3C7", text: "#92400E" };
  if (l === "hard" || l === "khó") return { bg: "#FEE2E2", text: "#991B1B" };
  return { bg: "#F3F4F6", text: "#374151" };
}

// ─── Modal lưu thành tựu ───────────────────────────────────────────────────────
interface AchievementModalProps {
  tutorialId: string;
  tutorialTitle: string;
  onClose: () => void;
  onSuccess: (achievementId: string) => void;
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
      onSuccess(result.id);
    } catch (err) {
      const e = err as ApiError;
      setError(e?.message ?? "Không thể lưu thành tựu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      id="achievement-modal-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        width: "100%", maxWidth: "480px",
        overflow: "hidden",
        animation: "slideUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          background: "var(--gradient-primary)",
          padding: "1.75rem 1.5rem 1.25rem",
          position: "relative",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", textAlign: "center" }}>🏆</div>
          <h2 style={{ color: "white", fontWeight: 800, fontSize: "1.25rem", textAlign: "center", marginBottom: "0.25rem" }}>
            Chúc mừng!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", textAlign: "center" }}>
            Bạn đã hoàn thành &ldquo;{tutorialTitle}&rdquo;
          </p>
          <button
            id="achievement-modal-close"
            onClick={onClose}
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: "50%", width: "2rem", height: "2rem",
              cursor: "pointer", color: "white", fontSize: "1.125rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{
              background: "#FEE2E2", border: "1px solid #FECACA",
              borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem",
              marginBottom: "1rem", color: "#991B1B", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          {/* Photo URL */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="achievement-photo-url" style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem", color: "var(--color-text-primary)" }}>
              📷 Ảnh tác phẩm của bạn (tùy chọn)
            </label>
            <input
              id="achievement-photo-url"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/my-origami.jpg"
              style={{
                width: "100%", padding: "0.625rem 0.875rem",
                border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem", color: "var(--color-text-primary)",
                background: "var(--color-bg)",
                outline: "none", transition: "border-color var(--transition-fast)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Bạn có thể thêm ảnh sau trong trang Thành tựu
            </p>
          </div>

          {/* Note */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="achievement-note" style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem", color: "var(--color-text-primary)" }}>
              📝 Ghi chú (tùy chọn)
            </label>
            <textarea
              id="achievement-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về bài hướng dẫn này..."
              rows={3}
              style={{
                width: "100%", padding: "0.625rem 0.875rem",
                border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem", color: "var(--color-text-primary)",
                background: "var(--color-bg)", resize: "vertical",
                outline: "none", transition: "border-color var(--transition-fast)",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          </div>

          {/* Is Public toggle */}
          <label
            htmlFor="achievement-public"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", marginBottom: "1.5rem" }}
          >
            <input
              id="achievement-public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: "1.125rem", height: "1.125rem", accentColor: "var(--color-primary)" }}
            />
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Hiển thị thành tựu này công khai trên trang cá nhân
            </span>
          </label>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              id="achievement-skip"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1 }}
              disabled={saving}
            >
              Để sau
            </button>
            <button
              id="achievement-save"
              onClick={handleSave}
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={saving}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                <>🏆 Lưu thành tựu</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal thành công ─────────────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1001,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        width: "100%", maxWidth: "400px",
        padding: "2.5rem 2rem",
        textAlign: "center",
        animation: "slideUp 0.25s ease",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ fontWeight: 800, fontSize: "1.375rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
          Đã lưu thành tựu!
        </h2>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
          Thành tựu của bạn đã được lưu. Hãy vào trang Thành tựu để xem và thêm ảnh tác phẩm nhé!
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button id="success-modal-close" onClick={onClose} className="btn btn-outline">
            Đóng
          </button>
          <Link href="/ho-so" className="btn btn-primary">
            Xem thành tựu
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Step Item ────────────────────────────────────────────────────────────────
interface StepItemProps {
  step: TutorialStepDto;
  isCompleted: boolean;
  isActive: boolean;
  onToggle: () => void;
  onClick: () => void;
}

function StepItem({ step, isCompleted, isActive, onToggle, onClick }: StepItemProps) {
  return (
    <div
      style={{
        border: `2px solid ${isActive ? "var(--color-primary)" : isCompleted ? "#D1FAE5" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        background: isActive ? "var(--color-surface)" : isCompleted ? "#F0FDF4" : "var(--color-surface)",
        overflow: "hidden",
        transition: "all var(--transition-normal)",
        cursor: "pointer",
      }}
    >
      {/* Step header */}
      <div
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        {/* Step number / check button */}
        <button
          id={`step-check-${step.id}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            width: "2.25rem", height: "2.25rem", borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${isCompleted ? "#059669" : "var(--color-border)"}`,
            background: isCompleted ? "#059669" : "transparent",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all var(--transition-fast)",
            color: "white",
            fontWeight: 700, fontSize: "0.875rem",
          }}
        >
          {isCompleted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <span style={{ color: "var(--color-text-muted)", fontWeight: 700 }}>{step.stepOrder}</span>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: isCompleted ? "#065F46" : "var(--color-text-primary)", lineHeight: 1.3 }}>
            Bước {step.stepOrder}: {step.title}
          </div>
        </div>

        {/* Expand arrow */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-muted)" strokeWidth="2"
          style={{ transform: isActive ? "rotate(180deg)" : "none", transition: "transform var(--transition-fast)", flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Step content (expanded) */}
      {isActive && (
        <div style={{ padding: "0 1.25rem 1.25rem" }}>
          <div style={{ width: "100%", height: "1px", background: "var(--color-border)", marginBottom: "1rem" }} />

          {/* Media */}
          {step.mediaUrl && (
            <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "1rem", aspectRatio: "16/9", background: "var(--color-surface-2)" }}>
              <Image
                src={step.mediaUrl}
                alt={`Bước ${step.stepOrder}: ${step.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ objectFit: "contain" }}
              />
            </div>
          )}

          {/* Content — render as rich text */}
          <div
            style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}
          >
            {step.content}
          </div>

          {/* Toggle done button */}
          <button
            id={`step-done-${step.id}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={isCompleted ? "btn btn-outline btn-sm" : "btn btn-primary btn-sm"}
            style={{ marginTop: "1rem" }}
          >
            {isCompleted ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                Bỏ đánh dấu
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                Đã hoàn thành bước này
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TutorialDetailPageProps {
  slug: string;
}

export default function TutorialDetailPage({ slug }: TutorialDetailPageProps) {
  const [tutorial, setTutorial] = useState<TutorialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    tutorialsApi.getBySlug(slug)
      .then((data) => {
        setTutorial(data);
        // Mở bước đầu tiên mặc định
        if (data.steps && data.steps.length > 0) {
          const sorted = [...data.steps].sort((a, b) => a.stepOrder - b.stepOrder);
          setActiveStep(sorted[0].id);
        }
      })
      .catch((err: ApiError) => {
        setError(err?.message ?? "Không tìm thấy bài hướng dẫn.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const steps = tutorial
    ? [...tutorial.steps].sort((a, b) => a.stepOrder - b.stepOrder)
    : [];

  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => completedSteps.has(s.id)).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const allCompleted = totalSteps > 0 && completedCount === totalSteps;

  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  }, []);

  const handleCompleteAll = () => {
    if (!tutorial) return;
    if (loggedIn) {
      setShowAchievementModal(true);
    } else {
      window.location.href = "/dang-nhap";
    }
  };

  const diffColor = getDiffColor(tutorial?.difficulty);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "80vh" }}>
          {/* Hero skeleton */}
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

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error || !tutorial) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Không tìm thấy bài hướng dẫn</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>{error ?? "Bài hướng dẫn này không tồn tại hoặc đã bị xóa."}</p>
            <Link href="/huong-dan" className="btn btn-primary">
              ← Quay lại thư viện
            </Link>
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
          onSuccess={() => {
            setShowAchievementModal(false);
            setShowSuccessModal(true);
          }}
        />
      )}
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: tutorial.coverImageUrl
              ? `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.8) 100%)`
              : "var(--gradient-primary)",
            position: "relative",
            overflow: "hidden",
            minHeight: "320px",
            display: "flex", alignItems: "flex-end",
          }}
        >
          {tutorial.coverImageUrl && (
            <Image
              src={tutorial.coverImageUrl}
              alt={tutorial.title}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", zIndex: 0 }}
              priority
            />
          )}
          <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "3rem 0 2rem" }}>
            <div className="container">
              {/* Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>
                <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Trang chủ</Link>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
                <Link href="/huong-dan" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Hướng dẫn</Link>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{tutorial.title}</span>
              </div>

              {/* Category & badges */}
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
              </div>

              <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", marginBottom: "0.75rem", textShadow: "0 2px 8px rgba(0,0,0,0.3)", lineHeight: 1.2 }}>
                {tutorial.title}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", maxWidth: "680px", lineHeight: 1.65, marginBottom: "1.25rem" }}>
                {tutorial.description}
              </p>

              {/* Meta info */}
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--gradient-primary)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.6875rem", color: "white", flexShrink: 0 }}>
                    {tutorial.author.displayName.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase()}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", fontWeight: 600 }}>{tutorial.author.displayName}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  📋 {totalSteps} bước
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  📅 {new Date(tutorial.publishedAt).toLocaleDateString("vi-VN")}
                </div>
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

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {steps.map((step) => (
                  <StepItem
                    key={step.id}
                    step={step}
                    isCompleted={completedSteps.has(step.id)}
                    isActive={activeStep === step.id}
                    onToggle={() => toggleStep(step.id)}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  />
                ))}
              </div>

              {/* Completion CTA */}
              {allCompleted && (
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
                  <button
                    id="save-achievement-btn"
                    onClick={handleCompleteAll}
                    className="btn btn-primary"
                    style={{ background: "#059669", borderColor: "#059669" }}
                  >
                    🏆 Lưu vào thành tựu
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar ────────────────────────────────────────────── */}
            <div style={{ position: "sticky", top: "5.5rem" }}>
              {/* Progress card */}
              <div style={{
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1.5rem",
                marginBottom: "1rem",
                boxShadow: "var(--shadow-sm)",
              }}>
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
                  <div style={{
                    marginTop: "1rem", padding: "0.75rem", borderRadius: "var(--radius-md)",
                    background: "#FEF3C7", border: "1px solid #FCD34D",
                  }}>
                    <p style={{ fontSize: "0.8125rem", color: "#92400E", marginBottom: "0.5rem" }}>
                      💡 Đăng nhập để lưu tiến trình và thành tựu
                    </p>
                    <Link href="/dang-nhap" className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                      Đăng nhập
                    </Link>
                  </div>
                )}

                {allCompleted && loggedIn && (
                  <button
                    id="sidebar-save-achievement"
                    onClick={handleCompleteAll}
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
                  >
                    🏆 Lưu thành tựu
                  </button>
                )}
              </div>

              {/* Quick jump */}
              <div style={{
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "1.25rem",
                boxShadow: "var(--shadow-sm)",
              }}>
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
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
      `}</style>

      <Footer />
    </>
  );
}
