"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ApiError } from "@/lib/api";
import { isValidImageUrl } from "@/lib/utils";
import { ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

const STATUS_META: Record<string, { label: string; tone: string }> = {
  Draft: { label: "Bản nháp", tone: "badge-neutral" },
  PendingManagerReview: { label: "Chờ duyệt", tone: "badge-warning" },
  RevisionRequired: { label: "Cần chỉnh sửa", tone: "badge-danger" },
  Published: { label: "Đã xuất bản", tone: "badge-success" },
  Removed: { label: "Đã gỡ", tone: "badge-neutral" },
  EditPendingReview: { label: "Chờ áp dụng bản sửa", tone: "badge-warning" },
  Merged: { label: "Đã hợp nhất", tone: "badge-neutral" },
};

function getDiffLabel(d?: string | null) {
  const l = (d ?? "").toLowerCase();
  if (l === "beginner") return "Dễ";
  if (l === "intermediate") return "Trung bình";
  if (l === "advanced") return "Khó";
  return d || "Không xác định";
}

interface RejectModalProps {
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function RejectModal({ busy, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState("");
  const tooShort = reason.trim().length < 10;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>Yêu cầu chỉnh sửa</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Cho tác giả biết cần sửa gì (tối thiểu 10 ký tự). Nội dung này sẽ được gửi tới tác giả.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          autoFocus
          placeholder="Ví dụ: Ảnh bước 3 bị mờ, vui lòng chụp lại rõ nét hơn..."
          style={{
            width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--color-border)", fontSize: "0.9rem",
            fontFamily: "inherit", resize: "vertical", outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={busy}>Hủy</button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || tooShort}
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />} Gửi yêu cầu sửa
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTutorialReviewPage({ tutorialId }: { tutorialId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showReject, setShowReject] = useState(false);

  const { data: tutorial, isLoading, error } = useQuery({
    queryKey: ["admin-tutorial-detail", tutorialId],
    queryFn: () => adminApi.getTutorialForAdmin(tutorialId),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminApi.getCategories(),
  });
  const categoryName = categories?.find((c) => c.id === tutorial?.categoryId)?.name;

  const isEdit = tutorial?.status === "EditPendingReview";

  const backToQueue = () => {
    qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    router.push("/admin/tutorials");
  };

  const publishMut = useMutation({
    mutationFn: () => (isEdit ? adminApi.approveEdit(tutorialId) : adminApi.publishTutorial(tutorialId)),
    onSuccess: () => {
      toast.success(isEdit ? "Đã duyệt bản chỉnh sửa!" : "Đã xuất bản thành công!");
      backToQueue();
    },
    onError: (err: unknown) => toast.error((err as ApiError).message || "Lỗi xuất bản"),
  });

  const rejectMut = useMutation({
    mutationFn: (reason: string) =>
      isEdit ? adminApi.rejectEdit(tutorialId, reason) : adminApi.rejectTutorial(tutorialId, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu sửa.");
      setShowReject(false);
      backToQueue();
    },
    onError: (err: unknown) => toast.error((err as ApiError).message || "Lỗi thao tác"),
  });

  const isBusy = publishMut.isPending || rejectMut.isPending;

  if (isLoading) {
    return <div className="card admin-queue-item"><Loader2 className="animate-spin" size={24} /></div>;
  }
  if (error || !tutorial) {
    return (
      <div className="card admin-empty-state">
        <p style={{ fontWeight: 600, color: "var(--color-error)" }}>
          {(error as unknown as ApiError)?.message ?? "Không thể tải bài hướng dẫn."}
        </p>
      </div>
    );
  }

  const steps = [...tutorial.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const statusMeta = STATUS_META[tutorial.status] ?? { label: tutorial.status, tone: "badge-neutral" };

  return (
    <div>
      {showReject && (
        <RejectModal
          busy={rejectMut.isPending}
          onClose={() => setShowReject(false)}
          onConfirm={(reason) => rejectMut.mutate(reason)}
        />
      )}

      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <Link href="/admin/tutorials" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
            <ArrowLeft size={14} /> Quay lại hàng chờ duyệt
          </Link>
          <h1 className="admin-page-title">Xét duyệt bài hướng dẫn</h1>
          <p className="admin-page-desc">
            Tác giả: <strong>{tutorial.authorName}</strong>
            {tutorial.isOfficial && <span className="badge badge-neutral" style={{ marginLeft: "0.5rem" }}>Chính thức</span>}
            {" · "}
            <span className={`badge ${isEdit ? "badge-neutral" : "badge-warning"}`}>{isEdit ? "Chỉnh sửa" : "Bài mới"}</span>
            {" · "}
            <span className={`badge ${statusMeta.tone}`}>{statusMeta.label}</span>
            {" · "}
            Gửi lúc {format(new Date(tutorial.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-outline" onClick={() => setShowReject(true)} disabled={isBusy}>
            <X size={16} /> Yêu cầu sửa lại
          </button>
          <button className="btn btn-primary" onClick={() => publishMut.mutate()} disabled={isBusy}>
            {publishMut.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            {isEdit ? "Duyệt bản chỉnh sửa" : "Duyệt & Xuất bản"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "1.5rem", alignItems: "start" }} className="admin-review-grid">
        {/* ── LEFT: Tutorial info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative", width: "100%", height: "200px", background: "var(--color-surface-2)" }}>
              {isValidImageUrl(tutorial.coverImageUrl) ? (
                <Image src={tutorial.coverImageUrl} alt={tutorial.title} fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-muted)" }}>
                  Không có ảnh bìa
                </div>
              )}
            </div>
            <div style={{ padding: "1.25rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.75rem", color: "var(--color-text-primary)" }}>
                {tutorial.title}
              </h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                {tutorial.description}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Thông tin</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Danh mục</span>
              <strong>{categoryName ?? `#${tutorial.categoryId}`}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Độ khó</span>
              <strong>{getDiffLabel(tutorial.difficulty)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Loại bài</span>
              <strong>{tutorial.type?.toLowerCase() === "vip" ? "⭐ VIP" : "✓ Miễn phí"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Số bước</span>
              <strong>{steps.length}</strong>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Steps (read-only preview) ── */}
        <div className="card" style={{ padding: "1.25rem", minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem" }}>
            Các bước thực hiện ({steps.length} bước)
          </h3>

          {steps.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "1rem 0" }}>
              Bài hướng dẫn này chưa có bước nào.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {steps.map((step) => (
                <div key={step.id} style={{ display: "flex", gap: "1rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "1rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem", flexShrink: 0 }}>
                    {step.stepOrder}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {isValidImageUrl(step.imageUrl) && (
                      <div style={{ position: "relative", width: "100%", maxWidth: "420px", height: "220px", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--color-surface-2)" }}>
                        <Image src={step.imageUrl} alt={`Bước ${step.stepOrder}`} fill style={{ objectFit: "contain" }} />
                      </div>
                    )}
                    <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-review-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
