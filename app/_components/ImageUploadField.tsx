"use client";

// ImageUploadField — chọn ảnh từ thiết bị, upload lên server (POST /api/uploads/image), server forward Cloudinary rồi trả url.
// Thay thế các ô nhập URL ảnh thủ công trước đây (tutorial cover/step, achievement, learning path, community post).

import { useRef, useState } from "react";
import { uploadsApi, type UploadFolder } from "@/lib/api/uploads";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  token: string;
  folder: UploadFolder;
  label?: string;
  /** cover = ô preview lớn tỉ lệ 4:3 (ảnh bìa tutorial/learning path); compact = nút nhỏ + thumbnail (step/achievement/post) */
  variant?: "cover" | "compact";
  disabled?: boolean;
}

export default function ImageUploadField({
  value,
  onChange,
  token,
  folder,
  label,
  variant = "cover",
  disabled,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Ảnh không được vượt quá 10MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const result = await uploadsApi.uploadImage(token, file, folder);
      onChange(result.url);
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Tải ảnh lên thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  const isCover = variant === "cover";
  const isBusy = disabled || uploading;

  return (
    <div>
      {label && (
        <label className="input-label" style={{ marginBottom: "0.5rem", display: "block" }}>
          {label}
        </label>
      )}

      {isCover && (
        <div
          style={{
            aspectRatio: "4/3",
            borderRadius: "var(--radius-lg)",
            border: "2px dashed var(--color-border)",
            background: "var(--color-surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.75rem",
            overflow: "hidden",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label ?? "Ảnh"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {uploading ? "Đang tải ảnh lên..." : "Chưa có ảnh"}
            </span>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {!isCover && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={label ?? "Ảnh"}
            style={{ width: "3rem", height: "3rem", borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--color-border)", flexShrink: 0 }}
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          className="btn btn-outline"
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
        >
          {uploading ? "Đang tải lên..." : value ? "Đổi ảnh" : "📁 Chọn ảnh từ thiết bị"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={isBusy}
            style={{ border: "none", background: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Xoá
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        disabled={isBusy}
        style={{ display: "none" }}
      />

      {error && <p style={{ color: "var(--color-error)", fontSize: "0.8125rem", marginTop: "0.375rem" }}>{error}</p>}
    </div>
  );
}
