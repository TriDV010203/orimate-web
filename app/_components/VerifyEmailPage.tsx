// app/_components/VerifyEmailPage.tsx
// Trang xác minh email — nhận token từ query param, gọi API verify, hiện kết quả

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { authApi, type ApiError } from "@/lib/api";

type PageState = "verifying" | "success" | "error" | "no-token" | "resending" | "resent";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>(token ? "verifying" : "no-token");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState("");
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    authApi.verifyEmail(token).then(() => {
      setState("success");
    }).catch((err: ApiError) => {
      setErrorMessage(err.message ?? "Link xác minh không hợp lệ hoặc đã hết hạn.");
      setState("error");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError("Vui lòng nhập địa chỉ email.");
      return;
    }
    setResendError(null);
    setState("resending");
    try {
      await authApi.resendVerification(resendEmail.trim());
      setState("resent");
    } catch (err) {
      const apiErr = err as ApiError;
      setResendError(apiErr.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
      setState("error");
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(45,106,79,0.88) 0%, rgba(27,67,50,0.80) 50%, rgba(212,113,59,0.65) 100%)" }} />

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

        {/* Illustration */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "1.25rem" }}>✉️</div>
          <blockquote style={{ color: "white", fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 600, lineHeight: 1.45, marginBottom: "1.25rem", maxWidth: "380px" }}>
            "Một bước nhỏ xác minh,{" "}
            <em style={{ color: "#F4A261" }}>một thế giới</em> Origami mở ra"
          </blockquote>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>
            Xác minh email giúp bảo vệ tài khoản{" "}
            <strong style={{ color: "white" }}>và cộng đồng</strong> của chúng ta.
          </p>
        </div>

        {/* Steps */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[
            { step: "1", label: "Đăng ký tài khoản" },
            { step: "2", label: "Nhấn link trong email" },
            { step: "3", label: "Bắt đầu hành trình Origami!" },
          ].map((s) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "rgba(244,162,97,0.25)", border: "1.5px solid rgba(244,162,97,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "#F4A261", flexShrink: 0 }}>
                {s.step}
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--color-bg)" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* ── Verifying ── */}
          {state === "verifying" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(45,106,79,0.08)", border: "2px solid rgba(45,106,79,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đang xác minh...</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Vui lòng chờ trong giây lát.</p>
            </div>
          )}

          {/* ── Success ── */}
          {state === "success" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Email đã được xác minh!
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Tài khoản của bạn đã kích hoạt thành công. Hãy đăng nhập để bắt đầu hành trình Origami.
              </p>
              <Link href="/dang-nhap" className="btn btn-primary" style={{ display: "inline-flex", justifyContent: "center", padding: "0.875rem 2rem", textDecoration: "none", width: "100%" }}>
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* ── No token ── */}
          {state === "no-token" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(192,57,43,0.08)", border: "2px solid rgba(192,57,43,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Link không hợp lệ</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Link xác minh này không đúng. Vui lòng nhập email của bạn để nhận lại link mới.
              </p>
              <ResendForm
                email={resendEmail}
                setEmail={setResendEmail}
                error={resendError}
                loading={false}
                onSubmit={handleResend}
              />
            </div>
          )}

          {/* ── Error (expired/invalid token) ── */}
          {state === "error" && (
            <div>
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(192,57,43,0.08)", border: "2px solid rgba(192,57,43,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h1 className="text-heading" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Link đã hết hạn</h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                  {errorMessage ?? "Link xác minh không hợp lệ hoặc đã hết hạn (24 giờ)."}
                </p>
              </div>
              <ResendForm
                email={resendEmail}
                setEmail={setResendEmail}
                error={resendError}
                loading={false}
                onSubmit={handleResend}
              />
            </div>
          )}

          {/* ── Resending ── */}
          {state === "resending" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(45,106,79,0.08)", border: "2px solid rgba(45,106,79,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đang gửi...</h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>Vui lòng chờ trong giây lát.</p>
            </div>
          )}

          {/* ── Resent successfully ── */}
          {state === "resent" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Email đã được gửi lại!
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Chúng tôi đã gửi link xác minh mới đến hộp thư của bạn (nếu email đó đã đăng ký). Vui lòng kiểm tra cả thư mục <strong>Spam</strong>.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }}
                onClick={() => { setState("error"); setResendError(null); }}
              >
                Gửi lại lần nữa
              </button>
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/dang-nhap" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
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

function ResendForm({ email, setEmail, error, loading, onSubmit }: {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem", color: "var(--color-error)", fontSize: "0.875rem", fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      <div className="input-group">
        <label htmlFor="resend-email" className="input-label">Địa chỉ email đã đăng ký</label>
        <div className="input-with-icon">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            id="resend-email"
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
      <button
        id="btn-resend-verify"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: "100%", justifyContent: "center", padding: "0.875rem", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Đang gửi...
          </>
        ) : "Gửi lại email xác minh"}
      </button>
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
        <Link href="/dang-nhap" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
