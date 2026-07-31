"use client";

import { useEffect, useState } from "react";
import { getToken, isLoggedIn } from "@/lib/auth";
import ChallengeLayout from "./ChallengeLayout";

// ── Mock Data cho Weekly Challenge ─────────────────────────────────────────

const MOCK_WEEKLY_CHALLENGE = {
  id: "week-31-2026",
  title: "Rồng Phương Đông Cổ Đại",
  theme: "Thần Thoại",
  startDate: "2026-07-27",
  endDate: "2026-08-02",
  tutorialSlug: "rong-phuong-dong",
  tutorialDifficulty: "Advanced",
  tutorialAuthorName: "Bậc thầy Gấp giấy",
  submissionCount: 156,
  myWeeklyPoints: 450,
};

const MOCK_SUBMISSIONS = [
  { id: "s1", userDisplayName: "Nguyễn Văn A", photoUrl: "https://picsum.photos/400?random=1", likeCount: 45, isLikedByCurrentUser: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "s2", userDisplayName: "Trần Thị B", photoUrl: "https://picsum.photos/400?random=2", likeCount: 32, isLikedByCurrentUser: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "s3", userDisplayName: "Lê Văn C", photoUrl: "https://picsum.photos/400?random=3", likeCount: 28, isLikedByCurrentUser: false, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: "s4", userDisplayName: "Phạm D", photoUrl: "https://picsum.photos/400?random=4", likeCount: 15, isLikedByCurrentUser: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "s5", userDisplayName: "Hoàng E", photoUrl: "https://picsum.photos/400?random=5", likeCount: 10, isLikedByCurrentUser: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "s6", userDisplayName: "Đặng F", photoUrl: "https://picsum.photos/400?random=6", likeCount: 5, isLikedByCurrentUser: false, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

const MOCK_LEADERBOARD = [
  { userId: "u1", rank: 1, displayName: "Nguyễn Văn A", avatarUrl: null, points: 1500 },
  { userId: "u2", rank: 2, displayName: "Trần Thị B", avatarUrl: null, points: 1250 },
  { userId: "u3", rank: 3, displayName: "Lê Văn C", avatarUrl: null, points: 1100 },
  { userId: "u4", rank: 4, displayName: "Phạm D", avatarUrl: null, points: 950 },
  { userId: "u5", rank: 5, displayName: "Hoàng E", avatarUrl: null, points: 800 },
];

const HOW_IT_WORKS = [
  { icon: "🗓️", title: "Thử thách mỗi tuần", desc: "Mỗi tuần sẽ có một chủ đề đặc biệt với độ khó cao hơn thử thách ngày." },
  { icon: "📸", title: "Nộp bài dự thi", desc: "Hoàn thành mẫu gấp trong tuần và chia sẻ ảnh thành phẩm tuyệt đẹp của bạn." },
  { icon: "🏆", title: "Tích điểm thưởng", desc: "Nhận điểm thưởng cực lớn khi hoàn thành để leo top bảng xếp hạng tuần." },
];

function formatDateVN(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function useCountdownToSundayMidnightGmt7() {
  const [label, setLabel] = useState("-- Ngày --:--:--");
  useEffect(() => {
    function tick() {
      const nowGmt7Ms = Date.now() + 7 * 3_600_000;
      const d = new Date(nowGmt7Ms);
      const day = d.getUTCDay(); // 0 is Sunday
      const daysUntilSunday = day === 0 ? 0 : 7 - day;
      
      const nextMonday00 = new Date(d);
      nextMonday00.setUTCDate(d.getUTCDate() + daysUntilSunday);
      nextMonday00.setUTCHours(24, 0, 0, 0);

      const remaining = nextMonday00.getTime() - nowGmt7Ms;
      if (remaining <= 0) {
        setLabel("Đã kết thúc");
        return;
      }

      const days = Math.floor(remaining / 86_400_000);
      const h = String(Math.floor((remaining % 86_400_000) / 3_600_000)).padStart(2, "0");
      const m = String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, "0");
      const s = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");
      
      setLabel(`${days > 0 ? days + " ngày " : ""}${h}:${m}:${s}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export default function WeeklyChallengePage() {
  const countdown = useCountdownToSundayMidnightGmt7();

  const [token, setToken] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
    setLoggedIn(isLoggedIn());
  }, []);

  const [challenge] = useState(MOCK_WEEKLY_CHALLENGE);
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [leaderboard] = useState(MOCK_LEADERBOARD);

  // ── Form nộp bài ───────────────────────────────────────────────────────
  const [photoUrl, setPhotoUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) return;
    if (!photoUrl) {
      setSubmitError("Vui lòng tải ảnh lên trước khi nộp bài.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    
    // Giả lập gọi API
    setTimeout(() => {
      setSubmitting(false);
      setJustSubmitted(true);
      setPhotoUrl("");
      setNote("");
      
      // Thêm bài nộp giả vào đầu danh sách
      setSubmissions(prev => [
        {
          id: "s-new",
          userDisplayName: "Bạn",
          photoUrl: photoUrl,
          likeCount: 0,
          isLikedByCurrentUser: false,
          createdAt: new Date().toISOString()
        },
        ...prev
      ]);
    }, 1500);
  }

  function handleToggleLike(submissionId: string) {
    if (!loggedIn) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, isLikedByCurrentUser: !s.isLikedByCurrentUser, likeCount: s.likeCount + (s.isLikedByCurrentUser ? -1 : 1) }
          : s
      )
    );
  }

  const alreadySubmitted = justSubmitted; // Trong thực tế sẽ check từ API

  return (
    <ChallengeLayout
      challengeType="weekly"
      loading={false}
      notFound={false}
      error={null}
      onRetry={() => {}}
      
      heroIcon="🐉"
      heroBadgeLabel={`Tuần ${formatDateVN(challenge.startDate)} - ${formatDateVN(challenge.endDate)}`}
      heroThemeLabel={challenge.theme}
      difficulty={challenge.tutorialDifficulty}
      title={challenge.title}
      authorName={challenge.tutorialAuthorName}
      submissionCount={challenge.submissionCount}
      countdownLabel="Kết thúc sau"
      countdownValue={countdown}
      tutorialSlug={challenge.tutorialSlug}
      
      submissions={submissions}
      onToggleLike={handleToggleLike}
      
      loggedIn={loggedIn}
      alreadySubmitted={alreadySubmitted}
      streakOrPointsLabel="Điểm tuần của bạn"
      streakOrPointsValue={challenge.myWeeklyPoints}
      streakOrPointsIcon="🌟"
      streakOrPointsDesc={alreadySubmitted ? "Tuyệt vời! Bạn đã hoàn thành thử thách tuần này." : "Nộp ảnh trước Chủ Nhật để nhận ngay 500 điểm tuần!"}
      photoUrl={photoUrl}
      setPhotoUrl={setPhotoUrl}
      note={note}
      setNote={setNote}
      submitting={submitting}
      submitError={submitError}
      onSubmit={handleSubmit}
      token={token}
      folder="weekly-challenge"
      
      leaderboardTitle="🏅 Bảng xếp hạng Tuần"
      leaderboard={leaderboard}
      howItWorksTitle="ℹ️ Về thử thách Tuần"
      howItWorks={HOW_IT_WORKS}
    />
  );
}
