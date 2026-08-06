"use client";
// _components/LearningPathsPage.tsx — Trang danh sách "Lộ trình học gấp giấy"
//
// Lộ trình do Admin/Manager biên soạn từ chính bài hướng dẫn official họ đã đăng,
// xếp theo thứ tự cố định. Nối API thật: GET /api/learning-paths (chỉ trả về lộ trình
// đã xuất bản).

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LearningPathModeUnlockPanel from "./LearningPathModeUnlockPanel";
import { learningPathsApi, learningPathModesApi, type LearningPathListItemDto, type LearningPathModeDto, type ApiError } from "@/lib/api";
import { isValidImageUrl } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { Loader2, Map as MapIcon, Lock } from "lucide-react";

export default function LearningPathsPage() {
  // Quay lại từ trang hướng dẫn (nút "Quay lại bài test") sẽ tự mở lại panel của đúng chế độ đó.
  const searchParams = useSearchParams();
  const reopenModeId = searchParams.get("moKhoa");

  const [modes, setModes] = useState<LearningPathModeDto[]>([]);
  const [modesLoading, setModesLoading] = useState(true);
  const [unlockPanelMode, setUnlockPanelMode] = useState<LearningPathModeDto | null>(null);
  const unlockPanelRef = useRef<HTMLDivElement>(null);

  const [paths, setPaths] = useState<LearningPathListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModes = useCallback(async () => {
    setModesLoading(true);
    try {
      const token = getToken() ?? undefined;
      const res = await learningPathModesApi.getModes(token);
      setModes(res);
      setUnlockPanelMode((current) => {
        // Đã có panel mở sẵn (do người dùng vừa bấm) → chỉ cập nhật lại trạng thái mới nhất.
        if (current) return res.find((m) => m.id === current.id) ?? current;
        // Mới quay lại từ trang hướng dẫn (?moKhoa=...) → tự mở lại đúng panel đó.
        if (reopenModeId) return res.find((m) => m.id === reopenModeId) ?? null;
        return null;
      });
    } catch {
      // Non-fatal: khoá/mở lộ trình sẽ không hiển thị được, nhưng danh sách lộ trình vẫn xem bình thường.
    } finally {
      setModesLoading(false);
    }
  }, [reopenModeId]);

  useEffect(() => {
    loadModes();
  }, [loadModes]);

  // Luôn tải toàn bộ lộ trình đã xuất bản (mọi chế độ) — chế độ nào đang khoá thì đánh dấu khoá trên từng thẻ.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await learningPathsApi.getList({ page: 1, pageSize: 48 });
        if (!cancelled) setPaths(res.items);
      } catch (err) {
        if (!cancelled) setError((err as ApiError).message ?? "Không thể tải danh sách lộ trình.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (unlockPanelMode) {
      unlockPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [unlockPanelMode]);

  function getModeForPath(path: LearningPathListItemDto): LearningPathModeDto | null {
    return modes.find((m) => m.id === path.learningPathModeId) ?? null;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--gradient-primary)", padding: "3.5rem 0 3rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, fontSize: "8rem", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "2rem", pointerEvents: "none" }}>
            🗺️
          </div>
          <div className="container" style={{ position: "relative" }}>
            <div style={{ maxWidth: "640px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>🗺️ Lộ trình học</span>
              </div>
              <h1 className="text-display" style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "white", marginBottom: "0.75rem" }}>
                Đi từ tay mơ đến nghệ nhân gấp giấy
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
                Mỗi lộ trình là một chuỗi bài hướng dẫn được đội ngũ OriGami chọn lọc và sắp xếp theo đúng thứ tự dễ → khó — bạn chỉ cần đi theo, không cần tự mò mẫm nên học gì trước.
              </p>
            </div>
          </div>
        </section>

        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 0.75rem" }} />
              <p style={{ color: "var(--color-text-muted)" }}>Đang tải lộ trình...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-error)" }}>{error}</div>
          ) : paths.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <MapIcon size={40} style={{ margin: "0 auto 0.75rem", color: "var(--color-text-muted)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>Chưa có lộ trình học nào được xuất bản.</p>
            </div>
          ) : (
            <>
              {/* ── Path cards ───────────────────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
                {paths.map((path) => {
                  const mode = getModeForPath(path);
                  const isLocked = !modesLoading && mode !== null && !mode.isUnlocked;

                  return (
                    <article
                      key={path.id}
                      className="card"
                      style={{ overflow: "hidden", display: "flex", flexDirection: "column", border: "1.5px solid var(--color-border)", opacity: isLocked ? 0.85 : 1 }}
                    >
                      {/* Cover */}
                      <div style={{
                        background: isValidImageUrl(path.coverImageUrl) ? undefined : "var(--gradient-primary)",
                        padding: "1.75rem 1.5rem", position: "relative", minHeight: "108px",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      }}>
                        {isValidImageUrl(path.coverImageUrl) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={path.coverImageUrl!} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
                        )}
                        {isValidImageUrl(path.coverImageUrl) && (
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15))", zIndex: 1 }} />
                        )}
                        {isLocked && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Lock size={32} color="white" />
                          </div>
                        )}
                        <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "2rem" }}>🗺️</span>
                          <span style={{ background: "rgba(255,255,255,0.9)", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                            {path.itemCount} bài
                          </span>
                        </div>
                        <h2 style={{ position: "relative", zIndex: 3, color: "white", fontWeight: 800, fontSize: "1.3125rem", marginTop: "1rem", lineHeight: 1.3 }}>
                          {path.title}
                        </h2>
                      </div>

                      {/* Body */}
                      <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                        {mode && (
                          <span style={{ alignSelf: "flex-start", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                            {mode.name}
                          </span>
                        )}
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1.25rem", flex: 1 }}>
                          {path.description}
                        </p>

                        {isLocked && mode ? (
                          <button
                            onClick={() => setUnlockPanelMode(mode)}
                            className="btn btn-outline"
                            style={{ marginTop: "auto", justifyContent: "center" }}
                          >
                            <Lock size={16} /> Đã khoá — Làm bài test để mở
                          </button>
                        ) : (
                          <Link
                            href={`/lo-trinh/${path.id}`}
                            className="btn btn-primary"
                            style={{ marginTop: "auto", justifyContent: "center" }}
                          >
                            Xem lộ trình
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* ── Panel mở khoá (hiện khi bấm vào 1 lộ trình đang khoá) ────────── */}
              {unlockPanelMode && (
                <div ref={unlockPanelRef} style={{ scrollMarginTop: "1.5rem" }}>
                  <LearningPathModeUnlockPanel mode={unlockPanelMode} token={getToken()} onSubmitted={loadModes} />
                </div>
              )}
            </>
          )}

          {/* ── How it works ─────────────────────────────────────────────────── */}
          <section style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "2rem", marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "1.5rem", textAlign: "center" }}>
              Lộ trình hoạt động như thế nào?
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
              {[
                { icon: "📍", title: "Chọn lộ trình phù hợp", desc: "Mỗi lộ trình là một chủ đề riêng, gồm các bài được sắp xếp từ dễ đến khó." },
                { icon: "🔓", title: "Học tuần tự, mở khoá dần", desc: "Hoàn thành bài trước để mở bài tiếp theo — không bị rối vì học nhảy cóc." },
                { icon: "🏅", title: "Theo dõi tiến trình", desc: "Xem lại tiến độ của mình bất cứ lúc nào ngay trên trang lộ trình." },
              ].map((s) => (
                <div key={s.title} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>{s.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
