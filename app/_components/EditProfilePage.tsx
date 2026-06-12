"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

// ── Mock data — sẽ thay bằng API /api/users/me ───────────────────────────────
const INITIAL_PROFILE = {
  displayName: "Quang Minh",
  username: "@quangminh_origami",
  bio: "Đam mê nghệ thuật gấp giấy Origami từ năm 2015. Chuyên về Origami 3D và Modular Origami. Mình tin rằng mỗi tờ giấy đều có thể trở thành một tác phẩm nghệ thuật! 🐉",
  location: "Hà Nội, Việt Nam",
  website: "quangminh-origami.com",
  avatarColor: "#2D6A4F",
  email: "quangminh@example.com",
};

export default function EditProfilePage() {
  const [form, setForm] = useState(INITIAL_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarColorOpen, setAvatarColorOpen] = useState(false);

  const AVATAR_COLORS = [
    "#2D6A4F", "#1B4332", "#40916C", "#D4713B",
    "#2C7DA0", "#7950F2", "#E03131", "#F59F00",
    "#1098AD", "#74C0FC", "#A9E34B", "#FF6B6B",
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: gọi PUT /api/users/me khi BE có endpoint
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* ── Header ── */}
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
              <Link href="/profile" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Hồ sơ</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>›</span>
              <span style={{ color: "white" }}>Chỉnh sửa</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "var(--radius-lg)",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                ✏️
              </div>
              <div>
                <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Chỉnh sửa hồ sơ
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Cập nhật thông tin cá nhân của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>

            {/* Success toast */}
            {saved && (
              <div
                style={{
                  background: "#DCFCE7",
                  border: "1px solid #86EFAC",
                  borderRadius: "var(--radius-md)",
                  padding: "0.875rem 1.25rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  color: "#15803D",
                  fontWeight: 600,
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Hồ sơ đã được cập nhật thành công!
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* ── Avatar section ── */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                  marginBottom: "1.25rem",
                }}
              >
                <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1.25rem", color: "var(--color-text-primary)" }}>
                  Ảnh đại diện
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                  {/* Avatar preview */}
                  <div
                    style={{
                      width: "5rem",
                      height: "5rem",
                      borderRadius: "50%",
                      background: form.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "2rem",
                      flexShrink: 0,
                      border: "3px solid var(--color-surface)",
                      boxShadow: `0 0 0 3px ${form.avatarColor}40`,
                      transition: "background var(--transition-normal)",
                    }}
                  >
                    {form.displayName.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                      Chọn màu avatar của bạn
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, avatarColor: color }))}
                          title={color}
                          style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "50%",
                            background: color,
                            border: form.avatarColor === color ? "3px solid var(--color-text-primary)" : "2px solid transparent",
                            cursor: "pointer",
                            transition: "transform var(--transition-fast), border var(--transition-fast)",
                            transform: form.avatarColor === color ? "scale(1.15)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.625rem" }}>
                      💡 Ảnh thật sẽ được hỗ trợ khi BE triển khai upload file (Cloudinary)
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Basic info ── */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                  marginBottom: "1.25rem",
                }}
              >
                <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "1.25rem", color: "var(--color-text-primary)" }}>
                  Thông tin cơ bản
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                  <div className="input-group">
                    <label className="input-label">
                      Tên hiển thị <span style={{ color: "#E03131" }}>*</span>
                    </label>
                    <input
                      id="edit-displayName"
                      name="displayName"
                      className="input-field"
                      type="text"
                      value={form.displayName}
                      onChange={handleChange}
                      placeholder="Tên của bạn"
                      required
                      maxLength={60}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      {form.displayName.length}/60 ký tự
                    </span>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input
                      id="edit-email"
                      className="input-field"
                      type="email"
                      value={form.email}
                      disabled
                      style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)", cursor: "not-allowed" }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      🔒 Email không thể thay đổi
                    </span>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Tiểu sử</label>
                    <textarea
                      id="edit-bio"
                      name="bio"
                      className="input-field"
                      rows={4}
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Chia sẻ về bản thân và hành trình Origami của bạn..."
                      maxLength={300}
                      style={{ resize: "vertical" }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                      {form.bio.length}/300 ký tự
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="input-group">
                      <label className="input-label">Địa điểm</label>
                      <input
                        id="edit-location"
                        name="location"
                        className="input-field"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="VD: Hà Nội, Việt Nam"
                        maxLength={80}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Website</label>
                      <input
                        id="edit-website"
                        name="website"
                        className="input-field"
                        type="text"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="VD: yoursite.com"
                        maxLength={120}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ── */}
              <div style={{ display: "flex", gap: "0.875rem" }}>
                <button
                  id="save-profile-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span style={{ display: "inline-block", width: "1rem", height: "1rem", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
                <Link
                  href="/profile"
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: "center", textAlign: "center" }}
                >
                  Hủy
                </Link>
              </div>

              {/* Change password section */}
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                  marginTop: "1.25rem",
                }}
              >
                <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", marginBottom: "0.5rem", color: "var(--color-text-primary)" }}>
                  Bảo mật
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Thay đổi mật khẩu tài khoản của bạn
                </p>
                <Link href="/forgot-password" className="btn btn-outline btn-sm">
                  🔑 Đổi mật khẩu
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
