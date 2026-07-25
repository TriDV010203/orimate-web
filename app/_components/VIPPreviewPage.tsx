"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";

const TUTORIAL = {
  id: "phuong-hoang-huyen-thoai",
  title: "Phượng hoàng huyền thoại",
  emoji: "🦅",
  color: "#FFF5F0",
  category: "Chim",
  difficulty: "Khó",
  diffClass: "badge-hard",
  steps: 30,
  views: "5.2K",
  likes: 876,
  rating: 4.9,
  reviewCount: 241,
  author: "Quang Minh",
  authorColor: "#2D6A4F",
  authorFollowers: "12.4K",
  authorTutorials: 48,
  description: "Tuyệt tác Origami phượng hoàng với đôi cánh dang rộng uy nghi. Đây là một trong những bài hướng dẫn phức tạp nhất của OriGami, đòi hỏi kỹ năng gấp giấy nâng cao và sự kiên nhẫn. Bài hướng dẫn bao gồm 30 bước chi tiết với hình ảnh minh họa rõ ràng.",
  previewSteps: [
    { num: 1, title: "Chuẩn bị giấy", desc: "Sử dụng giấy origami 30×30cm màu đỏ cam. Đảm bảo giấy phẳng và không bị nhăn.", emoji: "📄" },
    { num: 2, title: "Gấp đường chéo cơ bản", desc: "Gấp giấy theo đường chéo từ góc trên trái xuống góc dưới phải. Nhấn mạnh đường gấp.", emoji: "✏️" },
  ],
  lockedSteps: 28,
  features: [
    "30 bước chi tiết với ảnh minh họa HD",
    "Video hướng dẫn từng bước",
    "Tải về bản PDF in sẵn",
    "Hỗ trợ từ creator",
    "Không giới hạn lượt xem lại",
  ],
  vipPlans: [
    { name: "Quang Minh VIP", price: "50.000₫", period: "tháng", tutorials: 48, tag: "Phổ biến" },
    { name: "OriGami Premium", price: "99.000₫", period: "tháng", tutorials: "Toàn bộ", tag: "Tốt nhất" },
  ],
};

const SIMILAR_FREE = [
  { id: "hac-giay-nghe-thuat", title: "Hạc giấy nghệ thuật", emoji: "🦢", color: "#E8F5E8", steps: 15, difficulty: "Trung bình" },
  { id: "tho-origami", title: "Thỏ Origami dễ thương", emoji: "🐰", color: "#FFF0F0", steps: 12, difficulty: "Dễ" },
  { id: "ca-koi-don-gian", title: "Cá koi đơn giản", emoji: "🐟", color: "#F0F8FF", steps: 10, difficulty: "Dễ" },
];

export default function VIPPreviewPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>

        {/* ── VIP Banner ── */}
        <div style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #D4713B 100%)", padding: "0.875rem 0", textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "0.9375rem", fontWeight: 500 }}>
            🔒 Nội dung VIP — <Link href="#vip-plans" style={{ color: "#F4A261", fontWeight: 700, textDecoration: "underline" }}>Đăng ký ngay để xem đầy đủ</Link>
          </p>
        </div>

        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2.5rem", alignItems: "start" }}>

            {/* ── Left: Tutorial Content ── */}
            <div>
              {/* Breadcrumb */}
              <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Trang chủ</Link>
                <span>/</span>
                <Link href="/huong-dan" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Thư viện</Link>
                <span>/</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{TUTORIAL.title}</span>
              </nav>

              {/* Hero */}
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", background: TUTORIAL.color, display: "flex", alignItems: "center", justifyContent: "center", height: "320px", fontSize: "7rem", marginBottom: "1.5rem", position: "relative", border: "1px solid var(--color-border)" }}>
                {TUTORIAL.emoji}
                <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
                  <span className="badge badge-hard">{TUTORIAL.difficulty}</span>
                  <span className="badge badge-vip">VIP</span>
                </div>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 100%)" }} />
              </div>

              {/* Title & Meta */}
              <h1 className="text-heading" style={{ fontSize: "clamp(1.625rem,3vw,2.25rem)", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
                {TUTORIAL.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
                <Link href={`/kenh/quangminh_origami`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: TUTORIAL.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "white" }}>
                    {TUTORIAL.author.charAt(0)}
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9375rem" }}>{TUTORIAL.author}</span>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#F59F00" }}>
                  {"★".repeat(5)} <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginLeft: "0.25rem" }}>{TUTORIAL.rating} ({TUTORIAL.reviewCount} đánh giá)</span>
                </div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>👁 {TUTORIAL.views} lượt xem</span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>📋 {TUTORIAL.steps} bước</span>
              </div>

              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.75, marginBottom: "2rem" }}>
                {TUTORIAL.description}
              </p>

              {/* Preview Steps */}
              <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                Xem trước ({TUTORIAL.previewSteps.length}/{TUTORIAL.steps} bước)
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {TUTORIAL.previewSteps.map((step) => (
                  <div key={step.num} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start", boxShadow: "var(--shadow-xs)" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.9375rem", flexShrink: 0 }}>
                      {step.num}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                        {step.emoji} {step.title}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Locked steps overlay */}
              <div style={{ position: "relative", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                {/* Blurred preview */}
                <div style={{ filter: "blur(6px)", pointerEvents: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[3, 4, 5].map((n) => (
                    <div key={n} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", display: "flex", gap: "1rem" }}>
                      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--color-surface-2)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: "1rem", background: "var(--color-surface-2)", borderRadius: "4px", marginBottom: "0.5rem", width: "60%" }} />
                        <div style={{ height: "0.75rem", background: "var(--color-surface-2)", borderRadius: "4px", width: "90%" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lock overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(250,250,248,0) 0%, rgba(250,250,248,0.97) 50%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: "1.5rem", textAlign: "center", gap: "0.75rem" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
                    {TUTORIAL.lockedSteps} bước tiếp theo đang bị khóa
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", maxWidth: "300px" }}>
                    Đăng ký VIP để xem toàn bộ {TUTORIAL.steps} bước và video hướng dẫn chi tiết
                  </p>
                  <a href="#vip-plans" className="btn btn-accent" style={{ textDecoration: "none", padding: "0.75rem 2rem" }}>
                    Mở khóa ngay →
                  </a>
                </div>
              </div>

              {/* Similar Free Tutorials */}
              <div style={{ marginTop: "3rem" }}>
                <h2 className="text-heading" style={{ fontSize: "1.25rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                  Bài miễn phí tương tự
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  {SIMILAR_FREE.map((t) => (
                    <Link key={t.id} href={`/huong-dan/${t.id}`} style={{ textDecoration: "none", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", display: "block", transition: "var(--transition-fast)" }}>
                      <div style={{ aspectRatio: "4/3", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>{t.emoji}</div>
                      <div style={{ padding: "0.875rem" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{t.title}</p>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{t.steps} bước · {t.difficulty}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: VIP Plans ── */}
            <div style={{ position: "sticky", top: "5rem" }} id="vip-plans">

              {/* Author Card */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: TUTORIAL.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", fontWeight: 700, color: "white" }}>
                    {TUTORIAL.author.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>{TUTORIAL.author}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{TUTORIAL.authorFollowers} người theo dõi · {TUTORIAL.authorTutorials} bài</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Link href={`/kenh/quangminh_origami`} className="btn btn-outline" style={{ flex: 1, textDecoration: "none", justifyContent: "center", padding: "0.5rem" }}>Xem kênh</Link>
                  <button className="btn btn-primary" style={{ flex: 1, padding: "0.5rem" }}>Theo dõi</button>
                </div>
              </div>

              {/* VIP Plans */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "2px solid var(--color-accent)", padding: "1.5rem", boxShadow: "var(--shadow-md)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                  <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Chọn gói VIP</h2>
                </div>

                {/* Features */}
                <div style={{ marginBottom: "1.25rem" }}>
                  {TUTORIAL.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.375rem 0", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                      {f}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {TUTORIAL.vipPlans.map((plan, i) => (
                    <div key={plan.name} style={{ border: `2px solid ${i === 1 ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: "var(--radius-lg)", padding: "1rem 1.125rem", cursor: "pointer", background: i === 1 ? "rgba(212,113,59,0.04)" : "transparent", position: "relative" }}>
                      {plan.tag && (
                        <div style={{ position: "absolute", top: "-0.625rem", right: "1rem", background: i === 1 ? "var(--color-accent)" : "var(--color-primary)", color: "white", fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.625rem", borderRadius: "var(--radius-full)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {plan.tag}
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{plan.name}</p>
                          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{plan.tutorials} bài hướng dẫn</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 800, fontSize: "1.25rem", color: i === 1 ? "var(--color-accent)" : "var(--color-primary)" }}>{plan.price}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>/{plan.period}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-accent" style={{ width: "100%", justifyContent: "center", padding: "0.875rem", marginTop: "1.125rem", fontSize: "1rem" }}>
                  🔓 Đăng ký VIP ngay
                </button>

                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
                  Hủy bất cứ lúc nào · Thanh toán an toàn
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside, [style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </>
  );
}
