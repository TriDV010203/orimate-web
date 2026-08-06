"use client";

import { useRef, useState } from "react";
import { Box, CheckCircle2, Loader2, Trash2, Upload } from "lucide-react";
import { uploadsApi } from "@/lib/api/uploads";
import ImageUploadField from "./ImageUploadField";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".glb,model/gltf-binary,application/octet-stream";

interface Model3DUploadFieldProps {
  value: string;
  posterUrl: string;
  onChange: (url: string) => void;
  onPosterChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  token: string;
  disabled?: boolean;
}

export default function Model3DUploadField({
  value,
  posterUrl,
  onChange,
  onPosterChange,
  onUploadingChange,
  token,
  disabled,
}: Model3DUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setUploadState(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".glb")) {
      setError("Chỉ chấp nhận mô hình định dạng GLB.");
      return;
    }

    if (file.size === 0) {
      setError("Tệp GLB đang trống.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Mô hình 3D không được vượt quá 25MB.");
      return;
    }

    setError(null);
    setUploadState(true);
    try {
      // Some browsers leave the GLB MIME type empty. Normalize it so the API
      // receives the content type it validates while still checking the GLB header server-side.
      const uploadFile = file.type === "model/gltf-binary"
        ? file
        : new File([file], file.name, {
            type: "model/gltf-binary",
            lastModified: file.lastModified,
          });

      const result = await uploadsApi.uploadModel3D(token, uploadFile);
      onChange(result.url);
    } catch (uploadError) {
      const apiError = uploadError as { message?: string };
      setError(apiError.message ?? "Không thể tải mô hình 3D lên. Vui lòng thử lại.");
    } finally {
      setUploadState(false);
    }
  }

  function removeModel() {
    onChange("");
    onPosterChange("");
    setError(null);
  }

  const isBusy = Boolean(disabled || uploading || !token);

  return (
    <div>
      <div
        style={{
          minHeight: "9rem",
          border: `2px dashed ${value ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-lg)",
          background: value ? "rgba(45,106,79,0.05)" : "var(--color-surface-2)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "0.625rem",
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={30} color="var(--color-primary)" />
            <strong style={{ color: "var(--color-text-primary)" }}>Đang tải mô hình lên...</strong>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
              Vui lòng không đóng trang trong lúc tải.
            </span>
          </>
        ) : value ? (
          <>
            <CheckCircle2 size={30} color="#059669" />
            <strong style={{ color: "var(--color-text-primary)" }}>Đã tải mô hình GLB</strong>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--color-primary)",
                fontSize: "0.75rem",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </a>
          </>
        ) : (
          <>
            <Box size={32} color="var(--color-text-muted)" />
            <strong style={{ color: "var(--color-text-primary)" }}>Mô hình sản phẩm hoàn thiện</strong>
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
              Tải một tệp GLB tối đa 25MB để người học xoay và phóng to sản phẩm.
            </span>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy}
          style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
        >
          <Upload size={15} /> {value ? "Đổi mô hình" : "Chọn tệp GLB"}
        </button>

        {value && !uploading && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={removeModel}
            disabled={isBusy}
            style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem", color: "var(--color-error)" }}
          >
            <Trash2 size={15} /> Xóa mô hình
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        disabled={isBusy}
        style={{ display: "none" }}
      />

      {error && (
        <p role="alert" style={{ color: "var(--color-error)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      {value && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border)" }}>
          <ImageUploadField
            value={posterUrl}
            onChange={onPosterChange}
            token={token}
            folder="tutorials"
            label="Ảnh đại diện khi mô hình đang tải (không bắt buộc)"
            variant="compact"
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
}
