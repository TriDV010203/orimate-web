"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { getToken, isLoggedIn } from "@/lib/auth";
import { communityPostsApi } from "@/lib/api/community-posts";
import { achievementsApi, type AchievementDto } from "@/lib/api/achievements";
import { tutorialsApi, type TutorialListItemDto } from "@/lib/api/tutorials";

type PostType = "photo" | "achievement" | "tutorial";

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ display: "inline-block", width: "1.25rem", height: "1.25rem", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as PostType | null) ?? "photo";

  const [token, setToken] = useState<string | null>(null);
  const [type, setType] = useState<PostType>(initialType);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // achievement state
  const [achievements, setAchievements] = useState<AchievementDto[]>([]);
  const [loadingAch, setLoadingAch] = useState(false);
  const [selectedAch, setSelectedAch] = useState<AchievementDto | null>(null);

  // tutorial state
  const [tutorials, setTutorials] = useState<TutorialListItemDto[]>([]);
  const [loadingTut, setLoadingTut] = useState(false);
  const [selectedTut, setSelectedTut] = useState<TutorialListItemDto | null>(null);
  const [tutSearch, setTutSearch] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/dang-nhap"); return; }
    setToken(getToken());
  }, [router]);

  // load achievements when tab = achievement
  useEffect(() => {
    if (type !== "achievement" || !token) return;
    setLoadingAch(true);
    achievementsApi.getMine(token, 1, 50)
      .then(r => setAchievements(r.items))
      .catch(() => {})
      .finally(() => setLoadingAch(false));
  }, [type, token]);

  // load tutorials when tab = tutorial
  const loadTutorials = useCallback(async (search?: string) => {
    setLoadingTut(true);
    try {
      const r = await tutorialsApi.getList({ search, pageSize: 20 });
      setTutorials(r.items);
    } catch { /**/ }
    finally { setLoadingTut(false); }
  }, []);

  useEffect(() => {
    if (type === "tutorial") loadTutorials();
  }, [type, loadTutorials]);

  // debounce tutorial search
  useEffect(() => {
    if (type !== "tutorial") return;
    const t = setTimeout(() => loadTutorials(tutSearch || undefined), 400);
    return () => clearTimeout(t);
  }, [tutSearch, type, loadTutorials]);

  function addImageField() { setImageUrls(p => [...p, ""]); }
  function removeImage(i: number) { setImageUrls(p => p.filter((_, j) => j !== i)); }
  function updateImage(i: number, v: string) { setImageUrls(p => p.map((u, j) => j === i ? v : u)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);

    // Validate
    if (!content.trim()) { setError("Vui lòng nhập nội dung bài viết."); return; }
    if (content.length > 1000) { setError("Nội dung tối đa 1000 ký tự."); return; }
    if (type === "achievement" && !selectedAch) { setError("Vui lòng chọn một thành tựu."); return; }
    if (type === "tutorial" && !selectedTut) { setError("Vui lòng chọn hướng dẫn muốn chia sẻ."); return; }
    const validUrls = imageUrls.filter(u => u.trim());
    if (type === "photo" && validUrls.length === 0) { setError("Vui lòng nhập ít nhất 1 URL ảnh."); return; }

    setSubmitting(true);
    try {
      const mediaItems = type === "photo"
        ? validUrls.map(u => ({ mediaUrl: u, mediaType: "Image" as const }))
        : type === "achievement" && selectedAch?.photoUrl
          ? [{ mediaUrl: selectedAch.photoUrl, mediaType: "Image" as const }]
          : undefined;

      const tutorialId = type === "tutorial" ? selectedTut?.id
        : type === "achievement" ? selectedAch?.tutorialId
        : undefined;

      const body = { content: content.trim(), tutorialId: tutorialId ?? null, mediaItems: mediaItems ?? null };
      await communityPostsApi.createPost(token, body);
      setSuccess(true);
      setTimeout(() => router.push("/cong-dong"), 1500);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "3rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-lg)", maxWidth: "400px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đăng bài thành công!</h2>
          <p style={{ color: "var(--color-text-muted)" }}>Đang chuyển về trang cộng đồng...</p>
        </div>
      </main>
      <Footer />
    </>
  );

  const TAB_TYPES: { key: PostType; label: string; icon: string }[] = [
    { key: "photo", label: "Đăng ảnh", icon: "📸" },
    { key: "achievement", label: "Thành tựu", icon: "🏅" },
    { key: "tutorial", label: "Hướng dẫn", icon: "📚" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container-sm">
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            <Link href="/cong-dong" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Cộng đồng</Link>
            <span style={{ color: "var(--color-text-muted)" }}>›</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>Tạo bài viết</span>
          </div>

          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#1B4332,#2D6A4F)", padding: "1.75rem 2rem" }}>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "1.5rem", marginBottom: "0.25rem" }}>✍️ Tạo bài viết mới</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9375rem" }}>Chia sẻ với cộng đồng Origami của bạn</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)" }}>
              {TAB_TYPES.map(t => (
                <button key={t.key} id={`tab-${t.key}`} onClick={() => { setType(t.key); setError(null); }}
                  style={{ flex: 1, padding: "1rem", border: "none", background: type === t.key ? "var(--color-surface)" : "transparent", borderBottom: type === t.key ? "2px solid var(--color-primary)" : "2px solid transparent", cursor: "pointer", fontWeight: type === t.key ? 700 : 500, fontSize: "0.9375rem", color: type === t.key ? "var(--color-primary)" : "var(--color-text-muted)", transition: "all var(--transition-fast)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.75rem 2rem" }}>
              {/* Type hint */}
              <div style={{ background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.15)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: 500 }}>
                {type === "photo" && "📸 Chia sẻ ảnh tác phẩm Origami kèm lời viết."}
                {type === "achievement" && "🏅 Chọn một thành tựu đã đạt được để chia sẻ với cộng đồng."}
                {type === "tutorial" && "📚 Giới thiệu một hướng dẫn Origami mà bạn yêu thích hoặc do bạn tạo."}
              </div>

              {/* Content textarea */}
              <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                <label className="input-label">
                  Nội dung bài viết <span style={{ color: "var(--color-error)" }}>*</span>
                </label>
                <textarea id="post-content" value={content} onChange={e => setContent(e.target.value)}
                  placeholder={
                    type === "photo" ? "Chia sẻ cảm nhận về tác phẩm này..." :
                    type === "achievement" ? "Chia sẻ trải nghiệm khi hoàn thành hướng dẫn này..." :
                    "Giới thiệu về hướng dẫn này, tại sao bạn thích nó..."
                  }
                  rows={4} maxLength={1000} style={{ resize: "vertical", lineHeight: 1.65, fontFamily: "inherit" }}
                  className="input-field" />
                <div style={{ textAlign: "right", fontSize: "0.8rem", color: content.length > 900 ? "var(--color-error)" : "var(--color-text-muted)" }}>
                  {content.length}/1000
                </div>
              </div>

              {/* ── Photo type: image URLs ── */}
              {type === "photo" && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                    URL ảnh <span style={{ color: "var(--color-error)" }}>*</span>
                    <span style={{ fontWeight: 400, color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>(tối đa 10 ảnh)</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {imageUrls.map((url, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input id={`image-url-${i}`} type="url" value={url} onChange={e => updateImage(i, e.target.value)}
                          placeholder={`https://example.com/anh-${i + 1}.jpg`}
                          className="input-field" style={{ flex: 1 }} />
                        {url && (
                          <img src={url} alt="" style={{ width: "3rem", height: "3rem", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", flexShrink: 0 }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        {imageUrls.length > 1 && (
                          <button type="button" onClick={() => removeImage(i)} style={{ background: "rgba(192,57,43,0.1)", border: "none", borderRadius: "var(--radius-sm)", width: "2rem", height: "2rem", cursor: "pointer", color: "var(--color-error)", flexShrink: 0, fontSize: "1rem" }}>×</button>
                        )}
                      </div>
                    ))}
                    {imageUrls.length < 10 && (
                      <button type="button" onClick={addImageField} style={{ padding: "0.625rem", background: "var(--color-surface-2)", border: "1.5px dashed var(--color-border)", borderRadius: "var(--radius-md)", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
                        + Thêm ảnh
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── Achievement type: pick achievement ── */}
              {type === "achievement" && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                    Chọn thành tựu <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  {loadingAch ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải thành tựu...</div>
                  ) : achievements.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏅</div>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>Chưa có thành tựu nào. Hãy hoàn thành một hướng dẫn trước!</p>
                      <Link href="/thanh-tuu" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Xem hướng dẫn</Link>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", maxHeight: "320px", overflowY: "auto", paddingRight: "0.25rem" }}>
                      {achievements.map(a => (
                        <div key={a.id} id={`ach-${a.id}`} onClick={() => setSelectedAch(a)}
                          style={{ padding: "0.875rem", borderRadius: "var(--radius-md)", border: `2px solid ${selectedAch?.id === a.id ? "var(--color-primary)" : "var(--color-border)"}`, background: selectedAch?.id === a.id ? "rgba(45,106,79,0.06)" : "var(--color-surface)", cursor: "pointer", transition: "all var(--transition-fast)" }}>
                          {a.photoUrl && <img src={a.photoUrl} alt={a.tutorialTitle} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: "0.5rem" }} />}
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", lineHeight: 1.35 }}>{a.tutorialTitle}</div>
                          {a.note && <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{a.note}</div>}
                          {selectedAch?.id === a.id && (
                            <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 700 }}>✓ Đã chọn</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Tutorial type: search & pick ── */}
              {type === "tutorial" && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="input-label" style={{ marginBottom: "0.75rem", display: "block" }}>
                    Chọn hướng dẫn <span style={{ color: "var(--color-error)" }}>*</span>
                  </label>
                  <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                    <input id="tutorial-search" type="text" value={tutSearch} onChange={e => setTutSearch(e.target.value)}
                      placeholder="Tìm kiếm hướng dẫn..." className="input-field"
                      style={{ paddingLeft: "2.75rem" }} />
                    <svg style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  {loadingTut ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải...</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", maxHeight: "320px", overflowY: "auto" }}>
                      {tutorials.map(t => (
                        <div key={t.id} id={`tut-${t.id}`} onClick={() => setSelectedTut(t)}
                          style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", padding: "0.875rem", borderRadius: "var(--radius-md)", border: `2px solid ${selectedTut?.id === t.id ? "var(--color-primary)" : "var(--color-border)"}`, background: selectedTut?.id === t.id ? "rgba(45,106,79,0.06)" : "var(--color-surface)", cursor: "pointer", transition: "all var(--transition-fast)" }}>
                          {t.coverImageUrl && <img src={t.coverImageUrl} alt={t.title} style={{ width: "4rem", height: "4rem", objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }} />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{t.title}</div>
                            <div style={{ fontSize: "0.775rem", color: "var(--color-text-muted)" }}>{t.author.displayName} · {t.categoryName}</div>
                            {selectedTut?.id === t.id && <div style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 700, marginTop: "0.25rem" }}>✓ Đã chọn</div>}
                          </div>
                        </div>
                      ))}
                      {tutorials.length === 0 && !loadingTut && (
                        <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Không tìm thấy hướng dẫn nào.</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Selected preview */}
              {type === "tutorial" && selectedTut && (
                <div style={{ background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.2)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>📚</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-primary)" }}>{selectedTut.title}</div>
                    <div style={{ fontSize: "0.775rem", color: "var(--color-text-muted)" }}>Người đọc sẽ được dẫn đến trang hướng dẫn này</div>
                  </div>
                  <button type="button" onClick={() => setSelectedTut(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "1rem" }}>×</button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "var(--color-error)", fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <Link href="/cong-dong" className="btn btn-outline" style={{ textDecoration: "none" }}>Hủy</Link>
                <button id="btn-submit-post" type="submit" disabled={submitting} className="btn btn-primary" style={{ minWidth: "120px", opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? <><Spinner /> Đang đăng...</> : "📤 Đăng bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
