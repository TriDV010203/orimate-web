"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import type { CreatorRevenueDto, VipTierDto } from "@/lib/api/subscriptions";
import { tutorialsApi } from "@/lib/api/tutorials";
import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

const MIN_PUBLISHED_TUTORIALS_FOR_VIP = 5;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export default function RevenueStudioPage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState<CreatorRevenueDto | null>(null);
  const [vipTier, setVipTier] = useState<VipTierDto | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [togglingVip, setTogglingVip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) { router.push("/dang-nhap"); return; }

    (async () => {
      try {
        setLoading(true);
        const [rev, tier, myTutorials] = await Promise.all([
          subscriptionsApi.getCreatorRevenue(token, user.userId),
          subscriptionsApi.getMyVipTier(token),
          tutorialsApi.getMyTutorials(token, { page: 1, pageSize: 100 }),
        ]);
        setRevenue(rev);
        setVipTier(tier);
        setPublishedCount(myTutorials.items.filter(t => t.status === "Published").length);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr.message ?? "Không thể tải dữ liệu doanh thu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const canEnableVip = publishedCount >= MIN_PUBLISHED_TUTORIALS_FOR_VIP;

  async function handleToggleVip() {
    const token = getToken();
    if (!token || !vipTier) return;
    if (!vipTier.isActive && !canEnableVip) return;
    setTogglingVip(true);
    try {
      const updated = await subscriptionsApi.configureVipTier(token, !vipTier.isActive);
      setVipTier(updated);
    } catch {
      // ignore — UI stays on previous state
    } finally {
      setTogglingVip(false);
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div className="container">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                <Link href="/studio" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Creator Studio</Link>
                <span>/</span>
                <span style={{ color: "var(--color-text-primary)" }}>Doanh thu</span>
              </nav>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(212,113,59,0.08)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600 }}>💰 Doanh thu Creator</span>
              </div>
              <h1 className="text-heading" style={{ fontSize: "1.875rem", color: "var(--color-text-primary)" }}>Thống kê doanh thu</h1>
            </div>
            <Link href="/studio" className="btn btn-outline" style={{ textDecoration: "none" }}>
              ← Quay lại Studio
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div style={{ textAlign: "center", padding: "3rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", height: "120px", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          )}

          {!loading && !error && revenue && vipTier && (
            <>
              {/* VIP selling toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                    Bán VIP · Giá cố định {formatCurrency(50000)} / 30 ngày
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                    Nền tảng giữ lại hoa hồng 10% trên mỗi giao dịch VIP được xác nhận.
                  </p>
                  {!vipTier.isActive && !canEnableVip && (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-warning, #B45309)", marginTop: "0.5rem", fontWeight: 600 }}>
                      ⚠️ Cần có ít nhất {MIN_PUBLISHED_TUTORIALS_FOR_VIP} bài hướng dẫn đã xuất bản để bật bán VIP (hiện có {publishedCount}).
                    </p>
                  )}
                </div>
                <button
                  onClick={handleToggleVip}
                  disabled={togglingVip || (!vipTier.isActive && !canEnableVip)}
                  className={vipTier.isActive ? "btn btn-primary" : "btn btn-outline"}
                  title={!vipTier.isActive && !canEnableVip ? `Cần ít nhất ${MIN_PUBLISHED_TUTORIALS_FOR_VIP} bài hướng dẫn đã xuất bản` : undefined}
                  style={{ flexShrink: 0, opacity: togglingVip || (!vipTier.isActive && !canEnableVip) ? 0.5 : 1, cursor: !vipTier.isActive && !canEnableVip ? "not-allowed" : "pointer" }}
                >
                  {vipTier.isActive ? "✓ Đang bật bán VIP" : "Bật bán VIP"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
                {/* Net revenue this month */}
                <div style={{ background: "linear-gradient(135deg, #2D6A4F, #40916C)", borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginBottom: "0.5rem", fontWeight: 500 }}>Doanh thu tháng này</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{formatCurrency(revenue.netRevenueThisMonth)}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Đã trừ 10% hoa hồng</div>
                </div>

                {/* All-time revenue */}
                <div style={{ background: "linear-gradient(135deg, #D4713B, #F4A261)", borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginBottom: "0.5rem", fontWeight: 500 }}>Tổng doanh thu</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{formatCurrency(revenue.netRevenueAllTime)}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tất cả thời gian</div>
                </div>

                {/* Active + pending */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Người đăng ký VIP</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>{revenue.activeSubscriberCount}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Đang hoạt động {revenue.pendingCount > 0 && `· ${revenue.pendingCount} chờ xác nhận`}
                  </div>
                </div>
              </div>

              {/* Active subscribers table */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>👥 Người đang đăng ký VIP của bạn</h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{revenue.subscribers.length} người</span>
                </div>

                {revenue.subscribers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💳</div>
                    <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Chưa có ai đăng ký VIP của bạn</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Người đăng ký VIP sẽ xuất hiện ở đây cùng thời gian còn lại</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px", gap: "1rem", padding: "0.75rem 1.5rem", background: "var(--color-surface-2)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      <span>Người đăng ký</span>
                      <span>Ngày bắt đầu</span>
                      <span>Còn lại</span>
                    </div>
                    {revenue.subscribers.map((sub, i) => (
                      <div key={sub.subscriberId} style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px", gap: "1rem", padding: "1rem 1.5rem", borderTop: i === 0 ? "1px solid var(--color-border)" : "none", borderBottom: i < revenue.subscribers.length - 1 ? "1px solid var(--color-border)" : "none", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {sub.avatarUrl ? (
                            <img src={sub.avatarUrl} alt={sub.displayName}
                              style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                              {sub.displayName.charAt(0)}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{sub.displayName}</span>
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{new Date(sub.startDate).toLocaleDateString("vi-VN")}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: sub.daysRemaining <= 3 ? "#FEF3C7" : "#D1FAE5", color: sub.daysRemaining <= 3 ? "#92400E" : "#065F46", fontSize: "0.8125rem", fontWeight: 600, width: "fit-content" }}>
                          {sub.daysRemaining} ngày
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: 1fr 140px 160px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
