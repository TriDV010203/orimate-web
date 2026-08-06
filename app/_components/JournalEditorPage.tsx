"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { toLocalDateInputValue } from "@/lib/utils";

const TUTORIAL_OPTIONS = [
  { id: "rong-origami-3d", title: "Rồng Origami 3D", emoji: "🐉" },
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật", emoji: "🦢" },
  { id: "hoa-hong-origami", title: "Hoa hồng Origami", emoji: "🌸" },
  { id: "ky-lan-giay", title: "Kỳ lân giấy", emoji: "🦄" },
];

const MOODS = [
  { emoji: "😊", label: "Vui vẻ" },
  { emoji: "😤", label: "Cố gắng" },
  { emoji: "😌", label: "Thư giãn" },
  { emoji: "🎉", label: "Phấn khích" },
  { emoji: "😔", label: "Khó khăn" },
  { emoji: "💪", label: "Quyết tâm" },
  { emoji: "🤔", label: "Suy ngẫm" },
  { emoji: "😄", label: "Hạnh phúc" },
];

export default function JournalEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(toLocalDateInputValue());
  const [mood, setMood] = useState("😊");
  const [isPublic, setIsPublic] = useState(true);
  const [isAchievement, setIsAchievement] = useState(false);
  const [linkedTutorial, setLinkedTutorial] = useState("");
  const [saving, setSaving] = useState(false);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    router.push("/nhat-ky");
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm" style={{ maxWidth: "760px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <Link href="/nhat-ky" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", textDecoration: "none", color: "var(--color-text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </Link>
            <h1 className="text-heading" style={{ fontSize: "1.375rem", color: "var(--color-text-primary)" }}>
              Viết nhật ký
            </h1>
          </div>

          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {/* Date & Mood Row */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.9375rem", color: "var(--color-text-primary)", background: "transparent", cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", alignSelf: "center" }}>Tâm trạng:</span>
                <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  {MOODS.map((m) => (
                    <button key={m.emoji} onClick={() => setMood(m.emoji)} title={m.label}
                      style={{ fontSize: "1.375rem", border: `2px solid ${mood === m.emoji ? "var(--color-primary)" : "transparent"}`, borderRadius: "var(--radius-md)", background: mood === m.emoji ? "rgba(45,106,79,0.08)" : "none", cursor: "pointer", padding: "0.125rem", lineHeight: 1, transition: "var(--transition-fast)" }}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{ padding: "1.25rem 1.5rem 0" }}>
              <input
                type="text"
                placeholder="Tiêu đề nhật ký..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", border: "none", outline: "none", fontSize: "1.375rem", fontWeight: 700, color: "var(--color-text-primary)", background: "transparent", fontFamily: "inherit", lineHeight: 1.4, marginBottom: "0.875rem" }}
              />

              {/* Content */}
              <textarea
                placeholder="Viết về ngày hôm nay, những điều bạn học được, cảm xúc của bạn với Origami..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: "1rem", color: "var(--color-text-primary)", background: "transparent", fontFamily: "inherit", lineHeight: 1.8 }}
              />
            </div>

            {/* Options */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>

                {/* Link Tutorial */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)" }}>📌 Liên kết bài HD:</span>
                  <select value={linkedTutorial} onChange={(e) => setLinkedTutorial(e.target.value)}
                    style={{ border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.375rem 0.75rem", fontSize: "0.8125rem", background: "var(--color-surface)", cursor: "pointer", outline: "none", color: linkedTutorial ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                    <option value="">Không có</option>
                    {TUTORIAL_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>
                    ))}
                  </select>
                </div>

                {/* Achievement toggle */}
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={isAchievement} onChange={(e) => setIsAchievement(e.target.checked)}
                    style={{ width: "1rem", height: "1rem", accentColor: "var(--color-accent)", cursor: "pointer" }} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>🏆 Đánh dấu thành tựu</span>
                </label>

                {/* Public toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginLeft: "auto" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
                  </span>
                  <div onClick={() => setIsPublic((v) => !v)}
                    style={{ width: "2.5rem", height: "1.375rem", borderRadius: "var(--radius-full)", background: isPublic ? "var(--color-primary)" : "var(--color-border)", position: "relative", cursor: "pointer", transition: "var(--transition-normal)" }}>
                    <div style={{ position: "absolute", top: "2px", left: isPublic ? "calc(100% - 1.125rem)" : "2px", width: "1rem", height: "1rem", borderRadius: "50%", background: "white", transition: "var(--transition-normal)", boxShadow: "var(--shadow-xs)" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Photo */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1.5px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "transparent", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", transition: "var(--transition-fast)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                Thêm ảnh tác phẩm
              </button>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Tải lên ảnh Origami của bạn (JPG, PNG, tối đa 5MB)</span>
            </div>

            {/* Actions */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <Link href="/nhat-ky" className="btn btn-outline" style={{ textDecoration: "none", padding: "0.625rem 1.5rem" }}>Hủy</Link>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="btn btn-primary"
                style={{ padding: "0.625rem 2rem", opacity: !isValid || saving ? 0.6 : 1, cursor: !isValid || saving ? "not-allowed" : "pointer" }}>
                {saving ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    Đang lưu...
                  </>
                ) : "Lưu nhật ký"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
