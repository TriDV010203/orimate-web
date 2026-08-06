"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Flag,
  ShieldAlert,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import { getUser } from "@/lib/auth";

type ChangeType = "positive" | "warning" | "danger" | "neutral";

interface StatItem {
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: LucideIcon;
  link: string;
  bg: string;
  color: string;
}

const INITIAL_STATS: StatItem[] = [
  { label: "Tổng người dùng", value: "...", change: "Đang tải", changeType: "neutral", icon: Users, link: "/admin/users", bg: "#10b98122", color: "#10b981" },
  { label: "Bài chờ duyệt", value: "...", change: "Đang tải", changeType: "neutral", icon: BookOpen, link: "/admin/tutorials", bg: "#0ea5e922", color: "#0ea5e9" },
  { label: "Báo cáo vi phạm", value: "...", change: "Đang tải", changeType: "neutral", icon: Flag, link: "/admin/reports", bg: "#3b82f622", color: "#3b82f6" },
  { label: "Từ khóa cấm", value: "...", change: "Đang tải", changeType: "neutral", icon: ShieldAlert, link: "/admin/settings", bg: "#f59e0b22", color: "#f59e0b" },
];

// Manager không có quyền quản lý người dùng / cấu hình hệ thống nên 2 chỉ số này luôn lỗi tải với vai trò đó — ẩn đi thay vì hiển thị lỗi.
const ADMIN_ONLY_STATS = ["Tổng người dùng", "Từ khóa cấm"];

export default function AdminDashboardPage() {
  const isAdmin = getUser()?.roles?.includes("Admin") ?? false;
  const [stats, setStats] = useState<StatItem[]>(
    isAdmin ? INITIAL_STATS : INITIAL_STATS.filter((s) => !ADMIN_ONLY_STATS.includes(s.label))
  );

  useEffect(() => {
    async function fetchStats() {
      const [usersResult, queueResult, reportsResult, keywordsResult] =
        await Promise.allSettled([
          isAdmin ? adminApi.getUsers({ page: 1, pageSize: 1 }) : Promise.resolve(null),
          adminApi.getManagerQueue({ page: 1, pageSize: 1 }),
          adminApi.getPendingReports(),
          isAdmin ? adminApi.getBlockedWords() : Promise.resolve(null),
        ]);

      const usersRes = usersResult.status === "fulfilled" ? usersResult.value : null;
      const queueRes = queueResult.status === "fulfilled" ? queueResult.value : null;
      const reportsRes = reportsResult.status === "fulfilled" ? reportsResult.value : null;
      const keywordsRes = keywordsResult.status === "fulfilled" ? keywordsResult.value : null;

      const nextStats: StatItem[] = [
        {
          label: "Tổng người dùng",
          value: usersRes?.totalCount?.toLocaleString() ?? "0",
          change: usersResult.status === "fulfilled" ? "Cập nhật mới" : "Lỗi tải",
          changeType: usersResult.status === "fulfilled" ? "positive" : "danger",
          icon: Users,
          link: "/admin/users",
          bg: "#10b98122",
          color: "#10b981",
        },
        {
          label: "Bài chờ duyệt",
          value: queueRes?.totalCount?.toString() ?? "0",
          change:
            queueResult.status === "rejected"
              ? "Lỗi tải"
              : (queueRes?.totalCount ?? 0) > 0
                ? "Cần xử lý"
                : "Đã xong",
          changeType:
            queueResult.status === "rejected"
              ? "danger"
              : (queueRes?.totalCount ?? 0) > 0
                ? "warning"
                : "positive",
          icon: BookOpen,
          link: "/admin/tutorials",
          bg: "#0ea5e922",
          color: "#0ea5e9",
        },
        {
          label: "Báo cáo vi phạm",
          value: (reportsRes?.length ?? 0).toString(),
          change:
            reportsResult.status === "rejected"
              ? "Lỗi tải"
              : (reportsRes?.length ?? 0) > 0
                ? "Chưa giải quyết"
                : "Tuyệt vời",
          changeType:
            reportsResult.status === "rejected"
              ? "danger"
              : (reportsRes?.length ?? 0) > 0
                ? "danger"
                : "positive",
          icon: Flag,
          link: "/admin/reports",
          bg: "#3b82f622",
          color: "#3b82f6",
        },
        {
          label: "Từ khóa cấm",
          value: (keywordsRes?.length ?? 0).toString(),
          change: keywordsResult.status === "rejected" ? "Lỗi tải" : "Đang hoạt động",
          changeType: keywordsResult.status === "rejected" ? "danger" : "neutral",
          icon: ShieldAlert,
          link: "/admin/settings",
          bg: "#f59e0b22",
          color: "#f59e0b",
        },
      ];

      setStats(isAdmin ? nextStats : nextStats.filter((s) => !ADMIN_ONLY_STATS.includes(s.label)));
    }

    fetchStats();
  }, [isAdmin]);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tổng quan Hệ thống</h1>
        <p className="admin-page-desc">
          Theo dõi các chỉ số quan trọng và tình trạng hoạt động của nền tảng OriGami.
        </p>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const badgeVariant =
            stat.changeType === "positive"
              ? "badge-success"
              : stat.changeType === "warning"
                ? "badge-warning"
                : stat.changeType === "danger"
                  ? "badge-danger"
                  : "badge-neutral";

          return (
            <Link key={stat.label} href={stat.link} className="card admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">{stat.label}</span>
                <div
                  className="admin-stat-icon"
                  style={{ background: stat.bg, color: stat.color }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="admin-stat-value">{stat.value}</div>
              <span className={`badge ${badgeVariant}`}>{stat.change}</span>
            </Link>
          );
        })}
      </div>

      <div className="card admin-shortcuts" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Truy cập nhanh</h3>
        <p className="admin-page-desc" style={{ marginBottom: "1rem" }}>
          Các tác vụ quản lý thường dùng
        </p>

        {[
          { href: "/admin/tutorials", text: "Duyệt bài viết mới", icon: BookOpen },
          { href: "/admin/reports", text: "Xử lý khiếu nại", icon: Flag },
          ...(isAdmin ? [{ href: "/admin/settings", text: "Từ khóa vi phạm", icon: ShieldAlert }] : []),
        ].map((link) => (
          <Link key={link.href} href={link.href} className="admin-shortcut-item">
            <link.icon size={18} />
            <span style={{ flex: 1 }}>{link.text}</span>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
    </div>
  );
}
