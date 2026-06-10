// Component UI trang Đăng nhập — được import vào app/(auth)/login/page.tsx
// Cần "use client" vì có useState (toggle password, loading, error)

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authApi, type ApiError } from "../../lib/api";
import { saveSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(email.trim(), password);
      saveSession(data, remember);
      router.push("/");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401 || apiErr.status === 400) {
        setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
      } else if (apiErr.status === 403) {
        setError("Tài khoản của bạn đã bị tạm khóa.");
      } else {
        setError(apiErr.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* ===== LEFT PANEL — decorative ===== */}
      <div
        className="auth-left-panel"
        style={{ flex: "0 0 48%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2.5rem" }}
      >
        <Image src="/origami-auth-bg.png" alt="Origami art background" fill sizes="48vw" style={{ objectFit: "cover" }} priority />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(27,67,50,0.88) 0%, rgba(45,106,79,0.75) 50%, rgba(212,113,59,0.60) 100%)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M2 20l10-16 10 16H2z" /><path d="M12 4L6 14h12L12 4z" />
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 700, fontSize: "1.5rem", color: "white" }}>
              Ori<span style={{ color: "#F4A261" }}>Gami</span>
            </span>
          </Link>
        </div>

        {/* Quote */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "1.25rem" }}>🦢</div>
          <blockquote style={{ color: "white", fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 600, lineHeight: 1.45, marginBottom: "1.25rem", maxWidth: "380px" }}>
            "Mỗi nếp gấp là một bước tiến đến{" "}
            <em style={{ color: "#F4A261" }}>sự hoàn hảo</em>"
          </blockquote>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
            Tham gia cùng hơn <strong style={{ color: "white" }}>50.000 người</strong> yêu thích Origami
          </p>
        </div>

        {/* Stats */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "2rem" }}>
          {[{ n: "10K+", l: "Bài hướng dẫn" }, { n: "500+", l: "Nhà sáng tạo" }, { n: "4.9★", l: "Đánh giá" }].map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", marginTop: "0.25rem" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--color-bg)", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
              Chào mừng trở lại! 👋
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              Đăng nhập để tiếp tục hành trình Origami của bạn
            </p>
          </div>

          {/* Social login */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button id="btn-login-google" className="btn btn-outline" style={{ width: "100%", justifyContent: "center", borderColor: "var(--color-border-dark)", color: "var(--color-text-primary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Tiếp tục với Google
            </button>
            <button id="btn-login-facebook" className="btn" style={{ width: "100%", justifyContent: "center", background: "#1877F2", color: "white" }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Tiếp tục với Facebook
            </button>
          </div>

          <div className="divider" style={{ marginBottom: "1.5rem" }}>hoặc</div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: "rgba(192, 57, 43, 0.08)",
              border: "1.5px solid rgba(192, 57, 43, 0.3)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              color: "var(--color-error)",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="input-group">
              <label htmlFor="login-email" className="input-label">Email</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password" className="input-label">Mật khẩu</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: "3rem" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button type="button" id="toggle-password-login" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href="/forgot-password" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="remember-me"
                className="checkbox-custom"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember-me" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "0.875rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : "Đăng nhập"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Chưa có tài khoản?{" "}
            <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-panel { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
