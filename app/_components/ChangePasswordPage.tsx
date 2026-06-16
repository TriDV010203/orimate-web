"use client";

import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { authApi, type ApiError } from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

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

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setStatus("error");
      setMessage("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (!newPassword) {
      setStatus("error");
      setMessage("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/dang-nhap");
      return;
    }

    setStatus("loading");
    try {
      const res = await authApi.changePassword(currentPassword, newPassword, confirmPassword, token);
      setStatus("success");
      setMessage(res.message ?? "Mật khẩu đã được thay đổi thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const apiErr = err as ApiError;
      setStatus("error");
      if (apiErr.status === 400) {
        setMessage("Mật khẩu hiện tại không đúng hoặc mật khẩu mới không hợp lệ.");
      } else if (apiErr.status === 401) {
        setMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setMessage(apiErr.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)",
            padding: "2.5rem 0 2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            style={{ position: "absolute", right: "3%", top: 0, height: "100%", opacity: 0.06 }}
            viewBox="0 0 200 200"
            width="260"
          >
            <polygon points="100,10 190,190 10,190" fill="white" />
          </svg>

          <div className="container" style={{ position: "relative" }}>
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Trang chủ</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <Link href="/ho-so" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Hồ sơ</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>Đổi mật khẩu</span>
            </div>

            <h1
              style={{
                color: "white",
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 700,
                marginBottom: "0.375rem",
              }}
            >
              Đổi mật khẩu
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
              Cập nhật mật khẩu để bảo vệ tài khoản của bạn
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* Sidebar nav */}
            <aside>
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                {[
                  { href: "/ho-so", icon: "👤", label: "Trang cá nhân" },
                  { href: "/ho-so/chinh-sua", icon: "✏️", label: "Chỉnh sửa hồ sơ" },
                  { href: "/ho-so/thanh-tich", icon: "🏅", label: "Thành tựu" },
                  { href: "/ho-so/doi-mat-khau", icon: "🔑", label: "Đổi mật khẩu", active: true },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.875rem 1.125rem",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: item.active ? 600 : 500,
                      color: item.active ? "var(--color-primary)" : "var(--color-text-secondary)",
                      background: item.active ? "rgba(45,106,79,0.08)" : "transparent",
                      borderLeft: item.active ? "3px solid var(--color-primary)" : "3px solid transparent",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </aside>

            {/* Form card */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
              }}
            >
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "12px",
                      background: "rgba(45,106,79,0.1)",
                      border: "1.5px solid rgba(45,106,79,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      Thay đổi mật khẩu
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                      Mật khẩu mới phải có ít nhất 8 ký tự
                    </p>
                  </div>
                </div>
              </div>

              {/* Success state */}
              {status === "success" ? (
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4 12 14.01l-3-3" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
                        Đổi mật khẩu thành công!
                      </p>
                      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        {message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: "0.75rem 1.5rem" }}
                    onClick={() => setStatus("idle")}
                  >
                    Đổi mật khẩu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "480px" }}>
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

                  {/* Current password */}
                  <div className="input-group">
                    <label htmlFor="current-password" className="input-label">
                      Mật khẩu hiện tại
                    </label>
                    <div className="input-with-icon" style={{ position: "relative" }}>
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        id="current-password"
                        type={showCurrent ? "text" : "password"}
                        className="input-field"
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                        style={{ paddingRight: "3rem" }}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={status === "loading"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
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
                        <EyeIcon visible={showCurrent} />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "var(--color-border)", margin: "0.25rem 0" }} />

                  {/* New password */}
                  <div className="input-group">
                    <label htmlFor="new-password" className="input-label">
                      Mật khẩu mới
                    </label>
                    <div className="input-with-icon" style={{ position: "relative" }}>
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        id="new-password"
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
                        <EyeIcon visible={showNew} />
                      </button>
                    </div>
                    <PasswordStrengthBar password={newPassword} />
                  </div>

                  {/* Confirm password */}
                  <div className="input-group">
                    <label htmlFor="confirm-password" className="input-label">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="input-with-icon" style={{ position: "relative" }}>
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <input
                        id="confirm-password"
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
                        <EyeIcon visible={showConfirm} />
                      </button>
                    </div>
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

                  {/* Password tips */}
                  <div
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.875rem 1rem",
                    }}
                  >
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                      Gợi ý mật khẩu mạnh:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                      {[
                        "Ít nhất 8 ký tự",
                        "Chứa chữ hoa và chữ thường",
                        "Có ít nhất 1 chữ số",
                        "Có ký tự đặc biệt (!@#$...)",
                      ].map((tip) => (
                        <div key={tip} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === "loading"}
                      style={{
                        padding: "0.75rem 1.5rem",
                        opacity: status === "loading" ? 0.7 : 1,
                        cursor: status === "loading" ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
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
                        "Lưu mật khẩu mới"
                      )}
                    </button>
                    <Link href="/ho-so" className="btn btn-ghost" style={{ padding: "0.75rem 1.25rem" }}>
                      Huỷ
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
