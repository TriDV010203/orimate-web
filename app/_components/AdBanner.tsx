// AdBanner.tsx — Placeholder component cho vị trí quảng cáo
// Khi tích hợp quảng cáo thật (Google AdSense, v.v.) chỉ cần thay nội dung bên trong
// mà không cần sửa cấu trúc layout trang chủ.

"use client";

type AdSize =
  | "leaderboard"   // 728×90  — banner ngang lớn
  | "rectangle"     // 300×250 — banner chữ nhật
  | "billboard"     // 970×250 — billboard rộng
  | "half-page"     // 300×600 — nửa trang
  | "inline-wide";  // full-width inline

interface AdBannerProps {
  size: AdSize;
  slotId: string;          // ID slot AdSense / ad-network sau này
  label?: string;          // Nhãn hiển thị (mặc định "Quảng cáo")
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_PRESETS: Record<AdSize, { width: string; height: string; label: string }> = {
  leaderboard:  { width: "728px", height: "90px",  label: "728 × 90" },
  rectangle:    { width: "300px", height: "250px", label: "300 × 250" },
  billboard:    { width: "100%",  height: "250px", label: "970 × 250" },
  "half-page":  { width: "300px", height: "600px", label: "300 × 600" },
  "inline-wide":{ width: "100%",  height: "120px", label: "Inline wide" },
};

export default function AdBanner({
  size,
  slotId,
  label = "Quảng cáo",
  className = "",
  style = {},
}: AdBannerProps) {
  const preset = SIZE_PRESETS[size];

  return (
    <div
      id={slotId}
      className={`ad-banner ad-banner--${size} ${className}`}
      aria-label={label}
      style={{
        width: preset.width,
        maxWidth: "100%",
        height: preset.height,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        border: "2px dashed var(--color-border)",
        background: "linear-gradient(135deg, var(--color-surface-2) 0%, var(--color-surface) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        ...style,
      }}
    >
      {/* Watermark pattern */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`dots-${slotId}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${slotId})`} />
      </svg>

      {/* Ad icon */}
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "var(--radius-md)",
          background: "var(--gradient-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(27,67,50,0.2)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginTop: "0.125rem",
            opacity: 0.7,
          }}
        >
          {preset.label} · Slot: {slotId}
        </div>
      </div>
    </div>
  );
}
