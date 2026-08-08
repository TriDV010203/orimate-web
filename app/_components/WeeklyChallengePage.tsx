"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { getToken, isLoggedIn } from "@/lib/auth";
import { weeklyChallengeApi, type WeeklyChallengeSubmissionDto } from "@/lib/api/weekly-challenge";
import type { ApiError } from "@/lib/api/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { Heart } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Avatar } from "./DailyChallengePage";
import ImageUploadField from "./ImageUploadField";
import "./WeeklyChallengePage.css";

function formatDateVN(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.substring(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function useCountdownToSundayMidnightGmt7(endDateStr?: string) {
  const [label, setLabel] = useState("-- Ngày --:--:--");
  useEffect(() => {
    if (!endDateStr) return;
    function tick() {
      const nowGmt7Ms = Date.now() + 7 * 3_600_000;

      const endDate = new Date(endDateStr!);
      endDate.setUTCHours(23, 59, 59, 999);

      const remaining = endDate.getTime() - nowGmt7Ms;
      if (remaining <= 0) {
        setLabel("Đã kết thúc");
        return;
      }

      const days = Math.floor(remaining / 86_400_000);
      const h = String(
        Math.floor((remaining % 86_400_000) / 3_600_000),
      ).padStart(2, "0");
      const m = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(
        2,
        "0",
      );
      const s = String(Math.floor((remaining % 60_000) / 1000)).padStart(
        2,
        "0",
      );

      setLabel(`${days > 0 ? days + " ngày " : ""}${h}:${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDateStr]);
  return label;
}

const queryClient = new QueryClient();

export default function WeeklyChallengePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeeklyChallengePageInner />
    </QueryClientProvider>
  );
}

function WeeklyChallengePageInner() {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(isLoggedIn());
  }, []);

  const {
    data: challenge,
    isLoading: loadingChallenge,
    error: challengeError,
  } = useQuery({
    queryKey: ["weekly-challenge-current", token],
    queryFn: () => weeklyChallengeApi.getCurrent(token || undefined),
    retry: (failureCount, error) => {
      return (error as unknown as ApiError)?.status !== 404 && failureCount < 3;
    },
  });

  const countdown = useCountdownToSundayMidnightGmt7(challenge?.endDate);

  const is404 = (challengeError as unknown as ApiError)?.status === 404;

  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [submissions, setSubmissions] = useState<WeeklyChallengeSubmissionDto[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const challengeId = challenge?.id;

  const fetchSubmissions = useCallback(
    async (pageNum: number, append = false) => {
      if (!challengeId) return;
      if (append) setLoadingMoreSubs(true);
      else setLoadingSubs(true);
      try {
        const res = await weeklyChallengeApi.getSubmissions(
          challengeId,
          { page: pageNum, pageSize: 9 },
          token ?? undefined,
        );
        setSubmissions((prev) =>
          append ? [...prev, ...res.items] : res.items,
        );
        setSubPage(res.page);
        setSubTotalPages(res.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        if (append) setLoadingMoreSubs(false);
        else setLoadingSubs(false);
      }
    },
    [challengeId, token],
  );

  useEffect(() => {
    if (challengeId && !is404) {
      // We purposefully call this in an effect to load the initial page of submissions
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSubmissions(1);
    }
  }, [challengeId, is404, fetchSubmissions]);

  function handleLoadMoreSubs() {
    fetchSubmissions(subPage + 1, true);
  }

  // ── Form nộp bài ───────────────────────────────────────────────────────
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitMut = useMutation({
    mutationFn: () => {
      if (!token || !challenge)
        throw new Error("Chưa đăng nhập hoặc không có thử thách");
      return weeklyChallengeApi.submit(challenge.id, token, {
        photoUrl,
        note: note || null,
      });
    },
    onSuccess: () => {
      toast.success("Nộp bài thành công!");
      setPhotoUrl("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["weekly-challenge-current"] });
      fetchSubmissions(1);
    },
    onError: (error: unknown) => {
      setSubmitError((error as ApiError).message || "Nộp bài thất bại");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) return;
    if (!photoUrl) {
      setSubmitError("Vui lòng tải ảnh lên trước khi nộp bài.");
      return;
    }
    setSubmitError(null);
    submitMut.mutate();
  }

  async function handleToggleLike(e: React.MouseEvent, submissionId: string) {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn || !token) {
      toast.error("Vui lòng đăng nhập để bình chọn.");
      return;
    }

    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              isLikedByCurrentUser: !s.isLikedByCurrentUser,
              likeCount: s.likeCount + (s.isLikedByCurrentUser ? -1 : 1),
            }
          : s,
      ),
    );

    try {
      await weeklyChallengeApi.toggleSubmissionLike(token, submissionId);
    } catch {
      toast.error("Không thể bình chọn lúc này, máy chủ đang bận.");
      // Revert on error
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                isLikedByCurrentUser: !s.isLikedByCurrentUser,
                likeCount: s.likeCount + (s.isLikedByCurrentUser ? -1 : 1),
              }
            : s,
        ),
      );
    }
  }

  const alreadySubmitted = challenge?.hasSubmittedThisWeek || false;

  // Calculate top 3
  const top3 = [...submissions]
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 3);
  const podiumDisplay = [top3[1], top3[0], top3[2]].filter(Boolean); // Silver, Gold, Bronze

  return (
    <>
      <Navbar />
      <main
        style={{
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          paddingBottom: "4rem",
        }}
      >
        {/* ── Tabs Navigation ── */}
        <div
          style={{
            background: "var(--color-surface, #ffffff)",
            borderBottom: "1px solid var(--color-border, #e5e7eb)",
          }}
        >
          <div
            className="container"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}
          >
            <div style={{ display: "flex", gap: "2rem" }}>
              <Link
                href="/thach-thuc"
                style={{
                  padding: "1rem 0",
                  color: "var(--color-text-muted, #6b7280)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Thử thách Ngày
              </Link>
              <Link
                href="/thach-thuc-tuan"
                style={{
                  padding: "1rem 0",
                  color: "var(--color-primary, #2D6A4F)",
                  fontWeight: 700,
                  borderBottom: "2px solid var(--color-primary, #2D6A4F)",
                  textDecoration: "none",
                }}
              >
                Thử thách Tuần
              </Link>
            </div>
          </div>
        </div>

        {loadingChallenge ? (
          <div
            style={{
              textAlign: "center",
              padding: "6rem 2rem",
              fontSize: "1.2rem",
              color: "#6b7280",
            }}
          >
            Đang tải sự kiện tuần...
          </div>
        ) : !challenge || is404 ? (
          <div
            style={{
              textAlign: "center",
              padding: "6rem 2rem",
              fontSize: "1.2rem",
              color: "#6b7280",
            }}
          >
            Hiện tại chưa có Sự kiện / Thử thách tuần nào.
          </div>
        ) : (
          <div className="wc-container">
            {/* ── Sidebar ── */}
            <div className="wc-sidebar">
              <div className="wc-hero-card">
                <div className="wc-hero-theme">
                  Chủ đề: {challenge.theme || "Không có chủ đề"}
                </div>
                <h1 className="wc-hero-title">{challenge.title}</h1>
                <p>
                  Từ {formatDateVN(challenge.startDate)} đến{" "}
                  {formatDateVN(challenge.endDate)}
                  <br />
                  <strong>Kết thúc sau: {countdown}</strong>
                </p>
                <Link
                  href={`/huong-dan/${challenge.tutorialSlug}`}
                  className="wc-hero-btn"
                >
                  Xem Hướng Dẫn Gấp
                </Link>
              </div>

              {/* Reward Section */}
              <div className="wc-hero-card" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.2rem", textAlign: "center", marginBottom: "1rem" }}>🎁 Cơ Cấu Giải Thưởng</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ padding: "0.75rem 0", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ fontWeight: 600 }}>🥇 Hạng 1</span>
                    <strong style={{ color: "var(--color-primary)" }}>+30 Hạt Gấp</strong>
                  </li>
                  <li style={{ padding: "0.75rem 0", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ fontWeight: 600 }}>🥈 Hạng 2</span>
                    <strong style={{ color: "var(--color-primary)" }}>+20 Hạt Gấp</strong>
                  </li>
                  <li style={{ padding: "0.75rem 0", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
                    <span style={{ fontWeight: 600 }}>🥉 Hạng 3</span>
                    <strong style={{ color: "var(--color-primary)" }}>+10 Hạt Gấp</strong>
                  </li>
                  <li style={{ padding: "0.75rem 0", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600 }}>⭐ Top 4 - 10</span>
                    <strong style={{ color: "var(--color-primary)" }}>+5 Hạt Gấp</strong>
                  </li>
                </ul>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "1rem", textAlign: "center", fontStyle: "italic" }}>
                  * Dùng Hạt Gấp để đổi quà và mua pattern hiếm trong Cửa hàng.
                </p>
              </div>

              {!alreadySubmitted && loggedIn ? (
                <div className="wc-submit-card" id="submit-section">
                  <h2 className="wc-submit-title">Tham Gia Cuộc Thi</h2>
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <ImageUploadField
                        folder="weekly-challenge"
                        token={token ?? ""}
                        value={photoUrl}
                        onChange={setPhotoUrl}
                      />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 600,
                        }}
                      >
                        Lời nhắn (tuỳ chọn)
                      </label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--color-border)",
                          resize: "vertical",
                        }}
                        rows={3}
                        placeholder="Chia sẻ cảm nghĩ về tác phẩm của bạn..."
                      />
                    </div>
                    {submitError && (
                      <div
                        style={{
                          color: "red",
                          fontSize: "0.9rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {submitError}
                      </div>
                    )}
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        fontSize: "1.1rem",
                        background: "var(--color-primary)",
                        color: "white",
                        borderRadius: "0.5rem",
                        border: "none",
                        fontWeight: 700,
                        cursor: submitMut.isPending ? "not-allowed" : "pointer",
                      }}
                      disabled={submitMut.isPending}
                    >
                      {submitMut.isPending ? "Đang gửi..." : "Gửi Tác Phẩm"}
                    </button>
                  </form>
                </div>
              ) : alreadySubmitted ? (
                <div
                  className="wc-submit-card"
                  style={{
                    textAlign: "center",
                    background: "#ecfdf5",
                    color: "#065f46",
                    fontWeight: "bold",
                  }}
                >
                  🎉 Bạn đã nộp tác phẩm cho tuần này!
                </div>
              ) : (
                <div className="wc-submit-card" style={{ textAlign: "center" }}>
                  <Link
                    href="/dang-nhap"
                    style={{
                      display: "inline-block",
                      padding: "0.75rem 2rem",
                      background: "white",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem",
                      textDecoration: "none",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    Đăng nhập để nộp bài
                  </Link>
                </div>
              )}
            </div>

            {/* ── Main Content ── */}
            <div className="wc-main-content">
              {submissions.length > 0 && (
                <>
                  <h2 className="wc-section-title">🏆 Vinh Danh Top 3</h2>
                  <div className="wc-podium">
                    {podiumDisplay.map((sub) => {
                      let rank = 1;
                      if (sub === top3[0]) rank = 1;
                      else if (sub === top3[1]) rank = 2;
                      else if (sub === top3[2]) rank = 3;

                      return (
                        <div
                          key={sub.id}
                          className={`wc-podium-item wc-rank-${rank}`}
                        >
                          <div className="wc-rank-badge">#{rank}</div>
                          <img
                            src={sub.photoUrl}
                            alt="Bài dự thi"
                            className="wc-podium-img"
                          />
                          <div className="wc-author">
                            {(sub.userDisplayName || "Ẩn danh").split('@')[0]}
                          </div>
                          <button
                            className="wc-likes"
                            onClick={(e) => handleToggleLike(e, sub.id)}
                            style={{ cursor: "pointer", border: "none", outline: "none" }}
                          >
                            <Heart size={18} fill={sub.isLikedByCurrentUser ? "#ef4444" : "none"} color={sub.isLikedByCurrentUser ? "#ef4444" : "currentColor"} />{" "}
                            {sub.likeCount || 0}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <h2 className="wc-section-title">Triển Lãm Tác Phẩm</h2>
                  <div className="wc-gallery">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="wc-gallery-item">
                        <img
                          src={sub.photoUrl}
                          alt="Bài dự thi"
                          className="wc-gallery-img"
                        />
                        <div className="wc-gallery-info">
                          <div className="wc-gallery-header">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <Avatar
                                name={sub.userDisplayName || "Ẩn danh"}
                                avatarUrl={sub.userAvatarUrl}
                                size={1.875}
                              />
                              <span
                                style={{ fontWeight: 600, fontSize: "0.95rem" }}
                              >
                                {(sub.userDisplayName || "Ẩn danh").split('@')[0]}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleToggleLike(e, sub.id)}
                              className={`wc-like-btn ${sub.isLikedByCurrentUser ? "liked" : ""}`}
                            >
                              <Heart
                                size={16}
                                fill={
                                  sub.isLikedByCurrentUser ? "#ef4444" : "none"
                                }
                              />
                              <span>{sub.likeCount || 0}</span>
                            </button>
                          </div>
                          {sub.note && (
                            <div className="wc-gallery-note">
                              &quot;{sub.note}&quot;
                            </div>
                          )}
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                            {new Date(sub.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {subPage < subTotalPages && (
                    <div style={{ textAlign: "center", marginTop: "2rem" }}>
                      <button
                        onClick={handleLoadMoreSubs}
                        disabled={loadingMoreSubs}
                        className="btn"
                        style={{
                          padding: "0.75rem 2rem",
                          background: "white",
                          border: "1px solid var(--color-border)",
                          cursor: "pointer",
                          borderRadius: "0.5rem",
                          fontWeight: 600,
                        }}
                      >
                        {loadingMoreSubs ? "Đang tải..." : "Xem thêm"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {submissions.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem",
                    color: "#6b7280",
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: "1.5rem",
                  }}
                >
                  Chưa có ai nộp bài trong tuần này. Hãy là người đầu tiên!
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
