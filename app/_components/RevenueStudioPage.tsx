"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import type { CreatorRevenueDto, SubscriptionDto } from "@/lib/api/subscriptions";
import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffD = Math.floor(diffMs / 86400000);
  if (diffD < 1) return "Hôm nay";
  if (diffD < 7) return `${diffD} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function RevenueStudioPage() {
  const router = useRouter();
  const [revenue, setRevenue] = useState<CreatorRevenueDto | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) { router.push("/dang-nhap"); return; }

    (async () => {
      try {
        setLoading(true);
        const [rev, subs] = await Promise.all([
          subscriptionsApi.getCreatorRevenue(token, user.userId),
          subscriptionsApi.getMySubscriptions(token, { pageSize: 20 }),
        ]);
        setRevenue(rev);
        setSubscriptions(subs.items);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr.message ?? "Không thể tải dữ liệu doanh thu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

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

          {/* Revenue stats */}
          {!loading && !error && revenue && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
                {/* Total Revenue */}
                <div style={{ background: "linear-gradient(135deg, #2D6A4F, #40916C)", borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginBottom: "0.5rem", fontWeight: 500 }}>Tổng doanh thu</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{formatCurrency(revenue.totalRevenue)}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Tất cả thời gian</div>
                </div>

                {/* Active Subscribers */}
                <div style={{ background: "linear-gradient(135deg, #D4713B, #F4A261)", borderRadius: "var(--radius-xl)", padding: "1.5rem", color: "white", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.8, marginBottom: "0.5rem", fontWeight: 500 }}>Người đăng ký VIP</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>{revenue.activeSubscribers}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>Đang hoạt động</div>
                </div>

                {/* Pending */}
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", fontWeight: 500 }}>Chờ xác nhận</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#D97706", marginBottom: "0.25rem" }}>{revenue.pendingSubscribers}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Đơn đăng ký chờ duyệt</div>
                </div>
              </div>

              {/* Monthly Data Chart (simple bar chart) */}
              {revenue.monthlyData && revenue.monthlyData.length > 0 && (
                <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", marginBottom: "2rem", boxShadow: "var(--shadow-sm)" }}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "1.5rem" }}>📊 Doanh thu theo tháng</h2>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", height: "180px", overflowX: "auto" }}>
                    {revenue.monthlyData.map(m => {
                      const maxRev = Math.max(...revenue.monthlyData!.map(x => x.revenue));
                      const heightPct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                      return (
                        <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: "0 0 auto", minWidth: "60px" }}>
                          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 600 }}>{formatCurrency(m.revenue)}</div>
                          <div style={{ width: "40px", height: `${Math.max(heightPct, 4)}%`, background: "var(--gradient-primary)", borderRadius: "4px 4px 0 0", minHeight: "4px", transition: "height 0.3s ease" }} />
                          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", textAlign: "center" }}>
                            {m.month.substring(5)}/{m.month.substring(2, 4)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subscriptions table */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>📋 Lịch sử đăng ký</h2>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{subscriptions.length} đơn</span>
                </div>

                {subscriptions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>💳</div>
                    <p style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Chưa có đơn đăng ký nào</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Người dùng đăng ký VIP của bạn sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  <>
                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: "1rem", padding: "0.75rem 1.5rem", background: "var(--color-surface-2)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      <span>Người đăng ký</span>
                      <span>Ngày</span>
                      <span>Trạng thái</span>
                      <span>Mã TK</span>
                    </div>
                    {subscriptions.map((sub, i) => {
                      const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
                        Active:   { label: "Hoạt động", color: "#059669", bg: "#D1FAE5" },
                        Pending:  { label: "Chờ duyệt", color: "#D97706", bg: "#FEF3C7" },
                        Expired:  { label: "Hết hạn",   color: "#6B7280", bg: "#F3F4F6" },
                        Rejected: { label: "Từ chối",   color: "#DC2626", bg: "#FEE2E2" },
                      };
                      const sm = statusMeta[sub.status] ?? statusMeta["Pending"];
                      return (
                        <div key={sub.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", gap: "1rem", padding: "1rem 1.5rem", borderTop: i === 0 ? "1px solid var(--color-border)" : "none", borderBottom: i < subscriptions.length - 1 ? "1px solid var(--color-border)" : "none", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {sub.creatorAvatarUrl ? (
                              <img src={sub.creatorAvatarUrl} alt={sub.creatorName}
                                style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                                {(sub.creatorName ?? "U").charAt(0)}
                              </div>
                            )}
                            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{sub.creatorName ?? "Người dùng"}</span>
                          </div>
                          <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{getRelativeTime(sub.createdAt)}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: sm.bg, color: sm.color, fontSize: "0.8125rem", fontWeight: 600, width: "fit-content" }}>
                            {sm.label}
                          </span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                            {sub.referenceCode ?? "—"}
                          </span>
                        </div>
                      );
                    })}
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
          [style*="grid-template-columns: 1fr 1fr 120px 100px"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
