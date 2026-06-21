"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PREVIEW = {
  id: "studio-4",
  title: "Sư tử biển Origami",
  emoji: "🦁",
  color: "#FFF8F0",
  category: "Động vật",
  difficulty: "Trung bình",
  type: "Miễn phí",
  description: "Hướng dẫn gấp sư tử biển origami với các bước chi tiết và dễ theo dõi. Phù hợp cho người học trung cấp với kinh nghiệm gấp giấy cơ bản.",
  steps: [
    { num: 1, title: "Chuẩn bị nguyên liệu", description: "Lấy một tờ giấy origami vuông 20×20cm màu vàng cam. Đảm bảo giấy phẳng và sạch trước khi bắt đầu.", emoji: "📄" },
    { num: 2, title: "Gấp đường chéo cơ bản", description: "Gấp giấy theo đường chéo từ góc này sang góc đối diện. Nhấn mạnh đường gấp bằng móng tay hoặc dụng cụ gấp.", emoji: "✏️" },
    { num: 3, title: "Tạo hình tam giác đôi", description: "Lật giấy và gấp đường chéo còn lại. Mở ra để lấy dấu gấp. Thu nhỏ giấy thành hình tam giác.", emoji: "🔸" },
    { num: 4, title: "Gấp theo đường ngang", description: "Gấp giấy ngang qua giữa, nhấn mạnh đường gấp, rồi mở ra.", emoji: "📐" },
    { num: 5, title: "Tạo hình kim cương", description: "Thu cạnh trên xuống để tạo hình kim cương cân xứng. Đây là bước nền tảng cho nhiều mẫu origami.", emoji: "💠" },
  ],
  totalSteps: 18,
  author: "Bạn",
  authorColor: "#2D6A4F",
  status: "draft",
};

export default function TutorialPreviewStudioPage() {
  return (
    <>
      <Navbar />

      {/* Preview Banner */}
      <div style={{ background: "linear-gradient(135deg, #F59F00 0%, #D97706 100%)", padding: "0.875rem 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem" }}>👁</div>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1 }}>Chế độ xem trước</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem" }}>Đây là giao diện người dùng thấy</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link href="/studio/studio-4" className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", textDecoration: "none", padding: "0.5rem 1.25rem", fontSize: "0.875rem", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}>
              ← Quay lại sửa
            </Link>
            <button className="btn" style={{ background: "white", color: "#D97706", padding: "0.5rem 1.25rem", fontSize: "0.875rem", border: "none", fontWeight: 700 }}>
              📤 Gửi duyệt
            </button>
          </div>
        </div>
      </div>

      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "2.5rem", alignItems: "start" }}>

            {/* ── Left: Tutorial Content ── */}
            <div>
              {/* Hero */}
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", background: PREVIEW.color, display: "flex", alignItems: "center", justifyContent: "center", height: "300px", fontSize: "8rem", marginBottom: "1.5rem", border: "1px solid var(--color-border)", position: "relative" }}>
                {PREVIEW.emoji}
                <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
                  <span className="badge badge-medium">{PREVIEW.difficulty}</span>
                  <span className="badge badge-free">{PREVIEW.type}</span>
                </div>
              </div>

              {/* Breadcrumb */}
              <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <span>Trang chủ</span><span>/</span>
                <span>Thư viện</span><span>/</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{PREVIEW.title}</span>
              </nav>

              {/* Title */}
              <h1 className="text-heading" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>
                {PREVIEW.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: PREVIEW.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "white" }}>B</div>
                  <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9375rem" }}>{PREVIEW.author}</span>
                </div>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>📋 {PREVIEW.totalSteps} bước</span>
                <span className={`badge badge-category`}>{PREVIEW.category}</span>
              </div>

              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.75, marginBottom: "2rem" }}>{PREVIEW.description}</p>

              {/* Steps Preview */}
              <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Các bước hướng dẫn (xem trước {PREVIEW.steps.length}/{PREVIEW.totalSteps})
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {PREVIEW.steps.map((step) => (
                  <div key={step.num} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start", boxShadow: "var(--shadow-xs)" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.9375rem", flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                        {step.emoji} {step.title}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Remaining locked steps indicator */}
              <div style={{ textAlign: "center", padding: "2rem", marginTop: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-xl)", border: "2px dashed var(--color-border)" }}>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
                  + {PREVIEW.totalSteps - PREVIEW.steps.length} bước tiếp theo sẽ được hiển thị đầy đủ sau khi xuất bản
                </p>
              </div>
            </div>

            {/* ── Right: Sidebar Preview ── */}
            <div style={{ position: "sticky", top: "7rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)", marginBottom: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>Thông tin bài hướng dẫn</h3>
                {[
                  { label: "Danh mục", value: PREVIEW.category },
                  { label: "Độ khó", value: PREVIEW.difficulty },
                  { label: "Loại", value: PREVIEW.type },
                  { label: "Số bước", value: `${PREVIEW.totalSteps} bước` },
                  { label: "Trạng thái", value: "Bản nháp" },
                ].map((info) => (
                  <div key={info.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border)", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>{info.label}</span>
                    <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{info.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(212,113,59,0.06)", border: "1.5px solid rgba(212,113,59,0.2)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-accent)", marginBottom: "0.75rem" }}>📋 Checklist trước khi gửi</h3>
                {[
                  { label: "Tiêu đề rõ ràng", done: true },
                  { label: "Mô tả đầy đủ", done: true },
                  { label: "Ít nhất 5 bước", done: true },
                  { label: "Ảnh bìa đẹp", done: false },
                  { label: "Mỗi bước có ảnh/mô tả", done: false },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.375rem 0", fontSize: "0.875rem", color: item.done ? "var(--color-success)" : "var(--color-text-muted)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={item.done ? "currentColor" : "var(--color-border)"} strokeWidth="2.5">
                      {item.done ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="10" />}
                    </svg>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
          [style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </>
  );
}
