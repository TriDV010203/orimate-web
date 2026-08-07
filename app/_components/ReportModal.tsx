"use client";

import { useState } from "react";
import { reportsApi } from "@/lib/api/reports";
import type { TargetType } from "@/lib/api/client";
import { getToken } from "@/lib/auth";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: TargetType;
  targetTitle?: string;
}

const REPORT_REASONS = [
  "Nội dung không phù hợp / Vi phạm cộng đồng",
  "Spam hoặc quảng cáo",
  "Thông tin sai lệch / Gây hiểu lầm",
  "Bạo lực hoặc nội dung gây hại",
  "Vi phạm bản quyền",
  "Ngôn ngữ thù ghét / Phân biệt đối xử",
  "Khác",
];

export default function ReportModal({ isOpen, onClose, targetId, targetType, targetTitle }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalReason = selectedReason === "Khác" ? customReason : selectedReason;

  async function handleSubmit() {
    if (!finalReason.trim()) {
      setError("Vui lòng chọn hoặc nhập lý do báo cáo.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Vui lòng đăng nhập để báo cáo.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await reportsApi.submitReport(token, { targetType, targetId, reason: finalReason });
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSelectedReason("");
    setCustomReason("");
    setSuccess(false);
    setError(null);
    onClose();
  }

  const targetTypeLabel: Record<TargetType, string> = {
    Tutorial: "bài hướng dẫn",
    CommunityPost: "bài đăng",
    Comment: "bình luận",
    StuckThread: "chủ đề hỏi bị kẹt",
    DailyChallengeSubmission: "bài nộp thử thách ngày",
    WeeklyChallengeSubmission: "bài nộp thử thách tuần",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>

        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "480px", boxShadow: "var(--shadow-xl, 0 25px 50px rgba(0,0,0,0.25))", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>Báo cáo vi phạm</h2>
            </div>
            <button onClick={handleClose}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.375rem", borderRadius: "var(--radius-sm)", color: "var(--color-text-muted)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Báo cáo đã gửi thành công</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  Cảm ơn bạn đã giúp chúng tôi giữ gìn cộng đồng. Đội ngũ kiểm duyệt sẽ xem xét báo cáo này sớm nhất có thể.
                </p>
                <button onClick={handleClose} className="btn btn-primary" style={{ marginTop: "1.5rem", padding: "0.625rem 1.75rem" }}>
                  Đóng
                </button>
              </div>
            ) : (
              <>
                {targetTitle && (
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", background: "var(--color-surface-2)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--color-border)" }}>
                    Báo cáo {targetTypeLabel[targetType]}: <strong style={{ color: "var(--color-text-primary)" }}>{targetTitle}</strong>
                  </p>
                )}

                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>Lý do báo cáo:</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  {REPORT_REASONS.map((reason) => (
                    <label key={reason}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: `1.5px solid ${selectedReason === reason ? "var(--color-primary)" : "var(--color-border)"}`, cursor: "pointer", background: selectedReason === reason ? "rgba(45,106,79,0.04)" : "transparent", transition: "var(--transition-fast)" }}>
                      <input type="radio" name="reason" value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        style={{ accentColor: "var(--color-primary)" }} />
                      <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Khác" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Mô tả chi tiết vấn đề bạn muốn báo cáo..."
                    rows={3}
                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box", marginBottom: "1rem", outline: "none", fontFamily: "inherit" }}
                  />
                )}

                {error && (
                  <p style={{ fontSize: "0.875rem", color: "#DC2626", background: "#FEE2E2", padding: "0.625rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>{error}</p>
                )}

                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button onClick={handleClose}
                    style={{ padding: "0.625rem 1.25rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>
                    Hủy
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || !selectedReason}
                    className="btn"
                    style={{ padding: "0.625rem 1.25rem", background: "#DC2626", color: "white", fontSize: "0.9rem", opacity: (submitting || !selectedReason) ? 0.6 : 1, cursor: (submitting || !selectedReason) ? "not-allowed" : "pointer" }}>
                    {submitting ? "Đang gửi…" : "Gửi báo cáo"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
