// app/_components/ForgotPasswordPage.tsx
// Màn hình Quên mật khẩu — nhập email để nhận link đặt lại mật khẩu

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { authApi, type ApiError } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Vui lòng nhập địa chỉ email.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const res = await authApi.forgotPassword(email.trim());
      setStatus("success");
      setMessage(res.message ?? "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư rác).");
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus("error");
      setMessage(apiErr.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
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

        {/* Illustration text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "1.25rem" }}>🔑</div>
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
            "Mỗi khởi đầu mới là một{" "}
            <em style={{ color: "#F4A261" }}>cơ hội</em> để gấp lại từ đầu"
          </blockquote>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
            Đừng lo — chúng tôi sẽ giúp bạn{" "}
            <strong style={{ color: "white" }}>lấy lại quyền truy cập</strong> ngay.
          </p>
        </div>

        {/* Steps guide */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[
            { step: "1", label: "Nhập email đã đăng ký" },
            { step: "2", label: "Kiểm tra hộp thư đến" },
            { step: "3", label: "Nhấn link và đặt mật khẩu mới" },
          ].map((s) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "50%",
                  background: "rgba(244,162,97,0.25)",
                  border: "1.5px solid rgba(244,162,97,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "#F4A261",
                  flexShrink: 0,
                }}
              >
                {s.step}
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>{s.label}</span>
            </div>
          ))}
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
            href="/dang-nhap"
            id="back-to-login"
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
            Quay lại đăng nhập
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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
              Quên mật khẩu?
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
              Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu cho bạn.
            </p>
          </div>

          {/* Success state */}
          {status === "success" ? (
            <div>
              <div
                style={{
                  background: "rgba(45,106,79,0.08)",
                  border: "1.5px solid rgba(45,106,79,0.25)",
                  borderRadius: "12px",
                  padding: "1.25rem 1.25rem",
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
                    Email đã được gửi!
                  </p>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.55 }}>
                    {message}
                  </p>
                </div>
              </div>

              <button
                id="btn-resend-email"
                type="button"
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }}
                onClick={() => {
                  setStatus("idle");
                  setMessage(null);
                }}
              >
                Gửi lại email
              </button>

              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Kiểm tra cả thư mục <strong>Spam / Junk Mail</strong> nếu không thấy email.
              </p>
            </div>
          ) : (
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

              {/* Email input */}
              <div className="input-group">
                <label htmlFor="forgot-email" className="input-label">
                  Địa chỉ email
                </label>
                <div className="input-with-icon">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    id="forgot-email"
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="btn-forgot-submit"
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
                    Đang gửi...
                  </>
                ) : (
                  "Gửi liên kết đặt lại mật khẩu"
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
