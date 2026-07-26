"use client";

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  Wallet,
  Percent,
  HandCoins,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import type { AdminTransactionDto, TransactionStatusFilter } from "@/lib/api/subscriptions";
import { getToken } from "@/lib/auth";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_FILTERS: { key: TransactionStatusFilter | "All"; label: string }[] = [
  { key: "All", label: "Tất cả" },
  { key: "PendingConfirmation", label: "Chờ xác nhận" },
  { key: "Confirmed", label: "Đã xác nhận" },
  { key: "Rejected", label: "Đã từ chối" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PendingConfirmation: { label: "Chờ xác nhận", className: "badge-warning" },
  Confirmed: { label: "Đã xác nhận", className: "badge-success" },
  Rejected: { label: "Đã từ chối", className: "badge-danger" },
};

const STAT_COLORS = [
  { bg: "#10b98122", color: "#10b981" },
  { bg: "#f59e0b22", color: "#f59e0b" },
  { bg: "#0ea5e922", color: "#0ea5e9" },
  { bg: "#3b82f622", color: "#3b82f6" },
];

export default function AdminRevenuePage() {
  const qc = useQueryClient();
  const token = getToken() ?? "";
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter | "All">("PendingConfirmation");
  const [page, setPage] = useState(1);

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["admin-platform-revenue"],
    queryFn: () => subscriptionsApi.getPlatformRevenue(token),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-transactions", statusFilter, page],
    queryFn: () =>
      subscriptionsApi.getAllTransactions(token, {
        status: statusFilter === "All" ? undefined : statusFilter,
        page,
        pageSize: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const confirmMut = useMutation({
    mutationFn: (transactionId: string) => subscriptionsApi.confirmPayment(token, transactionId),
    onSuccess: () => {
      toast.success("Đã xác nhận thanh toán — VIP đã được kích hoạt cho người dùng.");
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      qc.invalidateQueries({ queryKey: ["admin-platform-revenue"] });
    },
    onError: (error: unknown) => toast.error((error as { message?: string }).message || "Lỗi khi xác nhận giao dịch"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) =>
      subscriptionsApi.rejectPayment(token, id, adminNote),
    onSuccess: () => {
      toast.success("Đã từ chối giao dịch.");
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      qc.invalidateQueries({ queryKey: ["admin-platform-revenue"] });
    },
    onError: (error: unknown) => toast.error((error as { message?: string }).message || "Lỗi khi từ chối giao dịch"),
  });

  const isMutating = confirmMut.isPending || rejectMut.isPending;

  function handleReject(id: string) {
    const reason = prompt("Nhập lý do từ chối giao dịch (tối thiểu 5 ký tự):");
    if (!reason) return;
    if (reason.trim().length < 5) {
      toast.error("Lý do quá ngắn hoặc không hợp lệ!");
      return;
    }
    rejectMut.mutate({ id, adminNote: reason.trim() });
  }

  const stats = [
    { label: "Tổng doanh thu (GMV)", value: formatCurrency(revenue?.totalGrossRevenue ?? 0), icon: Wallet },
    { label: "Hoa hồng đã thu (10%)", value: formatCurrency(revenue?.totalCommissionCollected ?? 0), icon: Percent },
    { label: "Đã trả cho creator", value: formatCurrency(revenue?.totalNetPaidToCreators ?? 0), icon: HandCoins },
    { label: "Đăng ký đang hoạt động", value: (revenue?.activeSubscriptionCount ?? 0).toLocaleString(), icon: Users },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Doanh thu &amp; Hoa hồng VIP</h1>
        <p className="admin-page-desc">
          Theo dõi doanh thu VIP toàn nền tảng và xác nhận/từ chối các giao dịch chuyển khoản thủ công.
        </p>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colors = STAT_COLORS[idx];
          return (
            <div key={stat.label} className="card admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">{stat.label}</span>
                <div className="admin-stat-icon" style={{ background: colors.bg, color: colors.color }}>
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="admin-stat-value">{revenueLoading ? "…" : stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-toolbar">
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.0625rem" }}>Giao dịch VIP</h2>
          <p className="admin-page-desc">Xác nhận thanh toán thủ công sau khi kiểm tra mã chuyển khoản.</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
              className={`btn btn-sm ${statusFilter === f.key ? "btn-primary" : "btn-outline"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người mua</th>
                <th>Creator</th>
                <th>Số tiền</th>
                <th>Hoa hồng / Creator nhận</th>
                <th>Mã giao dịch</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="admin-table-loading">
                    <Loader2 className="animate-spin" size={28} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Đang nạp dữ liệu...</p>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    <Receipt size={32} style={{ margin: "0 auto 0.5rem" }} />
                    <p>Không có giao dịch nào</p>
                  </td>
                </tr>
              ) : (
                data?.items.map((tx: AdminTransactionDto) => {
                  const sm = STATUS_BADGE[tx.status] ?? { label: tx.status, className: "badge-neutral" };
                  return (
                    <tr key={tx.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">{tx.subscriberDisplayName.charAt(0).toUpperCase()}</div>
                          <p className="admin-user-name">{tx.subscriberDisplayName}</p>
                        </div>
                      </td>
                      <td>{tx.creatorDisplayName ?? "—"}</td>
                      <td>{formatCurrency(tx.amount)}</td>
                      <td style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        {formatCurrency(tx.platformFeeAmount)} / {formatCurrency(tx.creatorNetAmount)}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{tx.referenceCode ?? "—"}</td>
                      <td><span className={`badge ${sm.className}`}>{sm.label}</span></td>
                      <td>{format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}</td>
                      <td>
                        {tx.status === "PendingConfirmation" ? (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => confirmMut.mutate(tx.id)}
                              disabled={isMutating}
                              className="admin-icon-action admin-icon-action-success"
                              title="Xác nhận thanh toán"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(tx.id)}
                              disabled={isMutating}
                              className="admin-icon-action admin-icon-action-danger"
                              title="Từ chối thanh toán"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                            {tx.adminNote ?? "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination-info">
              Trang {data.page} / {data.totalPages}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-outline btn-sm" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trang trước
              </button>
              <button
                className="btn btn-outline btn-sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
