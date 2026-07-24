"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import type { AdminTutorialListItemResponse } from "@/lib/api/admin";
import { learningPathsApi } from "@/lib/api/learning-paths";
import type { LearningPathStatusValue } from "@/lib/api/learning-paths";
import { getToken } from "@/lib/auth";
import { isValidImageUrl } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Loader2, Search, Rocket, Archive } from "lucide-react";
import toast from "react-hot-toast";

interface PathItemForm {
  tutorialId: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  difficulty: string;
  categoryName: string;
}

const STATUS_META: Record<LearningPathStatusValue, { label: string; badge: string }> = {
  Draft: { label: "Bản nháp", badge: "badge-neutral" },
  Published: { label: "Đã xuất bản", badge: "badge-success" },
  Archived: { label: "Đã lưu trữ", badge: "badge-danger" },
};

function diffLabel(d: string) {
  const l = d.toLowerCase();
  if (l === "beginner") return "Dễ";
  if (l === "intermediate") return "Trung bình";
  if (l === "advanced") return "Khó";
  return d;
}

interface Props {
  /** Khi có giá trị: chế độ sửa lộ trình đã tồn tại. Khi undefined: tạo lộ trình mới. */
  pathId?: string;
}

export default function AdminLearningPathFormPage({ pathId }: Props) {
  const router = useRouter();
  const isEdit = !!pathId;

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<LearningPathStatusValue>("Draft");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [items, setItems] = useState<PathItemForm[]>([]);

  const [pickerSearchText, setPickerSearchText] = useState("");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerResults, setPickerResults] = useState<AdminTutorialListItemResponse[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const token = getToken();

  // Nạp dữ liệu lộ trình hiện có (chế độ sửa)
  useEffect(() => {
    if (!token) { router.push("/dang-nhap"); return; }
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      setLoadingInitial(true);
      setLoadError(null);
      try {
        const path = await learningPathsApi.getForAdmin(token, pathId!);
        if (cancelled) return;
        setTitle(path.title);
        setDescription(path.description);
        setCoverImageUrl(path.coverImageUrl ?? "");
        setStatus(path.status);
        setItems(path.items.map((i) => ({
          tutorialId: i.tutorialId,
          title: i.tutorialTitle,
          slug: i.tutorialSlug,
          coverImageUrl: i.tutorialCoverImageUrl,
          difficulty: i.tutorialDifficulty,
          categoryName: i.categoryName,
        })));
      } catch (err) {
        const apiErr = err as { message?: string };
        setLoadError(apiErr.message ?? "Không thể tải lộ trình.");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isEdit, pathId, router, token]);

  // Debounce ô tìm bài để thêm vào lộ trình
  useEffect(() => {
    const timer = setTimeout(() => setPickerSearch(pickerSearchText.trim()), 400);
    return () => clearTimeout(timer);
  }, [pickerSearchText]);

  // Danh sách bài đủ điều kiện: chỉ bài official đã xuất bản (Admin/Manager tự viết)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setPickerLoading(true);
      try {
        const res = await adminApi.getAllTutorials({
          search: pickerSearch || undefined,
          status: "Published",
          isOfficial: true,
          page: 1,
          pageSize: 20,
        });
        if (!cancelled) setPickerResults(res.items);
      } catch {
        if (!cancelled) setPickerResults([]);
      } finally {
        if (!cancelled) setPickerLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pickerSearch, token]);

  function addItem(t: AdminTutorialListItemResponse) {
    if (items.some((i) => i.tutorialId === t.id)) return;
    setItems((prev) => [...prev, {
      tutorialId: t.id,
      title: t.title,
      slug: t.slug,
      coverImageUrl: t.coverImageUrl,
      difficulty: t.difficulty,
      categoryName: t.categoryName,
    }]);
  }

  function removeItem(tutorialId: string) {
    setItems((prev) => prev.filter((i) => i.tutorialId !== tutorialId));
  }

  function moveItem(tutorialId: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.tutorialId === tutorialId);
    if (idx + dir < 0 || idx + dir >= items.length) return;
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setItems(next);
  }

  function validate(): string | null {
    const t = title.trim();
    const d = description.trim();
    if (t.length < 5 || t.length > 150) return "Tiêu đề phải từ 5 đến 150 ký tự.";
    if (d.length < 20 || d.length > 1000) return "Mô tả phải từ 20 đến 1000 ký tự.";
    return null;
  }

  async function handleSave() {
    setFormError(null);
    const err = validate();
    if (err) { setFormError(err); return; }
    if (!token) { router.push("/dang-nhap"); return; }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        tutorialIds: items.map((i) => i.tutorialId),
      };
      if (isEdit) {
        await learningPathsApi.update(token, pathId!, body);
        toast.success("Đã lưu thay đổi.");
      } else {
        const created = await learningPathsApi.create(token, body);
        toast.success("Đã tạo lộ trình (bản nháp).");
        router.push(`/admin/learning-paths/${created.id}/edit`);
        return;
      }
    } catch (err) {
      const apiErr = err as { message?: string };
      setFormError(apiErr.message ?? "Không thể lưu lộ trình. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!token || !pathId) return;
    setPublishing(true);
    try {
      await learningPathsApi.publish(token, pathId);
      setStatus("Published");
      toast.success("Đã xuất bản lộ trình.");
    } catch (err) {
      const apiErr = err as { message?: string };
      toast.error(apiErr.message ?? "Không thể xuất bản.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleArchive() {
    if (!token || !pathId) return;
    if (!confirm("Lưu trữ lộ trình này? Lộ trình sẽ bị ẩn khỏi trang công khai.")) return;
    setArchiving(true);
    try {
      await learningPathsApi.archive(token, pathId);
      setStatus("Archived");
      toast.success("Đã lưu trữ lộ trình.");
    } catch (err) {
      const apiErr = err as { message?: string };
      toast.error(apiErr.message ?? "Không thể lưu trữ.");
    } finally {
      setArchiving(false);
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
          <Link href="/admin/learning-paths" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
            <ArrowLeft size={14} /> Lộ trình học
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <h1 className="admin-page-title">{isEdit ? "Sửa lộ trình" : "Tạo lộ trình"}</h1>
            {isEdit && <span className={`badge ${STATUS_META[status].badge}`}>{STATUS_META[status].label}</span>}
          </div>
          <p className="admin-page-desc">
            Chỉ có thể thêm bài hướng dẫn do Admin/Manager tự viết và đã xuất bản (official) — không lấy bài của creator khác.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          {isEdit && status !== "Published" && (
            <button onClick={handlePublish} disabled={publishing || items.length === 0} className="btn btn-outline" title={items.length === 0 ? "Cần ít nhất 1 bài để xuất bản" : undefined}>
              {publishing ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />} Xuất bản
            </button>
          )}
          {isEdit && status !== "Archived" && (
            <button onClick={handleArchive} disabled={archiving} className="btn btn-outline">
              {archiving ? <Loader2 className="animate-spin" size={16} /> : <Archive size={16} />} Lưu trữ
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: "0.75rem 1.5rem" }}>
            {saving ? <><Loader2 className="animate-spin" size={16} /> Đang lưu...</> : "💾 Lưu"}
          </button>
        </div>
      </div>

      {formError && (
        <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "0.875rem 1rem", marginBottom: "1.25rem", color: "var(--color-error)", fontWeight: 500 }}>
          {formError}
        </div>
      )}

      <div className="admin-create-tutorial-grid" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* ── LEFT: Path info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>Ảnh bìa</h3>
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

          <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>Thông tin cơ bản</h3>

            <div className="input-group">
              <label className="input-label">Tiêu đề * <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(5–150 ký tự)</span></label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Tên lộ trình học" maxLength={150} />
            </div>

            <div className="input-group">
              <label className="input-label">Mô tả * <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(20–1000 ký tự)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} placeholder="Mô tả ngắn về lộ trình này..." maxLength={1000}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6 }} />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Item picker + selected items ── */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div className="card" style={{ padding: "1.25rem", minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.875rem" }}>Thêm bài hướng dẫn</h3>
            <div className="input-with-icon" style={{ marginBottom: "0.875rem" }}>
              <Search className="input-icon" size={16} />
              <input
                type="text"
                value={pickerSearchText}
                onChange={(e) => setPickerSearchText(e.target.value)}
                placeholder="Tìm bài official đã xuất bản..."
                className="input-field"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: 260, overflowY: "auto" }}>
              {pickerLoading ? (
                <div style={{ textAlign: "center", padding: "1rem" }}><Loader2 className="animate-spin" size={20} /></div>
              ) : pickerResults.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "0.75rem 0" }}>
                  Không tìm thấy bài official nào phù hợp.
                </p>
              ) : (
                pickerResults.map((t) => {
                  const added = items.some((i) => i.tutorialId === t.id);
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.625rem", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--color-surface)", flexShrink: 0, overflow: "hidden" }}>
                        {isValidImageUrl(t.coverImageUrl) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.title}
                      </span>
                      <button
                        onClick={() => addItem(t)}
                        disabled={added}
                        className={`btn btn-sm ${added ? "btn-outline" : "btn-primary"}`}
                        style={{ flexShrink: 0 }}
                      >
                        {added ? "Đã thêm" : <><Plus size={14} /> Thêm</>}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card" style={{ padding: "1.25rem", minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem" }}>
              Bài trong lộ trình ({items.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {items.map((item, idx) => (
                <div key={item.tutorialId}
                  style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 1rem", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-lg)", minWidth: 0 }}>
                  <div style={{ width: "1.875rem", height: "1.875rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem", flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)", flexShrink: 0, overflow: "hidden" }}>
                    {isValidImageUrl(item.coverImageUrl) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverImageUrl!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      <span>{item.categoryName}</span>
                      <span>·</span>
                      <span>{diffLabel(item.difficulty)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <button onClick={() => moveItem(item.tutorialId, -1)} disabled={idx === 0}
                      style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                    <button onClick={() => moveItem(item.tutorialId, 1)} disabled={idx === items.length - 1}
                      style={{ padding: "0.25rem", border: "none", background: "none", cursor: idx === items.length - 1 ? "not-allowed" : "pointer", color: "var(--color-text-muted)", opacity: idx === items.length - 1 ? 0.4 : 1 }}>↓</button>
                    <button onClick={() => removeItem(item.tutorialId)}
                      style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: "var(--color-error)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: "1rem 0" }}>
                  Chưa có bài nào — tìm và bấm &quot;Thêm&quot; ở trên để bắt đầu.
                </p>
              )}
            </div>
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
