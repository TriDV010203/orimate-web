// Component UI trang Đăng ký — được import vào app/(auth)/register/page.tsx
// Cần "use client" vì có useState (password visibility, strength meter, loading, error)
// BE chỉ nhận { email, password } — các field Họ/Tên/Username chỉ là UI decorative

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { authApi, type ApiError } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  // Tính độ mạnh mật khẩu
  const getStrength = (pw: string): { level: number; label: string; color: string } => {
    if (pw.length === 0) return { level: 0, label: "", color: "transparent" };
    if (pw.length < 6) return { level: 25, label: "Quá ngắn", color: "#DC2626" };
    if (pw.length < 8) return { level: 50, label: "Yếu", color: "#D97706" };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 10) return { level: 100, label: "Rất mạnh", color: "#16A34A" };
    if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) return { level: 75, label: "Trung bình", color: "#D4713B" };
    return { level: 50, label: "Yếu", color: "#D97706" };
  };

  const strength = getStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!acceptTerms) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng để tiếp tục.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register(email.trim(), password, email.trim());
      setRegistered(true);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 400 || apiErr.status === 409) {
        // 400: validation error, 409: email đã tồn tại
        if (apiErr.message?.toLowerCase().includes("already")) {
          setError("Email này đã được đăng ký. Hãy thử đăng nhập hoặc dùng email khác.");
        } else {
          setError(apiErr.message ?? "Thông tin không hợp lệ. Vui lòng kiểm tra lại.");
        }
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(212,113,59,0.85) 0%, rgba(45,106,79,0.75) 60%, rgba(27,67,50,0.88) 100%)" }} />

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

        {/* Feature list */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.25rem", fontWeight: 600 }}>
            Tham gia OriGami để...
          </p>
          {[
            { icon: "📚", text: "Truy cập 10.000+ bài hướng dẫn Origami" },
            { icon: "👨‍🎨", text: "Đăng bài và trở thành Nhà sáng tạo nội dung" },
            { icon: "❤️", text: "Like, comment, follow người bạn yêu thích" },
            { icon: "👨‍👩‍👧‍👦", text: "Tạo dự án Origami cùng gia đình" },
            { icon: "🏆", text: "Lưu thành tựu cá nhân" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
              <div style={{ width: "2.25rem", height: "2.25rem", background: "rgba(255,255,255,0.12)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
            🔒 Miễn phí mãi mãi. Không cần thẻ tín dụng.<br />
            Bảo mật thông tin theo tiêu chuẩn quốc tế.
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL — form ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--color-bg)", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          {/* ── Pending email verification ── */}
          {registered ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "4.5rem", height: "4.5rem", borderRadius: "50%", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Đăng ký thành công!
              </h1>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "2rem" }}>
                Chúng tôi đã gửi email xác minh đến{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>.{" "}
                Vui lòng kiểm tra hộp thư (bao gồm thư mục <strong>Spam</strong>) và nhấn link để kích hoạt tài khoản.
              </p>
              <div style={{ background: "rgba(45,106,79,0.06)", border: "1.5px solid rgba(45,106,79,0.18)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  💡 Link xác minh có hiệu lực trong <strong>24 giờ</strong>. Nếu hết hạn, bạn có thể{" "}
                  <a href="/xac-minh-email" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>yêu cầu gửi lại</a>.
                </p>
              </div>
              <a href="/dang-nhap" style={{ display: "block", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
                Quay lại{" "}
                <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng nhập</span>
              </a>
            </div>
          ) : (
          <>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
              Tạo tài khoản mới ✨
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              Miễn phí mãi mãi. Không cần thẻ tín dụng.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="input-group">
              <label htmlFor="reg-email" className="input-label">Email</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="input-label">Mật khẩu</label>
              <div className="input-with-icon" style={{ position: "relative" }}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="reg-password"
                  type={showPass ? "text" : "password"}
                  className="input-field"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "3rem" }}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button type="button" id="toggle-password-reg" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <>
                  <div className="progress-bar" style={{ marginTop: "0.375rem" }}>
                    <div className="progress-bar-fill" style={{ width: `${strength.level}%`, background: strength.color, transition: "all 0.3s" }} />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                </>
              )}
            </div>

            {/* Terms */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="reg-terms"
                className="checkbox-custom"
                style={{ marginTop: "2px" }}
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="reg-terms" style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", cursor: "pointer", lineHeight: 1.55 }}>
                Tôi đồng ý với{" "}
                <Link href="/dieu-khoan" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Điều khoản sử dụng</Link>
                {" "}và{" "}
                <Link href="/chinh-sach-bao-mat" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Chính sách bảo mật</Link>
              </label>
            </div>

            <button
              id="btn-register-submit"
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
                  Đang tạo tài khoản...
                </>
              ) : "Tạo tài khoản miễn phí"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
              Đăng nhập
            </Link>
          </p>
          </>
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
