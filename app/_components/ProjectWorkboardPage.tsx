"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PROJECT = {
  id: "project-1",
  name: "Dự án 1000 con hạc gia đình",
  tutorialTitle: "Hạc giấy nghệ thuật",
  tutorialId: "hac-giay-nghe-thuat",
  tutorialEmoji: "🦢",
  tutorialColor: "#E8F5E8",
  totalSteps: 15,
  startDate: "01/06/2026",
  deadline: "30/06/2026",
  members: [
    { id: "m1", name: "Bố (Trưởng nhóm)", color: "#2D6A4F", initial: "B", role: "owner", progress: 10 },
    { id: "m2", name: "Mẹ", color: "#D4713B", initial: "M", role: "member", progress: 8 },
    { id: "m3", name: "Bé An", color: "#9B59B6", initial: "A", role: "member", progress: 6 },
    { id: "m4", name: "Bé Nam", color: "#2C7DA0", initial: "N", role: "member", progress: 4 },
  ],
};

const STEPS = [
  { id: 1, title: "Chuẩn bị giấy và dụng cụ", description: "Lấy giấy origami 15×15cm, chuẩn bị xương gấp nếu có." },
  { id: 2, title: "Gấp đường chéo cơ bản", description: "Gấp tờ giấy theo đường chéo tạo ra dấu gấp chữ X." },
  { id: 3, title: "Gấp theo đường ngang và dọc", description: "Gấp giấy theo chiều ngang và dọc, nhấn đường gấp." },
  { id: 4, title: "Tạo hình kim cương", description: "Thu 4 góc vào giữa để tạo hình kim cương phẳng." },
  { id: 5, title: "Gấp cánh trước", description: "Gấp 2 cạnh của hình kim cương vào đường giữa." },
  { id: 6, title: "Gấp cánh sau", description: "Lật lại và gấp 2 cạnh còn lại vào đường giữa." },
  { id: 7, title: "Tạo hình thân chim", description: "Kéo 2 tam giác ở hai đầu ra ngoài nhẹ nhàng." },
  { id: 8, title: "Gấp đầu hạc", description: "Gấp một đầu vào trong để tạo đầu và mỏ hạc." },
  { id: 9, title: "Định hình cánh", description: "Nhẹ nhàng kéo 2 cánh ra hai bên để tạo hình dáng." },
  { id: 10, title: "Hoàn thiện", description: "Kiểm tra và chỉnh lại các phần cho đối xứng đẹp." },
  { id: 11, title: "Trang trí (tùy chọn)", description: "Vẽ mắt hoặc dán nhãn dán lên hạc giấy." },
  { id: 12, title: "Chụp ảnh tác phẩm", description: "Đặt hạc giấy ở vị trí đẹp và chụp ảnh lưu kỷ niệm." },
  { id: 13, title: "Chia sẻ với gia đình", description: "Cho các thành viên khác xem tác phẩm của bạn." },
  { id: 14, title: "Ghi chú cảm nhận", description: "Viết một vài dòng về trải nghiệm làm bài hôm nay." },
  { id: 15, title: "Đăng thành tựu", description: "Chia sẻ thành tựu lên cộng đồng OriGami!" },
];

const ACTIVITY_LOG = [
  { actor: "Bé An", color: "#9B59B6", action: "đã hoàn thành bước 6: Gấp cánh sau", time: "2 giờ trước" },
  { actor: "Mẹ", color: "#D4713B", action: "đã hoàn thành bước 8: Gấp đầu hạc", time: "3 giờ trước" },
  { actor: "Bố", color: "#2D6A4F", action: "đã hoàn thành bước 10: Hoàn thiện", time: "5 giờ trước" },
  { actor: "Bé Nam", color: "#2C7DA0", action: "đã tham gia dự án", time: "1 ngày trước" },
];

export default function ProjectWorkboardPage() {
  const [memberProgress, setMemberProgress] = useState(
    Object.fromEntries(PROJECT.members.map((m) => [m.id, m.progress]))
  );
  const [myCompletedSteps, setMyCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  function toggleStep(stepId: number) {
    setMyCompletedSteps((prev) => {
      const isCompleted = prev.includes(stepId);
      const newSteps = isCompleted ? prev.filter((s) => s !== stepId) : [...prev, stepId];
      setMemberProgress((mp) => ({ ...mp, "m1": newSteps.length }));
      return newSteps;
    });
  }

  const totalProgress = Math.round(
    PROJECT.members.reduce((sum, m) => sum + (m.id === "m1" ? myCompletedSteps.length : memberProgress[m.id]), 0) /
    (PROJECT.members.length * PROJECT.totalSteps) * 100
  );

  const myProgress = Math.round(myCompletedSteps.length / PROJECT.totalSteps * 100);
  const allCompleted = myCompletedSteps.length === PROJECT.totalSteps;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/gia-dinh" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Dự án gia đình</Link>
                <span>/</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{PROJECT.name}</span>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.625rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>{PROJECT.name}</h1>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <span>📅 Bắt đầu: {PROJECT.startDate}</span>
                <span>⏰ Deadline: {PROJECT.deadline}</span>
                <Link href={`/huong-dan/${PROJECT.tutorialId}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>📌 {PROJECT.tutorialTitle}</Link>
              </div>
            </div>
            {allCompleted && (
              <Link href={`/gia-dinh/du-an/${PROJECT.id}/hoan-thanh`} className="btn btn-accent" style={{ textDecoration: "none" }}>
                🎉 Hoàn thành dự án
              </Link>
            )}
          </div>

          {/* Overall Progress */}
          <div style={{ background: "var(--gradient-primary)", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "2rem", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>Tiến độ chung</h2>
              <span style={{ fontWeight: 800, fontSize: "2rem" }}>{totalProgress}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)", height: "0.625rem", overflow: "hidden", marginBottom: "0.875rem" }}>
              <div style={{ height: "100%", background: "white", borderRadius: "var(--radius-full)", width: `${totalProgress}%`, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {PROJECT.members.map((m) => {
                const prog = m.id === "m1" ? myCompletedSteps.length : memberProgress[m.id];
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, border: "1.5px solid rgba(255,255,255,0.4)" }}>
                      {m.initial}
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.9)" }}>{m.name.split(" ")[0]}: {prog}/{PROJECT.totalSteps}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>

            {/* ── Checklist ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 className="text-heading" style={{ fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
                  Bảng bước thực hiện
                </h2>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", background: "var(--color-surface-2)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                  {myCompletedSteps.length}/{PROJECT.totalSteps} bước của bạn
                </span>
              </div>

              {/* My progress bar */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "#2D6A4F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9375rem", fontWeight: 700, color: "white", flexShrink: 0 }}>B</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Tiến độ của bạn</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary)" }}>{myProgress}%</span>
                  </div>
                  <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", height: "0.5rem", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--gradient-primary)", borderRadius: "var(--radius-full)", width: `${myProgress}%`, transition: "width 0.3s ease" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {STEPS.map((step) => {
                  const done = myCompletedSteps.includes(step.id);
                  return (
                    <div key={step.id}
                      onClick={() => toggleStep(step.id)}
                      style={{ background: done ? "rgba(45,106,79,0.03)" : "var(--color-surface)", borderRadius: "var(--radius-lg)", border: `1.5px solid ${done ? "rgba(45,106,79,0.3)" : "var(--color-border)"}`, padding: "1rem 1.125rem", display: "flex", alignItems: "flex-start", gap: "0.875rem", cursor: "pointer", transition: "var(--transition-fast)" }}>
                      {/* Checkbox */}
                      <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "50%", border: `2px solid ${done ? "var(--color-primary)" : "var(--color-border)"}`, background: done ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "var(--transition-fast)", marginTop: "0.125rem" }}>
                        {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", background: "var(--color-surface-2)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)" }}>Bước {step.id}</span>
                          <p style={{ fontWeight: done ? 600 : 500, fontSize: "0.9375rem", color: done ? "var(--color-primary)" : "var(--color-text-primary)", textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }}>
                            {step.title}
                          </p>
                        </div>
                        {!done && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{step.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {allCompleted && (
                <div style={{ marginTop: "1.5rem", background: "rgba(45,106,79,0.06)", border: "2px solid rgba(45,106,79,0.2)", borderRadius: "var(--radius-xl)", padding: "1.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.5rem" }}>Bạn đã hoàn thành tất cả các bước!</h3>
                  <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>Chia sẻ thành tựu và upload ảnh tác phẩm của bạn.</p>
                  <Link href={`/gia-dinh/du-an/${PROJECT.id}/hoan-thanh`} className="btn btn-accent" style={{ textDecoration: "none" }}>
                    🏁 Hoàn thành dự án
                  </Link>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Members */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>👨‍👩‍👧‍👦 Thành viên ({PROJECT.members.length})</h3>
                {PROJECT.members.map((m) => {
                  const prog = m.id === "m1" ? myCompletedSteps.length : memberProgress[m.id];
                  const pct = Math.round(prog / PROJECT.totalSteps * 100);
                  return (
                    <div key={m.id} style={{ marginBottom: "0.875rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem" }}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "white", flexShrink: 0 }}>{m.initial}</div>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>{m.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{pct}%</span>
                      </div>
                      <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-full)", height: "6px", overflow: "hidden", marginLeft: "2.625rem" }}>
                        <div style={{ height: "100%", background: m.color, borderRadius: "var(--radius-full)", width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tutorial Reference */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.875rem" }}>📌 Bài hướng dẫn</h3>
                <Link href={`/huong-dan/${PROJECT.tutorialId}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-md)", background: PROJECT.tutorialColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>{PROJECT.tutorialEmoji}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-primary)" }}>{PROJECT.tutorialTitle}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Xem hướng dẫn chi tiết →</p>
                  </div>
                </Link>
              </div>

              {/* Activity Log */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>📋 Hoạt động gần đây</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {ACTIVITY_LOG.map((log, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                      <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: log.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white", flexShrink: 0 }}>{log.actor.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                          <strong>{log.actor}</strong> {log.action}
                        </p>
                        <p style={{ fontSize: "0.7375rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </>
  );
}
