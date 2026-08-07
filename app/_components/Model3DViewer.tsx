"use client";

import type { ModelViewerElement } from "@google/model-viewer";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface Model3DViewerProps {
  modelUrl: string;
  posterUrl?: string | null;
  title: string;
}

export default function Model3DViewer({ modelUrl, posterUrl, title }: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement>(null);
  const [libraryReady, setLibraryReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    void import("@google/model-viewer")
      .then(() => {
        if (active) setLibraryReady(true);
      })
      .catch(() => {
        if (active) {
          setError("Không thể khởi tạo trình xem 3D trên trình duyệt này.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!libraryReady) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setLoading(false);
      setError(null);
    };
    const handleError = () => {
      setLoading(false);
      setError("Không thể tải mô hình 3D. Vui lòng thử lại sau.");
    };

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [libraryReady, retryKey]);

  function handleResetCamera() {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.cameraOrbit = "0deg 75deg 105%";
    viewer.fieldOfView = "30deg";
    viewer.resetTurntableRotation();
    viewer.jumpCameraToGoal();
  }

  async function handleFullscreen() {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await container.requestFullscreen();
  }

  function handleRetry() {
    setLoading(true);
    setError(null);
    setRetryKey((current) => current + 1);
  }

  return (
    <section
      aria-labelledby="model-3d-title"
      style={{
        marginBottom: "2rem",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <h2 id="model-3d-title" style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
            Quan sát thành phẩm 3D
          </h2>
          <p style={{ margin: "0.25rem 0 0", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            Kéo để xoay · Cuộn hoặc chụm để phóng to, thu nhỏ
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <ViewerButton onClick={handleResetCamera} ariaLabel="Đặt lại góc nhìn mô hình 3D">
            ↻ Đặt lại góc nhìn
          </ViewerButton>
          <ViewerButton onClick={() => void handleFullscreen()} ariaLabel="Xem mô hình 3D toàn màn hình">
            ⛶ Toàn màn hình
          </ViewerButton>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(320px, 55vw, 580px)",
          background: "radial-gradient(circle at 50% 42%, #ffffff 0%, #f5f7fb 62%, #e8edf5 100%)",
        }}
      >
        <model-viewer
          key={`${modelUrl}-${retryKey}`}
          ref={viewerRef}
          src={modelUrl}
          poster={posterUrl || undefined}
          alt={`Mô hình 3D thành phẩm ${title}`}
          loading="lazy"
          reveal="auto"
          camera-controls
          auto-rotate
          auto-rotate-delay={2500}
          rotation-per-second="20deg"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto 55%"
          max-camera-orbit="auto auto 220%"
          field-of-view="30deg"
          min-field-of-view="18deg"
          max-field-of-view="55deg"
          shadow-intensity="1"
          shadow-softness="0.8"
          environment-image="neutral"
          interaction-prompt="auto"
          touch-action="pan-y"
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {(loading || !libraryReady) && !error && (
          <ViewerStatus>
            <span
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                border: "3px solid #d8e1ec",
                borderTopColor: "var(--color-primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>Đang tải mô hình 3D...</span>
          </ViewerStatus>
        )}

        {error && (
          <ViewerStatus>
            <strong style={{ color: "#991b1b" }}>{error}</strong>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                padding: "0.65rem 1rem",
                border: 0,
                borderRadius: "var(--radius-md)",
                background: "var(--color-primary)",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Thử tải lại
            </button>
          </ViewerStatus>
        )}
      </div>
    </section>
  );
}

function ViewerButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        padding: "0.55rem 0.8rem",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        color: "var(--color-text-primary)",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ViewerStatus({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.85rem",
        padding: "1.5rem",
        background: "rgba(248, 250, 252, 0.94)",
        color: "var(--color-text-secondary)",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}
