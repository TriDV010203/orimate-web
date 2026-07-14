"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { usersApi } from "@/lib/api/users";
import type { CreatorProfileDto } from "@/lib/api/users";
import { getToken, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface VIPSubscribePageProps {
  tutorialSlug: string;
  tutorialTitle: string;
  tutorialCover?: string | null;
  authorId: string;
  authorName: string;
}

export default function VIPSubscribePage({
  tutorialSlug,
  tutorialTitle,
  tutorialCover,
  authorId,
  authorName,
}: VIPSubscribePageProps) {
  const router = useRouter();
  const [loggedIn] = useState(() => isLoggedIn());
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfileDto | null>(null);
  const [mySubscriptions, setMySubscriptions] = useState<string[]>([]); // creatorIds I already subscribe to
  const [referenceCode, setReferenceCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const token = getToken();
    usersApi.getProfile(authorId, token ?? undefined)
      .then(p => setCreatorProfile(p))
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    if (token) {
      subscriptionsApi.getMySubscriptions(token)
        .then(result => {
          const ids = result.items
            .filter(s => s.status === "Active")
            .map(s => s.creatorId);
          setMySubscriptions(ids);
        })
        .catch(() => {});
    }
  }, [authorId]);

  const alreadySubscribed = mySubscriptions.includes(authorId);

  async function handleSubscribe() {
    if (!loggedIn) {
      router.push("/dang-nhap");
      return;
    }
    if (!referenceCode.trim()) {
      setError("Vui lòng nhập mã chuyển khoản (Reference Code) để xác nhận thanh toán.");
      return;
    }
    const token = getToken()!;
    setSubmitting(true);
    setError(null);
    try {
      await subscriptionsApi.subscribe(token, authorId, referenceCode.trim());
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "Không thể đăng ký VIP. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const price = 50000; // VND — will come from creator's VIP tier config

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingBottom: "4rem" }}>

        {/* VIP Banner */}
        <div style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #D4713B 100%)", padding: "0.875rem 0", textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "0.9375rem", fontWeight: 500 }}>
            🔒 Nội dung VIP — Đăng ký để xem đầy đủ tất cả các bước
          </p>
        </div>

        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2.5rem", alignItems: "start" }}>

            {/* Left: Tutorial info */}
            <div>
              <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Trang chủ</Link>
                <span>/</span>
                <Link href="/huong-dan" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Thư viện</Link>
                <span>/</span>
                <Link href={`/huong-dan/${tutorialSlug}`} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{tutorialTitle}</Link>
                <span>/</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>VIP</span>
              </nav>

              {/* Cover */}
              <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", background: "var(--color-surface-2)", aspectRatio: "16/9", marginBottom: "1.5rem", position: "relative", border: "1px solid var(--color-border)" }}>
                {tutorialCover ? (
                  <img src={tutorialCover} alt={tutorialTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>📄</div>
                )}
                <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
                  <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>VIP</span>
                  <span style={{ background: "rgba(0,0,0,0.5)", color: "white", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>🔒 Khóa</span>
                </div>
              </div>

              <h1 className="text-heading" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
                {tutorialTitle}
              </h1>

              {/* Author */}
              {!loadingProfile && creatorProfile && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                  <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.125rem", flexShrink: 0 }}>
                    {authorName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{authorName}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                      {creatorProfile.followerCount.toLocaleString()} người theo dõi
                    </p>
                  </div>
                  <Link href={`/nguoi-dung/${authorId}`} className="btn btn-outline" style={{ textDecoration: "none", fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
                    Xem kênh
                  </Link>
                </div>
              )}

              {/* What you get */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                  Bạn sẽ nhận được gì?
                </h2>
                {[
                  "Toàn bộ các bước hướng dẫn chi tiết",
                  "Ảnh minh họa HD cho từng bước",
                  "Hỗ trợ từ creator qua bình luận",
                  "Không giới hạn lượt xem lại",
                  "Theo dõi tiến độ và lưu thành tựu",
                ].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Subscribe form */}
            <div style={{ position: "sticky", top: "5rem" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "2px solid var(--color-accent)", padding: "1.75rem", boxShadow: "var(--shadow-md)" }}>

                {success ? (
                  <div style={{ textAlign: "center", padding: "1rem 0" }}>
                    <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Đã gửi yêu cầu đăng ký!</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                      Yêu cầu đăng ký VIP của bạn đang chờ admin xác nhận. Bạn sẽ nhận được thông báo khi được duyệt.
                    </p>
                    <Link href={`/huong-dan/${tutorialSlug}`} className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                      ← Quay lại bài hướng dẫn
                    </Link>
                  </div>
                ) : alreadySubscribed ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#059669", marginBottom: "0.5rem" }}>Bạn đã đăng ký VIP!</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
                      Bạn đã đăng ký kênh VIP của creator này. Quay lại để xem toàn bộ bài hướng dẫn.
                    </p>
                    <Link href={`/huong-dan/${tutorialSlug}`} className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", width: "100%", justifyContent: "center" }}>
                      Xem bài hướng dẫn →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      </div>
                      <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>Đăng ký VIP</h2>
                    </div>

                    {/* Price */}
                    <div style={{ background: "rgba(212,113,59,0.06)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1.25rem", textAlign: "center", border: "1.5px solid rgba(212,113,59,0.2)" }}>
                      <p style={{ fontSize: "2.25rem", fontWeight: 900, color: "var(--color-accent)" }}>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>/ tháng · Hủy bất cứ lúc nào</p>
                    </div>

                    {/* Payment instruction */}
                    <div style={{ background: "#F0F9FF", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.25rem", border: "1.5px solid #BAE6FD" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0369A1", marginBottom: "0.5rem" }}>💳 Hướng dẫn thanh toán:</p>
                      <ol style={{ margin: 0, padding: "0 0 0 1.25rem", fontSize: "0.8125rem", color: "#0C4A6E", lineHeight: 1.7 }}>
                        <li>Chuyển khoản đến tài khoản: <strong>MB Bank - 1234567890</strong></li>
                        <li>Nội dung: <strong>VIP {authorId.slice(0, 8).toUpperCase()}</strong></li>
                        <li>Nhập mã giao dịch vào ô bên dưới</li>
                      </ol>
                    </div>

                    {/* Reference code input */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                        Mã giao dịch (Reference Code) *
                      </label>
                      <input
                        type="text"
                        value={referenceCode}
                        onChange={e => setReferenceCode(e.target.value)}
                        placeholder="Nhập mã giao dịch ngân hàng..."
                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: "0.9rem", boxSizing: "border-box", outline: "none", fontFamily: "monospace" }}
                        onFocus={e => (e.target.style.borderColor = "var(--color-accent)")}
                        onBlur={e => (e.target.style.borderColor = "var(--color-border)")}
                      />
                    </div>

                    {error && (
                      <p style={{ fontSize: "0.875rem", color: "#DC2626", background: "#FEE2E2", padding: "0.625rem 1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>{error}</p>
                    )}

                    {loggedIn ? (
                      <button onClick={handleSubscribe} disabled={submitting} className="btn btn-accent"
                        style={{ width: "100%", justifyContent: "center", padding: "0.875rem", fontSize: "1rem", opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? "Đang gửi…" : "🔓 Gửi yêu cầu đăng ký VIP"}
                      </button>
                    ) : (
                      <Link href="/dang-nhap" className="btn btn-accent" style={{ textDecoration: "none", display: "flex", justifyContent: "center", width: "100%", padding: "0.875rem", fontSize: "1rem" }}>
                        Đăng nhập để đăng ký VIP
                      </Link>
                    )}

                    <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.875rem" }}>
                      Yêu cầu sẽ được admin xác nhận trong 24 giờ
                    </p>
                  </>
                )}
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
