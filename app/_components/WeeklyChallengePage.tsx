"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getToken, isLoggedIn } from "@/lib/auth";
import {
  weeklyChallengeApi,
  type WeeklyChallengeDto,
  type WeeklyChallengeSubmissionDto,
} from "@/lib/api/weekly-challenge";
import { dailyChallengeApi, type ChallengeLeaderboardEntryDto } from "@/lib/api/daily-challenge";
import type { ApiError } from "@/lib/api/client";
import ChallengeLayout from "./ChallengeLayout";
import { useCountdownToMidnightGmt7 } from "./DailyChallengePage";

const HOW_IT_WORKS = [
  { icon: "🗓️", title: "Mỗi Chủ Nhật một thử thách", desc: "Admin/Manager chọn hoặc hệ thống tự chọn một mẫu gấp Khó mỗi Chủ Nhật." },
  { icon: "📸", title: "Gấp & đăng ảnh", desc: "Hoàn thành mẫu gấp và chia sẻ ảnh thành phẩm trước khi hết Chủ Nhật (00:00)." },
  { icon: "🔥", title: "Chung streak với Thử thách ngày", desc: "Nộp bài Thử thách tuần cũng giữ chuỗi thử thách của bạn — không lo bị đứt mạch." },
];

function formatDateVN(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const SUBMISSIONS_PAGE_SIZE = 9;

export default function WeeklyChallengePage() {
  const countdown = useCountdownToMidnightGmt7();

  const [tokenReady, setTokenReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
    setLoggedIn(isLoggedIn());
    setTokenReady(true);
  }, []);

  // ── Thử thách tuần này (chỉ có vào Chủ Nhật) ──────────────────────────
  const [challenge, setChallenge] = useState<WeeklyChallengeDto | null>(null);
  const [challengeNotFound, setChallengeNotFound] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  const fetchChallenge = useCallback(async () => {
    setLoadingChallenge(true);
    setChallengeNotFound(false);
    setChallengeError(null);
    try {
      const data = await weeklyChallengeApi.getCurrent(token ?? undefined);
      setChallenge(data);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 404) setChallengeNotFound(true);
      else setChallengeError(apiErr.message ?? "Không thể tải thử thách tuần này.");
    } finally {
      setLoadingChallenge(false);
    }
  }, [token]);

  useEffect(() => {
    if (tokenReady) fetchChallenge();
  }, [tokenReady, fetchChallenge]);

  // ── Bài nộp tuần này ───────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<WeeklyChallengeSubmissionDto[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingMoreSubs, setLoadingMoreSubs] = useState(false);

  const fetchSubmissions = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMoreSubs(true);
      else setLoadingSubs(true);
      try {
        const res = await weeklyChallengeApi.getCurrentSubmissions(
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
      await weeklyChallengeApi.toggleSubmissionLike(token, submissionId);
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

  // ── Bảng xếp hạng chuỗi thử thách — dùng chung với Thử thách ngày ──────
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
      await weeklyChallengeApi.submit(token, { photoUrl, note: note || undefined });
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

  const alreadySubmitted = challenge?.hasSubmittedThisWeek === true || justSubmitted;

  return (
    <ChallengeLayout
      challengeType="weekly"
      loading={loadingChallenge}
      notFound={challengeNotFound}
      error={challengeError}
      onRetry={fetchChallenge}

      heroIcon="🏆"
      heroBadgeLabel={`Thử thách tuần ${challenge ? formatDateVN(challenge.challengeDate) : ""}`}
      difficulty={challenge?.tutorialDifficulty ?? "Advanced"}
      title={challenge?.tutorialTitle ?? ""}
      authorName={challenge?.tutorialAuthorName ?? undefined}
      submissionCount={challenge?.submissionCount ?? 0}
      countdownLabel="Kết thúc sau"
      countdownValue={countdown}
      tutorialSlug={challenge?.tutorialSlug}

      submissions={submissions}
      onToggleLike={handleToggleLike}
      onLoadMoreSubs={handleLoadMoreSubs}
      subPage={subPage}
      subTotalPages={subTotalPages}
      loadingSubs={loadingSubs}
      loadingMoreSubs={loadingMoreSubs}

      loggedIn={loggedIn}
      alreadySubmitted={alreadySubmitted}
      streakOrPointsLabel="Chuỗi thử thách của bạn"
      streakOrPointsValue={`${challenge?.myChallengeStreak ?? 0} ngày`}
      streakOrPointsIcon="🔥"
      streakOrPointsDesc={alreadySubmitted ? "Bạn đã nộp bài Thử thách tuần này — hẹn Chủ Nhật tuần sau!" : "Nộp ảnh hôm nay để giữ streak — đừng để đứt mạch!"}
      photoUrl={photoUrl}
      setPhotoUrl={setPhotoUrl}
      note={note}
      setNote={setNote}
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleSubmit}
      token={token}
      folder="weekly-challenge"

      leaderboardTitle="🏆 Bảng xếp hạng streak"
      leaderboard={leaderboard}
      howItWorksTitle="ℹ️ Cách thức hoạt động"
      howItWorks={HOW_IT_WORKS}
      ctaBanner={
        <div style={{ background: "linear-gradient(135deg, #9B59B6 0%, #6C3483 100%)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎯</div>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Đừng bỏ lỡ thử thách!</p>
          <p style={{ fontSize: "0.8125rem", opacity: 0.85, marginBottom: "1rem" }}>Ghé lại mỗi Chủ Nhật để không lỡ mẫu gấp Khó và giữ chuỗi streak của bạn.</p>
          <Link href="/ho-so/thanh-tich" className="btn" style={{ background: "white", color: "#9B59B6", width: "100%", justifyContent: "center", textDecoration: "none" }}>
            🎖️ Xem danh hiệu của tôi
          </Link>
        </div>
      }
    />
  );
}
