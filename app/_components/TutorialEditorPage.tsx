"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CATEGORIES = ["Động vật", "Hoa & Thực vật", "Chim", "Origami 3D", "Modular", "Hình học", "Nhân vật", "Biển cả", "Thiên nhiên"];
const DIFFICULTIES = ["Dễ", "Trung bình", "Khó"];

interface Step {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export default function TutorialEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Sư tử biển Origami");
  const [description, setDescription] = useState("Hướng dẫn gấp sư tử biển origami với các bước chi tiết và dễ theo dõi.");
  const [category, setCategory] = useState("Động vật");
  const [difficulty, setDifficulty] = useState("Trung bình");
  const [type, setType] = useState<"free" | "vip">("free");
  const [coverEmoji, setCoverEmoji] = useState("🦁");
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: "Chuẩn bị nguyên liệu", description: "Lấy một tờ giấy origami vuông 20×20cm màu vàng cam. Đảm bảo giấy phẳng và sạch.", imageUrl: "" },
    { id: 2, title: "Gấp đường chéo cơ bản", description: "Gấp giấy theo đường chéo từ góc này sang góc đối diện. Nhấn mạnh đường gấp bằng móng tay.", imageUrl: "" },
    { id: 3, title: "Tạo hình tam giác đôi", description: "Lật giấy và gấp đường chéo còn lại. Mở ra để lấy dấu gấp. Thu nhỏ giấy thành hình tam giác.", imageUrl: "" },
  ]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const EMOJIS = ["🦁", "🐉", "🦢", "🌸", "🦋", "🐟", "🦅", "🐼", "🎋", "🦄", "🐰", "🏯"];

  function addStep() {
    const newStep: Step = { id: Date.now(), title: "", description: "", imageUrl: "" };
    setSteps((prev) => [...prev, newStep]);
    setActiveStep(newStep.id);
  }

  function removeStep(id: number) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    if (activeStep === id) setActiveStep(null);
  }

  function updateStep(id: number, field: keyof Step, value: string) {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  }

  function moveStep(id: number, dir: -1 | 1) {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx + dir < 0 || idx + dir >= steps.length) return;
    const newSteps = [...steps];
    [newSteps[idx], newSteps[idx + dir]] = [newSteps[idx + dir], newSteps[idx]];
    setSteps(newSteps);
  }

  async function handleSave(submit = false) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    if (submit) {
      setSubmitConfirm(false);
      router.push("/studio");
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/studio" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              Creator Studio
            </Link>
            <span style={{ color: "var(--color-border)" }}>›</span>
            <h1 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Chỉnh sửa bài hướng dẫn</h1>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
              <Link href="/studio/studio-1/xem-truoc" className="btn btn-outline" style={{ textDecoration: "none", padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                👁 Xem trước
              </Link>
              <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                {saving ? "Đang lưu..." : "💾 Lưu nháp"}
              </button>
              <button onClick={() => setSubmitConfirm(true)} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                📤 Gửi duyệt
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "1.5rem", alignItems: "start" }}>

            {/* ── LEFT: Tutorial Info ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Cover */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Ảnh bìa</h3>
                <div style={{ aspectRatio: "4/3", borderRadius: "var(--radius-lg)", border: "2px dashed var(--color-border)", background: "var(--color-surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1rem", cursor: "pointer", fontSize: "5rem" }}>
                  {coverEmoji}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setCoverEmoji(e)}
                      style={{ fontSize: "1.5rem", padding: "0.25rem", border: `2px solid ${coverEmoji === e ? "var(--color-primary)" : "transparent"}`, borderRadius: "var(--radius-sm)", background: coverEmoji === e ? "rgba(45,106,79,0.08)" : "none", cursor: "pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Form */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>Thông tin cơ bản</h3>

                <div className="input-group">
                  <label className="input-label">Tiêu đề *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Tiêu đề bài hướng dẫn" />
                </div>

                <div className="input-group">
                  <label className="input-label">Mô tả</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={3} placeholder="Mô tả ngắn về bài hướng dẫn..."
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="input-group">
                    <label className="input-label">Danh mục</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Độ khó</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                      style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}>
                      {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label" style={{ marginBottom: "0.5rem", display: "block" }}>Loại bài</label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {([ ["free", "🆓 Miễn phí"], ["vip", "💎 VIP"] ] as const).map(([key, label]) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.625rem 1rem", borderRadius: "var(--radius-md)", border: `1.5px solid ${type === key ? "var(--color-primary)" : "var(--color-border)"}`, background: type === key ? "rgba(45,106,79,0.06)" : "transparent", flex: 1, justifyContent: "center" }}>
                        <input type="radio" name="type" value={key} checked={type === key} onChange={() => setType(key)} style={{ accentColor: "var(--color-primary)" }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: type === key ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Steps Editor ── */}
            <div>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                    Các bước hướng dẫn ({steps.length} bước)
                  </h3>
                  <button onClick={addStep} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Thêm bước
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {steps.map((step, idx) => (
                    <div key={step.id}
                      style={{ border: `1.5px solid ${activeStep === step.id ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", overflow: "hidden", transition: "var(--transition-fast)" }}>
                      {/* Step Header */}
                      <div
                        onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                        style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", cursor: "pointer", background: activeStep === step.id ? "rgba(45,106,79,0.04)" : "var(--color-surface-2)" }}>
                        <div style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem", flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9375rem", color: step.title ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                          {step.title || "Bước chưa đặt tên..."}
                        </span>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <button onClick={(e) => { e.stopPropagation(); moveStep(step.id, -1); }} disabled={idx === 0}
                            style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveStep(step.id, 1); }} disabled={idx === steps.length - 1}
                            style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === steps.length - 1 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === steps.length - 1 ? 0.4 : 1 }}>↓</button>
                          <button onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                            style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: "var(--color-error)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Step Content (expanded) */}
                      {activeStep === step.id && (
                        <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                          <div className="input-group">
                            <label className="input-label">Tên bước</label>
                            <input value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)}
                              className="input-field" placeholder={`Bước ${idx + 1}: Ví dụ "Gấp đường chéo"`} />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Mô tả chi tiết</label>
                            <textarea value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value)}
                              rows={3} placeholder="Mô tả cách thực hiện bước này..."
                              style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                          </div>
                          <div className="input-group">
                            <label className="input-label">URL ảnh minh họa (tuỳ chọn)</label>
                            <input value={step.imageUrl} onChange={(e) => updateStep(step.id, "imageUrl", e.target.value)}
                              className="input-field" placeholder="https://..." />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={addStep} style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "transparent", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Thêm bước mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Submit Confirm Modal */}
      {submitConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "420px", width: "100%", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "1rem" }}>📤</div>
            <h2 style={{ fontWeight: 700, fontSize: "1.25rem", textAlign: "center", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>Gửi bài hướng dẫn để duyệt?</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", textAlign: "center", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              Sau khi gửi, bài của bạn sẽ được đội ngũ OriGami xem xét trong 1-3 ngày làm việc.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button onClick={() => setSubmitConfirm(false)} className="btn btn-outline" style={{ padding: "0.75rem" }}>Hủy</button>
              <button onClick={() => handleSave(true)} className="btn btn-primary" style={{ padding: "0.75rem" }}>Xác nhận gửi</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
