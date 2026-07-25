"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { tutorialsApi } from "@/lib/api/tutorials";
import type { CategoryDto } from "@/lib/api/tutorials";
import { getToken } from "@/lib/auth";
import ImageUploadField from "./ImageUploadField";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const DIFFICULTY_OPTIONS: { value: string; label: string }[] = [
  { value: "Beginner", label: "Dễ" },
  { value: "Intermediate", label: "Trung bình" },
  { value: "Advanced", label: "Khó" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "Free", label: "Miễn phí" },
  { value: "VIP", label: "VIP" },
];

interface StepForm {
  key: string;
  description: string;
  imageUrl: string;
}

function makeStepKey() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AdminEditTutorialPage({ tutorialId }: { tutorialId: string }) {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [isOfficial, setIsOfficial] = useState(false);
  const [status, setStatus] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [type, setType] = useState("Free");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }

    let cancelled = false;
    (async () => {
      setLoadingInitial(true);
      setLoadError(null);
      try {
        const [cats, detail] = await Promise.all([
          tutorialsApi.getCategories(token),
          adminApi.getTutorialForAdmin(tutorialId),
        ]);
        if (cancelled) return;
        setCategories(cats);

        setAuthorName(detail.authorName);
        setIsOfficial(detail.isOfficial);
        setStatus(detail.status);
        setTitle(detail.title);
        setDescription(detail.description);
        setCategoryId(detail.categoryId);
        setDifficulty(detail.difficulty);
        setType(detail.type);
        setCoverImageUrl(detail.coverImageUrl ?? "");
        setSteps(
          detail.steps
            .slice()
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((s) => ({ key: makeStepKey(), description: s.description, imageUrl: s.imageUrl ?? "" }))
        );
      } catch (err) {
        const apiErr = err as { message?: string };
        setLoadError(apiErr.message ?? "Không thể tải bài hướng dẫn.");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => { cancelled = true; };
  }, [router, tutorialId]);

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

  function validate(): string | null {
    const t = title.trim();
    const d = description.trim();
    if (t.length < 5 || t.length > 150) return "Tiêu đề phải từ 5 đến 150 ký tự.";
    if (d.length < 20 || d.length > 500) return "Mô tả phải từ 20 đến 500 ký tự.";
    if (!categoryId) return "Vui lòng chọn danh mục.";
    return null;
  }

  async function handleSave() {
    setFormError(null);
    const err = validate();
    if (err) { setFormError(err); return; }

    const token = getToken();
    if (!token) { router.push("/dang-nhap"); return; }

    setSaving(true);
    try {
      await adminApi.updateTutorialAdmin(tutorialId, {
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
      });
      toast.success("Đã lưu thay đổi thành công!");
      router.push("/admin/tutorials/manage");
    } catch (err) {
      const apiErr = err as { message?: string };
      setFormError(apiErr.message ?? "Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return <div className="card admin-queue-item"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (loadError) {
    return (
      <div className="card admin-empty-state">
        <p style={{ fontWeight: 600, color: "var(--color-error)" }}>{loadError}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <Link href="/admin/tutorials/manage" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
            <ArrowLeft size={14} /> Quản lý hướng dẫn
          </Link>
          <h1 className="admin-page-title">Sửa bài hướng dẫn</h1>
          <p className="admin-page-desc">
            Tác giả: <strong>{authorName}</strong>
            {isOfficial && <span className="badge badge-neutral" style={{ marginLeft: "0.5rem" }}>Chính thức</span>}
            {" · "}Trạng thái hiện tại: <strong>{status}</strong> — lưu sẽ áp dụng ngay, không cần duyệt lại.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
          {saving ? <><Loader2 className="animate-spin" size={16} /> Đang lưu...</> : "Lưu thay đổi"}
        </button>
      </div>

      {formError && (
        <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "var(--color-error)", fontWeight: 500 }}>
          {formError}
        </div>
      )}

      <div className="admin-create-tutorial-grid" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ── LEFT: Tutorial Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>Ảnh bìa</h3>
            <ImageUploadField
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              token={getToken() ?? ""}
              folder="tutorials"
              variant="cover"
              disabled={saving}
            />
          </div>

          <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Thông tin cơ bản</h3>

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

            <div className="input-group">
              <label className="input-label">Loại bài</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", background: "var(--color-surface)", outline: "none", cursor: "pointer" }}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Steps Editor ── */}
        <div style={{ minWidth: 0 }}>
          <div className="card" style={{ padding: "1.25rem", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>
                Các bước hướng dẫn ({steps.length} bước)
              </h3>
              <button onClick={addStep} className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Plus size={14} /> Thêm bước
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {steps.map((step, idx) => (
                <div key={step.key}
                  style={{ border: `1.5px solid ${activeStep === step.key ? "var(--color-primary)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", overflow: "hidden", minWidth: 0 }}>
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
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {activeStep === step.key && (
                    <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      <div className="input-group">
                        <label className="input-label">Mô tả chi tiết</label>
                        <textarea value={step.description} onChange={(e) => updateStep(step.key, "description", e.target.value)}
                          rows={3} placeholder="Mô tả cách thực hiện bước này..."
                          style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.875rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
                      </div>
                      <ImageUploadField
                        value={step.imageUrl}
                        onChange={(url) => updateStep(step.key, "imageUrl", url)}
                        token={getToken() ?? ""}
                        folder="tutorials"
                        label="Ảnh minh họa"
                        variant="compact"
                        disabled={saving}
                      />
                    </div>
                  )}
                </div>
              ))}
              {steps.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "1rem 0" }}>Chưa có bước nào — bấm &quot;Thêm bước&quot; để bắt đầu.</p>
              )}
            </div>

            <button onClick={addStep} style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)", background: "transparent", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <Plus size={16} /> Thêm bước mới
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-create-tutorial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
