"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ImageUploadField from "./ImageUploadField";
import { getToken, isLoggedIn } from "@/lib/auth";
import {
  dailyChallengeApi,
  type DailyChallengeDto,
  type DailyChallengeSubmissionDto,
  type ChallengeLeaderboardEntryDto,
} from "@/lib/api/daily-challenge";
import type { ApiError } from "@/lib/api/client";

// ── Design helpers ───────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#2D6A4F", "#D4713B", "#2C7DA0", "#9B59B6", "#E03131", "#F59F00", "#16A34A", "#7C3AED"];

export function colorFromSeed(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export const DIFFICULTY_META: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  Beginner: { label: "Dễ", bg: "rgba(45,106,79,0.1)", fg: "#2D6A4F", border: "rgba(45,106,79,0.25)" },
  Intermediate: { label: "Trung bình", bg: "rgba(212,113,59,0.12)", fg: "#b85c2a", border: "rgba(212,113,59,0.3)" },
  Advanced: { label: "Khó", bg: "rgba(192,57,43,0.1)", fg: "#c0392b", border: "rgba(192,57,43,0.25)" },
};

const HOW_IT_WORKS = [
  { icon: "📅", title: "Mỗi ngày một thử thách", desc: "Admin/Manager chọn hoặc hệ thống tự chọn một mẫu gấp mới mỗi ngày." },
  { icon: "📸", title: "Gấp & đăng ảnh", desc: "Hoàn thành mẫu gấp và chia sẻ ảnh thành phẩm trước khi hết giờ (00:00)." },
  { icon: "🔥", title: "Giữ chuỗi ngày (streak)", desc: "Tham gia liên tục để giữ streak, mở khoá danh hiệu và lên bảng xếp hạng." },
];

function formatDateVN(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Avatar (ảnh thật nếu có, fallback chữ cái đầu) ───────────────────────────
export function Avatar({ name, avatarUrl, size = 2.5 }: { name: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: `${size}rem`, height: `${size}rem`, borderRadius: "50%", objectFit: "cover",
          border: "2px solid var(--color-surface)", flexShrink: 0,
        }}
      />
    );
  }
  const initial = name.trim().split(" ").slice(-1)[0]?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      style={{
        width: `${size}rem`, height: `${size}rem`, borderRadius: "50%",
        background: colorFromSeed(name), color: "white", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: `${size * 0.4}rem`, flexShrink: 0, border: "2px solid var(--color-surface)",
      }}
    >
      {initial}
    </div>
  );
}

// ── Đếm ngược đến 00:00 GMT+7 (đúng mốc backend đóng thử thách) ─────────────
export function useCountdownToMidnightGmt7() {
  const [label, setLabel] = useState("--:--:--");
  useEffect(() => {
    function tick() {
      const nowGmt7Ms = Date.now() + 7 * 3_600_000;
      const msIntoDay = nowGmt7Ms % 86_400_000;
      const remaining = 86_400_000 - msIntoDay;
      const h = String(Math.floor(remaining / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");
      setLabel(`${h}:${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

const SUBMISSIONS_PAGE_SIZE = 9;

export default function DailyChallengePage() {
  const countdown = useCountdownToMidnightGmt7();

  const [tokenReady, setTokenReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setToken(getToken());
    setLoggedIn(isLoggedIn());
    setTokenReady(true);
  }, []);

  // ── Thử thách hôm nay ──────────────────────────────────────────────────
  const [challenge, setChallenge] = useState<DailyChallengeDto | null>(null);
  const [challengeNotFound, setChallengeNotFound] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  const fetchChallenge = useCallback(async () => {
    setLoadingChallenge(true);
    setChallengeNotFound(false);
    setChallengeError(null);
    try {
      const data = await dailyChallengeApi.getToday(token ?? undefined);
      setChallenge(data);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 404) setChallengeNotFound(true);
      else setChallengeError(apiErr.message ?? "Không thể tải thử thách hôm nay.");
    } finally {
      setLoadingChallenge(false);
    }
  }, [token]);

  useEffect(() => {
    if (tokenReady) fetchChallenge();
  }, [tokenReady, fetchChallenge]);

  // ── Bài nộp hôm nay ────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<DailyChallengeSubmissionDto[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const fetchSubmissions = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMoreSubs(true);
      else setLoadingSubs(true);
      try {
        const res = await dailyChallengeApi.getTodaySubmissions(
          { page: pageNum, pageSize: SUBMISSIONS_PAGE_SIZE },
          token ?? undefined
        );
        setSubmissions((prev) => (append ? [...prev, ...res.items] : res.items));
        setSubPage(res.page);
        setSubTotalPages(res.totalPages);
      } catch {
        // gallery rỗng vẫn ổn — không chặn cả trang vì lỗi phụ này
      } finally {
        if (append) setLoadingMoreSubs(false);
        else setLoadingSubs(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (tokenReady && challenge && !challengeNotFound) fetchSubmissions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenReady, challenge?.id, challengeNotFound]);

  function handleLoadMoreSubs() {
    fetchSubmissions(subPage + 1, true);
  }

  async function handleToggleLike(submissionId: string) {
    if (!token) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, isLikedByCurrentUser: !s.isLikedByCurrentUser, likeCount: s.likeCount + (s.isLikedByCurrentUser ? -1 : 1) }
          : s
      )
    );
    try {
      await dailyChallengeApi.toggleSubmissionLike(token, submissionId);
    } catch {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, isLikedByCurrentUser: !s.isLikedByCurrentUser, likeCount: s.likeCount + (s.isLikedByCurrentUser ? -1 : 1) }
            : s
        )
      );
    }
  }

  // ── Bảng xếp hạng chuỗi thử thách ──────────────────────────────────────
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntryDto[]>([]);
  useEffect(() => {
    dailyChallengeApi.getLeaderboard(5).then(setLeaderboard).catch(() => {});
  }, []);

  // ── Form nộp bài ───────────────────────────────────────────────────────
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!photoUrl) {
      setSubmitError("Vui lòng tải ảnh lên trước khi nộp bài.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await dailyChallengeApi.submit(token, { photoUrl, note: note || undefined });
      setJustSubmitted(true);
      setPhotoUrl("");
      setNote("");
      fetchChallenge();
      fetchSubmissions(1);
    } catch (err) {
      const apiErr = err as ApiError;
      setSubmitError(apiErr.message ?? "Nộp bài thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const diffStyle = challenge ? DIFFICULTY_META[challenge.tutorialDifficulty] ?? DIFFICULTY_META.Beginner : DIFFICULTY_META.Beginner;
  const alreadySubmitted = challenge?.hasSubmittedToday === true || justSubmitted;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>
        {/* ── Hero: Today's challenge ── */}
        <section style={{ background: "var(--gradient-hero)", borderBottom: "1px solid var(--color-border)", padding: "2.5rem 0 2rem" }}>
          <div className="container">
            {loadingChallenge ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải thử thách hôm nay...</div>
            ) : challengeNotFound ? (
              <div style={{ textAlign: "center", padding: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🗓️</div>
                <h1 className="text-display" style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                  Hôm nay chưa có Thử thách ngày
                </h1>
                <p style={{ color: "var(--color-text-secondary)" }}>Quay lại sau nhé — Admin/Manager đang chuẩn bị thử thách mới mỗi ngày.</p>
              </div>
            ) : challengeError ? (
              <div style={{ background: "rgba(192,57,43,0.08)", border: "1.5px solid rgba(192,57,43,0.3)", borderRadius: "var(--radius-md)", padding: "1rem 1.25rem", color: "var(--color-error)", textAlign: "center" }}>
                {challengeError}
                <button onClick={fetchChallenge} style={{ marginLeft: "1rem", background: "none", border: "1px solid currentColor", borderRadius: "var(--radius-md)", padding: "0.25rem 0.75rem", cursor: "pointer", color: "var(--color-error)", fontSize: "0.8125rem" }}>Thử lại</button>
              </div>
            ) : challenge ? (
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.75rem", alignItems: "center" }} className="challenge-hero-grid">
                {/* Icon */}
                <div style={{
                  width: "6rem", height: "6rem", borderRadius: "var(--radius-xl)", background: "var(--color-surface)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem",
                  boxShadow: "var(--shadow-lg)", flexShrink: 0,
                }}>
                  🦢
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary-dark)", background: "rgba(45,106,79,0.1)", padding: "0.2rem 0.625rem", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Thử thách ngày {formatDateVN(challenge.challengeDate)}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: diffStyle.fg, background: diffStyle.bg, border: `1px solid ${diffStyle.border}`, padding: "0.2rem 0.625rem", borderRadius: "99px" }}>
                      {diffStyle.label}
                    </span>
                  </div>
                  <h1 className="text-display" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                    {challenge.tutorialTitle}
                  </h1>
                  {challenge.tutorialAuthorName && (
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                      Hướng dẫn bởi {challenge.tutorialAuthorName}
                    </p>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {submissions.length > 0 && (
                        <div style={{ display: "flex" }}>
                          {submissions.slice(0, 4).map((s, i) => (
                            <div key={s.id} style={{ marginLeft: i === 0 ? 0 : "-0.625rem" }}>
                              <Avatar name={s.userDisplayName ?? "?"} avatarUrl={s.userAvatarUrl} size={1.75} />
                            </div>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                        {challenge.submissionCount} người đã tham gia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown + CTA */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", minWidth: "200px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>Kết thúc sau</div>
                    <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent-dark)", letterSpacing: "0.05em" }}>
                      {countdown}
                    </div>
                  </div>
                  {!loggedIn ? (
                    <Link href="/dang-nhap" className="btn btn-accent" style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}>
                      Đăng nhập để tham gia
                    </Link>
                  ) : alreadySubmitted ? (
                    <div className="btn" style={{ width: "100%", justifyContent: "center", background: "var(--color-success, #2D6A4F)", color: "white", cursor: "default" }}>
                      ✅ Đã nộp bài hôm nay
                    </div>
                  ) : (
                    <a href="#nop-bai" className="btn btn-accent" style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}>
                      📸 Nộp bài hôm nay
                    </a>
                  )}
                  <Link href={`/huong-dan/${challenge.tutorialSlug}`} style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
                    Xem hướng dẫn gấp →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {challenge && !challengeNotFound && (
          <div className="container" style={{ marginTop: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }} className="challenge-grid">
              {/* ── Main column ── */}
              <div>
                {/* Personal streak / submit card */}
                <div id="nop-bai" style={{
                  background: "var(--gradient-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
                  padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-card)",
                }}>
                  {!loggedIn ? (
                    <div style={{ textAlign: "center", padding: "0.5rem" }}>
                      <p style={{ fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đăng nhập để giữ chuỗi thử thách của bạn 🔥</p>
                      <Link href="/dang-nhap" className="btn btn-primary" style={{ textDecoration: "none" }}>Đăng nhập</Link>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: alreadySubmitted ? 0 : "1.25rem" }}>
                        <div style={{ fontSize: "2rem" }}>🔥</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
                            Chuỗi thử thách của bạn: {challenge.myChallengeStreak ?? 0} ngày
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                            {alreadySubmitted ? "Bạn đã nộp bài hôm nay — hẹn gặp lại ngày mai!" : "Nộp ảnh hôm nay để giữ streak — đừng để đứt mạch!"}
                          </div>
                        </div>
                      </div>

                      {!alreadySubmitted && (
                        <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem" }}>
                          <ImageUploadField
                            value={photoUrl}
                            onChange={setPhotoUrl}
                            token={token ?? ""}
                            folder="daily-challenge"
                            label="Ảnh thành phẩm"
                            variant="compact"
                          />
                          <div style={{ marginTop: "0.875rem" }}>
                            <label className="input-label" style={{ marginBottom: "0.375rem", display: "block" }}>Ghi chú (tuỳ chọn)</label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              maxLength={500}
                              rows={2}
                              placeholder="Cảm nhận của bạn về mẫu gấp hôm nay..."
                              className="input-field"
                              style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
                            />
                          </div>
                          {submitError && (
                            <p style={{ color: "var(--color-error)", fontSize: "0.8125rem", marginTop: "0.5rem" }}>{submitError}</p>
                          )}
                          <button type="submit" disabled={submitting || !photoUrl} className="btn btn-accent" style={{ marginTop: "0.875rem" }}>
                            {submitting ? "Đang nộp..." : "Nộp bài thử thách"}
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>

                {/* Submissions gallery header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)" }}>
                    Bài nộp hôm nay ({challenge.submissionCount})
                  </h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Sắp xếp theo lượt thích</span>
                </div>

                {loadingSubs ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)" }}>Đang tải bài nộp...</div>
                ) : submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
                    Chưa có ai nộp bài hôm nay — hãy là người đầu tiên!
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }} className="submission-grid">
                      {submissions.map((s) => (
                        <div key={s.id} style={{
                          background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)",
                          overflow: "hidden", boxShadow: "var(--shadow-card)",
                        }}>
                          <div style={{ aspectRatio: "1/1", background: "var(--color-surface-2)" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.photoUrl} alt={s.note ?? "Bài nộp thử thách"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div style={{ padding: "0.75rem 0.875rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                              <Avatar name={s.userDisplayName ?? "Ẩn danh"} avatarUrl={s.userAvatarUrl} size={1.5} />
                              <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{s.userDisplayName ?? "Ẩn danh"}</span>
                              {s.finalRank && s.finalRank <= 3 && (
                                <span style={{ fontSize: "0.9rem" }}>{s.finalRank === 1 ? "🥇" : s.finalRank === 2 ? "🥈" : "🥉"}</span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                {new Date(s.createdAt.endsWith("Z") ? s.createdAt : s.createdAt + "Z").toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <button
                                onClick={() => handleToggleLike(s.id)}
                                disabled={!loggedIn}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem",
                                  color: s.isLikedByCurrentUser ? "#E03131" : "var(--color-text-muted)", fontWeight: 600,
                                  background: "none", border: "none", cursor: loggedIn ? "pointer" : "default", padding: 0,
                                }}
                              >
                                {s.isLikedByCurrentUser ? "❤" : "🤍"} {s.likeCount}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {subPage < subTotalPages && (
                      <div style={{ textAlign: "center", marginTop: "2rem" }}>
                        <button onClick={handleLoadMoreSubs} disabled={loadingMoreSubs} className="btn btn-outline" style={{ padding: "0.75rem 2.5rem" }}>
                          {loadingMoreSubs ? "Đang tải..." : "Xem thêm bài nộp"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ── Sidebar ── */}
              <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Leaderboard */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>🏆 Bảng xếp hạng streak</h3>
                  {leaderboard.length === 0 ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Chưa có ai lên bảng xếp hạng.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                      {leaderboard.map((u) => (
                        <div key={u.userId} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                          <span style={{
                            width: "1.5rem", fontWeight: 700, fontSize: "0.8125rem", textAlign: "center",
                            color: u.rank <= 3 ? "var(--color-accent-dark)" : "var(--color-text-muted)",
                          }}>
                            {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank}
                          </span>
                          <Avatar name={u.displayName ?? "?"} avatarUrl={u.avatarUrl} size={1.75} />
                          <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{u.displayName ?? "Ẩn danh"}</span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>🔥{u.currentStreak}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* How it works */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>ℹ️ Cách thức hoạt động</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    {HOW_IT_WORKS.map((step) => (
                      <div key={step.title} style={{ display: "flex", gap: "0.625rem" }}>
                        <span style={{ fontSize: "1.125rem" }}>{step.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>{step.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA card */}
                <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎯</div>
                  <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Đừng bỏ lỡ thử thách!</p>
                  <p style={{ fontSize: "0.8125rem", opacity: 0.85, marginBottom: "1rem" }}>Ghé lại mỗi ngày để không lỡ mẫu gấp mới và giữ chuỗi streak của bạn.</p>
                  <Link href="/ho-so/thanh-tich" className="btn" style={{ background: "white", color: "var(--color-primary)", width: "100%", justifyContent: "center", textDecoration: "none" }}>
                    🎖️ Xem danh hiệu của tôi
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <style>{`
        @media (max-width: 900px) {
          .challenge-grid { grid-template-columns: 1fr !important; }
          .challenge-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .challenge-hero-grid > div:first-child { margin: 0 auto; }
          aside { position: static !important; }
        }
        @media (max-width: 640px) {
          .submission-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
