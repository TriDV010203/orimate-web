"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getToken, isLoggedIn } from "@/lib/auth";
import {
  dailyChallengeApi,
  type DailyChallengeDto,
  type DailyChallengeSubmissionDto,
  type ChallengeLeaderboardEntryDto,
} from "@/lib/api/daily-challenge";
import type { ApiError } from "@/lib/api/client";
import ChallengeLayout from "./ChallengeLayout";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const alreadySubmitted = challenge?.hasSubmittedToday === true || justSubmitted;

  return (
    <ChallengeLayout
      challengeType="daily"
      loading={loadingChallenge}
      notFound={challengeNotFound}
      error={challengeError}
      onRetry={fetchChallenge}
      
      heroIcon="🦢"
      heroBadgeLabel={`Thử thách ngày ${challenge ? formatDateVN(challenge.challengeDate) : ""}`}
      difficulty={challenge?.tutorialDifficulty ?? "Beginner"}
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
      streakOrPointsDesc={alreadySubmitted ? "Bạn đã nộp bài hôm nay — hẹn gặp lại ngày mai!" : "Nộp ảnh hôm nay để giữ streak — đừng để đứt mạch!"}
      photoUrl={photoUrl}
      setPhotoUrl={setPhotoUrl}
      note={note}
      setNote={setNote}
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleSubmit}
      token={token}
      folder="daily-challenge"
      
      leaderboardTitle="🏆 Bảng xếp hạng streak"
      leaderboard={leaderboard}
      howItWorksTitle="ℹ️ Cách thức hoạt động"
      howItWorks={HOW_IT_WORKS}
      ctaBanner={
        <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎯</div>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>Đừng bỏ lỡ thử thách!</p>
          <p style={{ fontSize: "0.8125rem", opacity: 0.85, marginBottom: "1rem" }}>Ghé lại mỗi ngày để không lỡ mẫu gấp mới và giữ chuỗi streak của bạn.</p>
          <Link href="/ho-so/thanh-tich" className="btn" style={{ background: "white", color: "var(--color-primary)", width: "100%", justifyContent: "center", textDecoration: "none" }}>
            🎖️ Xem danh hiệu của tôi
          </Link>
        </div>
      }
    />
  );
}
