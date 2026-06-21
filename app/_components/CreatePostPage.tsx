"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PRIVACY_OPTIONS = [
  { value: "public", label: "Công khai", desc: "Mọi người đều thấy", icon: "🌍" },
  { value: "followers", label: "Người theo dõi", desc: "Chỉ người theo dõi thấy", icon: "👥" },
  { value: "private", label: "Riêng tư", desc: "Chỉ mình tôi thấy", icon: "🔒" },
];

const TUTORIAL_SUGGESTIONS = [
  { id: "rong-origami-3d", title: "Rồng Origami 3D", emoji: "🐉" },
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật", emoji: "🦢" },
  { id: "hoa-hong-origami", title: "Hoa hồng Origami", emoji: "🌸" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [linkedTutorial, setLinkedTutorial] = useState<null | typeof TUTORIAL_SUGGESTIONS[0]>(null);
  const [showTutorialPicker, setShowTutorialPicker] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const EMOJIS = ["🐉", "🦢", "🌸", "🦋", "🐟", "⭐", "🦅", "🐼", "🎋", "🏮", "🌺", "🦄", "🐰", "🎏", "🍂"];

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(`#${t}`) && tags.length < 5) {
      setTags((prev) => [...prev, `#${t}`]);
      setTagInput("");
    }
  }

  function insertEmoji(emoji: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = content.slice(0, start) + emoji + content.slice(end);
    setContent(newText);
    setShowEmojiPanel(false);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }

  const charLimit = 2000;
  const isValid = content.trim().length > 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <Link href="/cong-dong" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", textDecoration: "none", color: "var(--color-text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </Link>
            <h1 className="text-heading" style={{ fontSize: "1.375rem", color: "var(--color-text-primary)" }}>Tạo bài viết</h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem", alignItems: "start" }}>
            {/* ── Composer ── */}
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {/* Author Row */}
              <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, color: "white" }}>U</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Bạn</p>
                  {/* Privacy selector */}
                  <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}
                    style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", padding: "0.125rem 0.5rem", background: "var(--color-surface-2)", cursor: "pointer", outline: "none" }}>
                    {PRIVACY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Textarea */}
              <div style={{ padding: "1.25rem", position: "relative" }}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, charLimit))}
                  placeholder="Chia sẻ tác phẩm Origami của bạn, mẹo hay, cảm xúc... 🌿"
                  rows={8}
                  style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: "1rem", color: "var(--color-text-primary)", lineHeight: 1.75, background: "transparent", fontFamily: "inherit" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.75rem", color: content.length > charLimit * 0.9 ? "var(--color-error)" : "var(--color-text-muted)" }}>
                  {content.length}/{charLimit}
                </div>
              </div>

              {/* Linked Tutorial */}
              {linkedTutorial && (
                <div style={{ margin: "0 1.25rem 1rem", background: "rgba(45,106,79,0.06)", borderRadius: "var(--radius-md)", border: "1px solid rgba(45,106,79,0.15)", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{linkedTutorial.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Liên kết bài hướng dẫn</p>
                    <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary)" }}>{linkedTutorial.title}</p>
                  </div>
                  <button onClick={() => setLinkedTutorial(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ padding: "0 1.25rem 0.875rem", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", background: "rgba(45,106,79,0.08)", color: "var(--color-primary)", borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.8125rem", fontWeight: 500 }}>
                      {tag}
                      <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", lineHeight: 1, padding: "0 0.125rem" }}>×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Toolbar */}
              <div style={{ padding: "0.875rem 1.25rem", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                {/* Image placeholder */}
                <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.5rem 0.875rem", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 500 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Thêm ảnh
                </button>

                {/* Tutorial link */}
                <button onClick={() => setShowTutorialPicker((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.5rem 0.875rem", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 500 }}>
                  📌 Link bài HD
                </button>

                {/* Emoji */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowEmojiPanel((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.5rem 0.875rem", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.8125rem", fontWeight: 500 }}>
                    😊 Emoji
                  </button>
                  {showEmojiPanel && (
                    <div style={{ position: "absolute", bottom: "calc(100% + 0.5rem)", left: 0, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "0.75rem", boxShadow: "var(--shadow-lg)", display: "flex", flexWrap: "wrap", gap: "0.5rem", width: "200px", zIndex: 10 }}>
                      {EMOJIS.map((e) => (
                        <button key={e} onClick={() => insertEmoji(e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", padding: "0.25rem", borderRadius: "var(--radius-sm)" }}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag input */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
                  <input
                    placeholder="#tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                    style={{ width: "90px", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-full)", border: "1.5px solid var(--color-border)", fontSize: "0.8125rem", outline: "none", background: "var(--color-surface-2)" }}
                  />
                  <button onClick={addTag} disabled={tags.length >= 5 || !tagInput.trim()} style={{ padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", background: "var(--color-primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.8125rem", opacity: tags.length >= 5 || !tagInput.trim() ? 0.5 : 1 }}>+</button>
                </div>
              </div>

              {/* Tutorial picker dropdown */}
              {showTutorialPicker && (
                <div style={{ margin: "0 1.25rem 1rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                  <p style={{ padding: "0.75rem 1rem", fontSize: "0.8125rem", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontWeight: 500 }}>Chọn bài hướng dẫn liên quan</p>
                  {TUTORIAL_SUGGESTIONS.map((t) => (
                    <button key={t.id} onClick={() => { setLinkedTutorial(t); setShowTutorialPicker(false); }}
                      style={{ width: "100%", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", background: "none", border: "none", borderBottom: "1px solid var(--color-border)", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ fontSize: "1.5rem" }}>{t.emoji}</span>
                      <span style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", fontWeight: 500 }}>{t.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Submit */}
              <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <Link href="/cong-dong" className="btn btn-outline" style={{ textDecoration: "none", padding: "0.625rem 1.5rem" }}>Hủy</Link>
                <button
                  disabled={!isValid}
                  onClick={() => router.push("/cong-dong")}
                  className="btn btn-primary"
                  style={{ padding: "0.625rem 2rem", opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}>
                  Đăng bài
                </button>
              </div>
            </div>

            {/* ── Tips Sidebar ── */}
            <div style={{ position: "sticky", top: "5rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>💡 Mẹo tạo bài viết hay</h3>
                {[
                  { icon: "📸", tip: "Thêm ảnh tác phẩm để thu hút nhiều lượt thích hơn" },
                  { icon: "#️⃣", tip: "Dùng tối đa 5 hashtag liên quan để tăng khả năng tìm kiếm" },
                  { icon: "📌", tip: "Link bài hướng dẫn bạn đã theo để giúp người khác học theo" },
                  { icon: "❓", tip: "Đặt câu hỏi ở cuối bài để kích thích bình luận" },
                ].map((tip) => (
                  <div key={tip.tip} style={{ display: "flex", gap: "0.75rem", padding: "0.625rem 0", borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{tip.icon}</span>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{tip.tip}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", marginTop: "1rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>Quyền riêng tư</h3>
                {PRIVACY_OPTIONS.map((o) => (
                  <div key={o.value} onClick={() => setPrivacy(o.value)}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", borderRadius: "var(--radius-md)", cursor: "pointer", background: privacy === o.value ? "rgba(45,106,79,0.06)" : "transparent", border: `1.5px solid ${privacy === o.value ? "var(--color-primary)" : "transparent"}`, marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>{o.icon}</span>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{o.label}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{o.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .container-sm > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
