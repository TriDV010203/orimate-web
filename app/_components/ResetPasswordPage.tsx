// app/_components/ResetPasswordPage.tsx
// Màn hình Đặt lại mật khẩu — đọc token từ URL query params, nhập mật khẩu mới

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, type ApiError } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { label: "Rất yếu", color: "#e74c3c" },
      { label: "Yếu", color: "#e67e22" },
      { label: "Trung bình", color: "#f39c12" },
      { label: "Mạnh", color: "#27ae60" },
      { label: "Rất mạnh", color: "#1abc9c" },
    ];
    return { score, ...levels[score] };
  };

  const { score, label, color } = getStrength();
  if (!password) return null;

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "0.25rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "9999px",
              background: i <= score ? color : "var(--color-border)",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialToken = searchParams.get("token") || "";
  const [token] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [tokenMissing] = useState(!initialToken);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!newPassword) {
      setStatus("error");
      setMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setStatus("loading");

    try {
      const res = await authApi.resetPassword(token, newPassword, confirmPassword);
      setStatus("success");
      setMessage(res.message ?? "Mật khẩu đã được đặt lại thành công!");
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus("error");
      if (apiErr.status === 400) {
        setMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.");
      } else {
        setMessage(apiErr.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* ===== LEFT PANEL — decorative ===== */}
      <div
        className="auth-left-panel"
        style={{
          flex: "0 0 48%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.5rem",
        }}
      >
        <Image
          src="/origami-auth-bg.png"
          alt="Origami art background"
          fill
          sizes="48vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(150deg, rgba(27,67,50,0.88) 0%, rgba(45,106,79,0.75) 50%, rgba(212,113,59,0.60) 100%)",
          }}
        />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M2 20l10-16 10 16H2z" />
                <path d="M12 4L6 14h12L12 4z" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "white",
              }}
            >
              Ori<span style={{ color: "#F4A261" }}>Gami</span>
            </span>
          </Link>
        </div>

        {/* Quote */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "1.25rem" }}>🔒</div>
          <blockquote
            style={{
              color: "white",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontWeight: 600,
              lineHeight: 1.45,
              marginBottom: "1.25rem",
              maxWidth: "380px",
            }}
          >
            "Bảo mật tài khoản là{" "}
            <em style={{ color: "#F4A261" }}>nền tảng</em> của mọi hành trình"
          </blockquote>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
            Hãy tạo một mật khẩu <strong style={{ color: "white" }}>mạnh và duy nhất</strong> để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {/* Password tips */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Gợi ý mật khẩu mạnh
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              "Ít nhất 8 ký tự",
              "Chứa chữ hoa và chữ thường",
              "Có ít nhất 1 chữ số",
              "Có ký tự đặc biệt (!@#$...)",
            ].map((tip) => (
              <div key={tip} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F4A261" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--color-bg)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Back link */}
          <Link
            href="/quen-mat-khau"
            id="back-to-forgot"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              marginBottom: "2rem",
              transition: "color var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(45,106,79,0.12) 0%, rgba(45,106,79,0.06) 100%)",
                border: "1.5px solid rgba(45,106,79,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            </div>
            <h1
              className="text-heading"
              style={{
                fontSize: "1.625rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.375rem",
              }}
            >
              Đặt lại mật khẩu
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          {/* Token missing error */}
          {tokenMissing ? (
            <div>
              <div
                style={{
                  background: "rgba(192,57,43,0.08)",
                  border: "1.5px solid rgba(192,57,43,0.3)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "0.875rem",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: "2px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-error)", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>
                    Liên kết không hợp lệ
                  </p>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.55 }}>
                    Token đặt lại mật khẩu bị thiếu hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email.
                  </p>
                </div>
              </div>
              <Link href="/quen-mat-khau" id="link-request-again" className="btn btn-primary" style={{ display: "flex", justifyContent: "center", textDecoration: "none", padding: "0.875rem" }}>
                Yêu cầu đặt lại mật khẩu
              </Link>
            </div>
          ) : status === "success" ? (
            /* Success state */
            <div>
              <div
                style={{
                  background: "rgba(45,106,79,0.08)",
                  border: "1.5px solid rgba(45,106,79,0.25)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "0.875rem",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: "2px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>
                    Mật khẩu đã được cập nhật!
                  </p>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.55 }}>
                    {message}
                  </p>
                </div>
              </div>

              <button
                id="btn-go-login"
                type="button"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}
                onClick={() => router.push("/dang-nhap")}
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Error banner */}
              {status === "error" && message && (
                <div
                  style={{
                    background: "rgba(192,57,43,0.08)",
                    border: "1.5px solid rgba(192,57,43,0.3)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    color: "var(--color-error)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {message}
                </div>
              )}

              {/* New password */}
              <div className="input-group">
                <label htmlFor="reset-new-password" className="input-label">
                  Mật khẩu mới
                </label>
                <div className="input-with-icon" style={{ position: "relative" }}>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="reset-new-password"
                    type={showNew ? "text" : "password"}
                    className="input-field"
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                    style={{ paddingRight: "3rem" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    id="toggle-new-password"
                    onClick={() => setShowNew(!showNew)}
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      padding: 0,
                    }}
                  >
                    {showNew ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <PasswordStrengthBar password={newPassword} />
              </div>

              {/* Confirm password */}
              <div className="input-group">
                <label htmlFor="reset-confirm-password" className="input-label">
                  Xác nhận mật khẩu
                </label>
                <div className="input-with-icon" style={{ position: "relative" }}>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    className="input-field"
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                    style={{ paddingRight: "3rem" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    id="toggle-confirm-password"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                      padding: 0,
                    }}
                  >
                    {showConfirm ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Password match indicator */}
                {confirmPassword && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "0.375rem",
                      fontWeight: 500,
                      color: newPassword === confirmPassword ? "var(--color-success)" : "var(--color-error)",
                    }}
                  >
                    {newPassword === confirmPassword ? "✓ Mật khẩu khớp" : "✗ Mật khẩu chưa khớp"}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                id="btn-reset-submit"
                type="submit"
                className="btn btn-primary"
                disabled={status === "loading"}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.875rem",
                  opacity: status === "loading" ? 0.7 : 1,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                }}
              >
                {status === "loading" ? (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Đang cập nhật...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Nhớ mật khẩu rồi?{" "}
                <Link
                  href="/dang-nhap"
                  style={{
                    color: "var(--color-primary)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Đăng nhập
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-panel { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
