"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { tutorialsApi } from "@/lib/api/tutorials";
import type { CategoryDto, TutorialStatusValue } from "@/lib/api/tutorials";
import { getToken, getUser } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: "Beginner", label: "Dễ" },
  { value: "Intermediate", label: "Trung bình" },
  { value: "Advanced", label: "Khó" },
];

const TYPE_OPTIONS: { value: "Free" | "VIP"; label: string }[] = [
  { value: "Free", label: "🆓 Miễn phí" },
  { value: "VIP", label: "💎 VIP" },
];

// BR-TUT-01 / BR-12 (BE): chỉ Draft và RevisionRequired mới sửa được trực tiếp.
// Đã Published/PendingManagerReview/Removed thì không sửa qua form này.
const EDITABLE_STATUSES: TutorialStatusValue[] = ["Draft", "RevisionRequired"];

interface StepForm {
  key: string;
  description: string;
  imageUrl: string;
}

function makeStepKey() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TutorialEditorPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const isCreateRoute = routeId === "moi";

  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const [status, setStatus] = useState<TutorialStatusValue | null>(null);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [type, setType] = useState<"Free" | "VIP">("Free");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const canEdit = isCreateRoute || (status !== null && EDITABLE_STATUSES.includes(status));

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/dang-nhap"); return; }
    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }

    let cancelled = false;
    (async () => {
      setLoadingInitial(true);
      setLoadError(null);
      try {
        const cats = await tutorialsApi.getCategories(token);
        if (cancelled) return;
        setCategories(cats);

        if (!isCreateRoute) {
          const detail = await tutorialsApi.getTutorialForAuthor(token, routeId);
          if (cancelled) return;
          setTutorialId(detail.id);
          setTitle(detail.title);
          setDescription(detail.description);
          setCategoryId(detail.categoryId);
          setDifficulty(detail.difficulty);
          setType(detail.type === "VIP" ? "VIP" : "Free");
          setCoverImageUrl(detail.coverImageUrl ?? "");
          setStatus(detail.status);
          setSteps(
            [...detail.steps]
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((s) => ({ key: s.id, description: s.description, imageUrl: s.imageUrl ?? "" }))
          );
        } else if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        const apiErr = err as { message?: string };
        setLoadError(apiErr.message ?? "Không thể tải dữ liệu bài hướng dẫn.");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => { cancelled = true; };
  }, [routeId, isCreateRoute, router]);

  function addStep() {
    const step: StepForm = { key: makeStepKey(), description: "", imageUrl: "" };
    setSteps((prev) => [...prev, step]);
    setActiveStep(step.key);
  }

  function removeStep(key: string) {
    setSteps((prev) => prev.filter((s) => s.key !== key));
    if (activeStep === key) setActiveStep(null);
  }

  function updateStep(key: string, field: "description" | "imageUrl", value: string) {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  }

  function moveStep(key: string, dir: -1 | 1) {
    const idx = steps.findIndex((s) => s.key === key);
    if (idx + dir < 0 || idx + dir >= steps.length) return;
    const next = [...steps];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setSteps(next);
  }

  // BR-12 (BE) — validate cơ bản trước khi lưu (kể cả lưu nháp)
  function validateBasic(): string | null {
    const t = title.trim();
    const d = description.trim();
    if (t.length < 5 || t.length > 150) return "Tiêu đề phải từ 5 đến 150 ký tự.";
    if (d.length < 20 || d.length > 500) return "Mô tả phải từ 20 đến 500 ký tự.";
    if (!categoryId) return "Vui lòng chọn danh mục.";
    return null;
  }

  // Điều kiện để Submit (BE SubmitTutorialHandler) — chỉ chặn khi bấm "Gửi duyệt", không chặn khi lưu nháp
  function validateForSubmit(): string | null {
    const basic = validateBasic();
    if (basic) return basic;
    if (!coverImageUrl.trim()) return "Cần có ảnh bìa trước khi gửi duyệt.";
    if (steps.length < 3 || steps.length > 30) return `Cần từ 3 đến 30 bước (hiện có ${steps.length}).`;
    const missing = steps.find((s) => !s.description.trim() || !s.imageUrl.trim());
    if (missing) return "Mỗi bước cần có mô tả và ảnh minh hoạ trước khi gửi duyệt.";
    return null;
  }

  async function handleSave(submitAfter: boolean) {
    setFormError(null);

    const basicErr = validateBasic();
    if (basicErr) { setFormError(basicErr); return; }
    if (submitAfter) {
      const submitErr = validateForSubmit();
      if (submitErr) { setFormError(submitErr); return; }
    }

    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        type,
        difficulty,
        categoryId: Number(categoryId),
        steps: steps.map((s, i) => ({
          stepOrder: i + 1,
          description: s.description.trim(),
          imageUrl: s.imageUrl.trim() || null,
        })),
      };

      let currentId = tutorialId;
      if (!currentId) {
        const created = await tutorialsApi.createTutorial(token, payload);
        currentId = created.id;
        setTutorialId(created.id);
        setStatus(created.status);
        router.replace(`/studio/${created.id}`);
      } else {
        const updated = await tutorialsApi.updateTutorial(token, currentId, payload);
        setStatus(updated.status);
      }

      if (submitAfter && currentId) {
        await tutorialsApi.submitTutorial(token, currentId);
        setSubmitConfirm(false);
        router.push("/studio");
      }
    } catch (err) {
      const apiErr = err as { message?: string };
      setFormError(apiErr.message ?? "Không thể lưu bài hướng dẫn. Vui lòng thử lại.");
      setSubmitConfirm(false);
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "4rem" }}>
          <div className="container" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Đang tải...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "4rem" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
            <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{loadError}</p>
            <Link href="/studio" className="btn btn-primary" style={{ marginTop: "1rem", textDecoration: "none", display: "inline-flex" }}>
              Về Creator Studio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              position: "sticky",
              top: "4rem",
              zIndex: 10,
              background: "var(--color-bg)",
              paddingTop: "1rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <Link href="/studio" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
              Creator Studio
            </Link>
            <span style={{ color: "var(--color-border)" }}>›</span>
            <h1 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
              {isCreateRoute ? "Tạo bài hướng dẫn mới" : "Chỉnh sửa bài hướng dẫn"}
            </h1>
            {!canEdit && (
              <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: "var(--radius-full)", padding: "0.25rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600 }}>
                Không thể chỉnh sửa ở trạng thái hiện tại
              </span>
            )}
            {canEdit && (
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
                <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                  {saving ? "Đang lưu..." : "💾 Lưu nháp"}
                </button>
                <button onClick={() => setSubmitConfirm(true)} disabled={saving} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                  📤 Gửi duyệt
                </button>
              </div>
            )}
          </div>

          {!canEdit && (
            <div style={{ background: "rgba(212,113,59,0.06)", border: "1.5px solid rgba(212,113,59,0.2)", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", marginBottom: "1.5rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
              Bài này đang ở trạng thái <strong>{status}</strong> nên không thể sửa trực tiếp ở đây.
              {status === "PendingManagerReview" && " Bài đang chờ Manager duyệt."}
              {status === "Published" && " Bài đã xuất bản — cần dùng luồng \"yêu cầu chỉnh sửa\" riêng cho bài đã publish."}
              {status === "Removed" && " Bài đã bị gỡ."}
            </div>
          )}

          {formError && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "var(--color-error)", fontWeight: 500 }}>
              {formError}
            </div>
          )}

          <fieldset disabled={!canEdit || saving} style={{ border: "none", padding: 0, margin: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "1.5rem", alignItems: "start" }}>

              {/* ── LEFT: Tutorial Info ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Cover */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Ảnh bìa</h3>
                  <div style={{ aspectRatio: "4/3", borderRadius: "var(--radius-lg)", border: "2px dashed var(--color-border)", background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", overflow: "hidden" }}>
                    {isValidImageUrl(coverImageUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverImageUrl} alt="Ảnh bìa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Chưa có ảnh bìa</span>
                    )}
                  </div>
                  <div className="input-group">
                    <label className="input-label">URL ảnh bìa</label>
                    <input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="input-field" placeholder="https://..." />
                  </div>
                </div>

                {/* Info Form */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>Thông tin cơ bản</h3>

                  <div className="input-group">
                    <label className="input-label">Tiêu đề * <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(5–150 ký tự)</span></label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Tiêu đề bài hướng dẫn" maxLength={150} />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Mô tả * <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(20–500 ký tự)</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      rows={3} placeholder="Mô tả ngắn về bài hướng dẫn..." maxLength={500}
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div className="input-group">
                      <label className="input-label">Danh mục *</label>
                      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                        style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Độ khó</label>
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                        style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}>
                        {DIFFICULTY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-label" style={{ marginBottom: "0.5rem", display: "block" }}>Loại bài</label>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      {TYPE_OPTIONS.map((opt) => (
                        <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.625rem 1rem", borderRadius: "var(--radius-md)", border: `1.5px solid ${type === opt.value ? "var(--color-primary)" : "var(--color-border)"}`, background: type === opt.value ? "rgba(45,106,79,0.06)" : "transparent", flex: 1, justifyContent: "center" }}>
                          <input type="radio" name="type" value={opt.value} checked={type === opt.value} onChange={() => setType(opt.value)} style={{ accentColor: "var(--color-primary)" }} />
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: type === opt.value ? "var(--color-primary)" : "var(--color-text-secondary)" }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {type === "VIP" && (
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                        Cần đã cấu hình gói giá VIP (Creator VIP Settings) thì mới gửi duyệt được bài VIP.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Steps Editor ── */}
              <div style={{ minWidth: 0 }}>
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                      Các bước hướng dẫn ({steps.length} bước) <span style={{ fontWeight: 400, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>— cần 3–30 bước để gửi duyệt</span>
                    </h3>
                    <button onClick={addStep} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Thêm bước
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {steps.map((step, idx) => (
                      <div key={step.key}
                        style={{ border: `1.5px solid ${activeStep === step.key ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", overflow: "hidden", transition: "var(--transition-fast)", minWidth: 0 }}>
                        {/* Step Header */}
                        <div
                          onClick={() => setActiveStep(activeStep === step.key ? null : step.key)}
                          style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", cursor: "pointer", background: activeStep === step.key ? "rgba(45,106,79,0.04)" : "var(--color-surface-2)", minWidth: 0 }}>
                          <div style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem", flexShrink: 0 }}>
                            {idx + 1}
                          </div>
                          <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: "0.9375rem", color: step.description ? "var(--color-text-primary)" : "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {step.description || "Bước chưa có mô tả..."}
                          </span>
                          <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                            <button onClick={(e) => { e.stopPropagation(); moveStep(step.key, -1); }} disabled={idx === 0}
                              style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                            <button onClick={(e) => { e.stopPropagation(); moveStep(step.key, 1); }} disabled={idx === steps.length - 1}
                              style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === steps.length - 1 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === steps.length - 1 ? 0.4 : 1 }}>↓</button>
                            <button onClick={(e) => { e.stopPropagation(); removeStep(step.key); }}
                              style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: "var(--color-error)" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
                            </button>
                          </div>
                        </div>

                        {/* Step Content (expanded) */}
                        {activeStep === step.key && (
                          <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                            <div className="input-group">
                              <label className="input-label">Mô tả chi tiết</label>
                              <textarea value={step.description} onChange={(e) => updateStep(step.key, "description", e.target.value)}
                                rows={3} placeholder="Mô tả cách thực hiện bước này..."
                                style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                            </div>
                            <div className="input-group">
                              <label className="input-label">URL ảnh minh họa</label>
                              <input value={step.imageUrl} onChange={(e) => updateStep(step.key, "imageUrl", e.target.value)}
                                className="input-field" placeholder="https://..." />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {steps.length === 0 && (
                      <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "1rem 0" }}>Chưa có bước nào — bấm &quot;Thêm bước&quot; để bắt đầu.</p>
                    )}
                  </div>

                  <button onClick={addStep} style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "transparent", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Thêm bước mới
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
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
              Sau khi gửi, bài của bạn sẽ chuyển sang trạng thái &quot;Chờ duyệt&quot; và đội ngũ OriGami sẽ xem xét.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button onClick={() => setSubmitConfirm(false)} className="btn btn-outline" style={{ padding: "0.75rem" }}>Hủy</button>
              <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary" style={{ padding: "0.75rem" }}>
                {saving ? "Đang gửi..." : "Xác nhận gửi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          fieldset > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
