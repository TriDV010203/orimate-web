"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PROJECT = {
  id: "project-1",
  name: "Dự án 1000 con hạc gia đình",
  tutorialTitle: "Hạc giấy nghệ thuật",
  tutorialEmoji: "🦢",
  tutorialColor: "#E8F5E8",
  members: [
    { name: "Bố", color: "#2D6A4F", progress: 100 },
    { name: "Mẹ", color: "#D4713B", progress: 100 },
    { name: "Bé An", color: "#9B59B6", progress: 87 },
    { name: "Bé Nam", color: "#2C7DA0", progress: 73 },
  ],
  completedAt: "21/06/2026",
};

export default function ProjectCompletionPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");

  const EMOJI_PLACEHOLDERS = ["🦢", "🌸", "✨", "🎉"];

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setStep("success");
  }

  if (step === "success") {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1.25rem", animation: "bounce 1s ease" }}>🎉</div>
            <h1 className="text-heading" style={{ fontSize: "2rem", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
              Dự án hoàn thành!
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Chúc mừng gia đình đã cùng nhau hoàn thành bài hướng dẫn <strong>{PROJECT.tutorialTitle}</strong>! Đây là một kỷ niệm tuyệt vời.
            </p>

            <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "2rem", color: "white" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏆</div>
              <h2 style={{ fontWeight: 800, fontSize: "1.375rem", marginBottom: "0.375rem" }}>Thành tựu đã đạt!</h2>
              <p style={{ color: "rgba(255,255,255,0.85)" }}>Dự án gia đình đầu tiên hoàn thành</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {shareToFeed && (
                <Link href="/cong-dong" className="btn btn-accent" style={{ textDecoration: "none", justifyContent: "center", padding: "0.875rem" }}>
                  🌍 Xem bài đăng cộng đồng
                </Link>
              )}
              <Link href="/gia-dinh" className="btn btn-primary" style={{ textDecoration: "none", justifyContent: "center", padding: "0.875rem" }}>
                Về trang dự án gia đình
              </Link>
              <Link href="/huong-dan" className="btn btn-outline" style={{ textDecoration: "none", justifyContent: "center", padding: "0.875rem" }}>
                Khám phá bài hướng dẫn mới
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <style>{`@keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }`}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "680px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎊</div>
            <h1 className="text-heading" style={{ fontSize: "2rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
              Dự án hoàn thành!
            </h1>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6 }}>
              Gia đình đã cùng nhau hoàn thành <strong>{PROJECT.tutorialTitle}</strong> 🦢<br />
              Hãy lưu lại kỷ niệm đẹp này!
            </p>
          </div>

          {/* Member Summary */}
          <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "1.5rem", color: "white" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem", color: "rgba(255,255,255,0.9)" }}>Kết quả của từng thành viên</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              {PROJECT.members.map((m) => (
                <div key={m.name} style={{ background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-lg)", padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white", border: "2px solid rgba(255,255,255,0.4)" }}>
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{m.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}>{m.progress}% hoàn thành</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Photos */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>📸 Upload ảnh tác phẩm</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>Chụp ảnh hạc giấy của từng thành viên để lưu kỷ niệm</p>

            {/* Photo Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
              {EMOJI_PLACEHOLDERS.map((emoji, i) => (
                <div key={i} style={{ aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "#E8F5E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: "1px solid var(--color-border)", opacity: i < uploadedPhotos.length + 1 ? 1 : 0.4 }}>
                  {i === uploadedPhotos.length ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span style={{ fontSize: "0.625rem", color: "var(--color-text-muted)" }}>Thêm</span>
                    </div>
                  ) : emoji}
                </div>
              ))}
            </div>

            <button onClick={() => setUploadedPhotos((p) => p.length < 4 ? [...p, "photo"] : p)}
              style={{ width: "100%", padding: "0.75rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "transparent", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              {uploadedPhotos.length === 0 ? "Chọn ảnh từ thư viện" : `Thêm ảnh (${uploadedPhotos.length}/4 đã chọn)`}
            </button>
          </div>

          {/* Caption */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>✍️ Mô tả kỷ niệm</h2>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Chia sẻ cảm xúc của gia đình khi hoàn thành dự án này... Điều gì đáng nhớ nhất?"
              rows={4}
              style={{ width: "100%", padding: "0.875rem", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--color-border)", fontSize: "0.9375rem", fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.7, color: "var(--color-text-primary)" }}
            />
          </div>

          {/* Share Options */}
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "2rem", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>🌍 Chia sẻ</h2>

            <label style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", padding: "0.875rem", borderRadius: "var(--radius-lg)", border: `1.5px solid ${shareToFeed ? "var(--color-primary)" : "var(--color-border)"}`, background: shareToFeed ? "rgba(45,106,79,0.04)" : "transparent", marginBottom: "0.75rem" }}>
              <div onClick={() => setShareToFeed((v) => !v)}
                style={{ width: "2.5rem", height: "1.375rem", borderRadius: "var(--radius-full)", background: shareToFeed ? "var(--color-primary)" : "var(--color-border)", position: "relative", cursor: "pointer", transition: "var(--transition-normal)", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: "2px", left: shareToFeed ? "calc(100% - 1.125rem)" : "2px", width: "1rem", height: "1rem", borderRadius: "50%", background: "white", transition: "var(--transition-normal)", boxShadow: "var(--shadow-xs)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Đăng lên cộng đồng OriGami</p>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Chia sẻ khoảnh khắc hoàn thành với cộng đồng</p>
              </div>
            </label>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {["Facebook", "Zalo", "TikTok"].map((platform) => (
                <button key={platform} style={{ flex: 1, padding: "0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "transparent", fontSize: "0.8125rem", color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 500 }}>
                  📤 {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.875rem" }}>
            <Link href={`/gia-dinh/du-an/${PROJECT.id}`} className="btn btn-outline" style={{ textDecoration: "none", flex: 1, justifyContent: "center", padding: "0.875rem" }}>
              ← Quay lại
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-accent"
              style={{ flex: 2, justifyContent: "center", padding: "0.875rem", fontSize: "1rem", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                  Đang lưu...
                </>
              ) : "🎉 Hoàn thành & Lưu kỷ niệm"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
