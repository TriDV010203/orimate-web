"use client";
// _components/LearningPathModeUnlockPanel.tsx — Panel mở khoá 1 chế độ lộ trình bị khoá:
// hiện điều kiện tiên quyết (hoàn thành lộ trình chế độ trước) + form nộp ảnh bài test.
// Nộp ảnh ở đây độc lập hoàn toàn với hệ Achievement — không tạo/sửa/xoá thành tựu nào.

import { useState } from "react";
import Link from "next/link";
import ImageUploadField from "./ImageUploadField";
import { learningPathModesApi, type LearningPathModeDto } from "@/lib/api/learning-path-modes";
import type { ApiError } from "@/lib/api";
import { Lock, Clock, XCircle, ImageIcon } from "lucide-react";

interface Props {
  mode: LearningPathModeDto;
  token: string | null;
  onSubmitted: () => void;
}

export default function LearningPathModeUnlockPanel({ mode, token, onSubmitted }: Props) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const test = mode.unlockTest;

  async function handleSubmit() {
    if (!token || !photoUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      await learningPathModesApi.submitUnlockTest(token, mode.id, { photoUrl, note: note || undefined });
      setPhotoUrl("");
      setNote("");
      onSubmitted();
    } catch (err) {
      setError((err as ApiError).message ?? "Nộp bài test thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="card"
      style={{ padding: "1.75rem", marginBottom: "2.5rem", border: "1.5px dashed var(--color-border)", background: "var(--color-surface-2)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
        <Lock size={20} style={{ color: "var(--color-text-muted)" }} />
        <h3 style={{ fontWeight: 800, fontSize: "1.0625rem" }}>Chế độ &ldquo;{mode.name}&rdquo; đang bị khoá</h3>
      </div>

      {!test ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
          Chế độ này chưa được cấu hình bài test mở khoá. Vui lòng quay lại sau.
        </p>
      ) : test.mySubmissionStatus === "Pending" ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", color: "var(--color-warning, #b45309)" }}>
          <Clock size={18} />
          <p style={{ fontSize: "0.9375rem" }}>Bài nộp của bạn đang chờ Admin/Manager duyệt.</p>
        </div>
      ) : mode.isUnlocked ? null : (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1rem" }}>
            Để mở khoá, hãy gấp theo hướng dẫn <strong>&ldquo;{test.tutorialTitle}&rdquo;</strong> và nộp ảnh thành phẩm. Bài nộp này
            tách biệt với thành tựu — dù bạn đã hoàn thành hướng dẫn này trước đó hay chưa, bạn vẫn cần nộp ảnh riêng cho bài test.
          </p>

          {test.mySubmissionStatus === "Rejected" && test.myReviewNote && (
            <div
              style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "rgba(220,38,38,0.08)", color: "var(--color-error)", marginBottom: "1rem", fontSize: "0.875rem" }}
            >
              <XCircle size={16} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
              <span>Bài nộp trước bị từ chối: {test.myReviewNote} — bạn có thể nộp lại.</span>
            </div>
          )}

          {test.instructions && (
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Ghi chú từ ban quản trị: {test.instructions}
            </p>
          )}

          <Link
            href={`/huong-dan/${test.tutorialSlug}?tuBaiTest=1&modeId=${mode.id}`}
            className="btn btn-outline btn-sm"
            style={{ marginBottom: "1.25rem", display: "inline-flex" }}
          >
            Xem hướng dẫn &ldquo;{test.tutorialTitle}&rdquo;
          </Link>

          <div style={{ maxWidth: 360, marginBottom: "1rem" }}>
            {token ? (
              <ImageUploadField
                value={photoUrl}
                onChange={setPhotoUrl}
                token={token}
                folder="mode-tests"
                variant="cover"
                label="Ảnh thành phẩm"
                disabled={submitting}
              />
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <ImageIcon size={16} /> Đăng nhập để nộp ảnh bài test.
              </p>
            )}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú (không bắt buộc)"
            rows={2}
            className="input-field"
            style={{ width: "100%", maxWidth: 480, resize: "vertical", marginBottom: "1rem" }}
            disabled={submitting || !token}
          />

          {error && <p style={{ color: "var(--color-error)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{error}</p>}

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!token || !photoUrl || submitting}
          >
            {submitting ? "Đang nộp..." : "Nộp bài test"}
          </button>
        </>
      )}
    </div>
  );
}
