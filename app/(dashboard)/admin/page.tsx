"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Flag,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  LucideIcon,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/admin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

// --- MOCK DATA BIỂU ĐỒ ---
const trafficData = [
  { name: "T2", visitors: 1240 },
  { name: "T3", visitors: 1850 },
  { name: "T4", visitors: 1640 },
  { name: "T5", visitors: 2430 },
  { name: "T6", visitors: 2980 },
  { name: "T7", visitors: 3800 },
  { name: "CN", visitors: 3200 },
];

type ChangeType = "positive" | "warning" | "danger" | "neutral" | "disabled";

interface StatItem {
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: LucideIcon;
  link: string;
  waveColor: string;
  iconBg: string;
  iconColor: string;
}

const INITIAL_STATS: StatItem[] = [
  {
    label: "Tổng người dùng",
    value: "...",
    change: "Đang tải",
    changeType: "neutral",
    icon: Users,
    link: "/admin/users",
    waveColor: "#10b981",
    iconBg: "bg-[#10b981]/10",
    iconColor: "text-[#10b981]",
  },
  {
    label: "Bài chờ duyệt",
    value: "...",
    change: "Đang tải",
    changeType: "neutral",
    icon: BookOpen,
    link: "/admin/tutorials",
    waveColor: "#0ea5e9",
    iconBg: "bg-[#0ea5e9]/10",
    iconColor: "text-[#0ea5e9]",
  },
  {
    label: "Báo cáo vi phạm",
    value: "...",
    change: "Đang tải",
    changeType: "neutral",
    icon: Flag,
    link: "/admin/reports",
    waveColor: "#3b82f6",
    iconBg: "bg-[#3b82f6]/10",
    iconColor: "text-[#3b82f6]",
  },
  {
    label: "Từ khóa cấm",
    value: "...",
    change: "Đang tải",
    changeType: "neutral",
    icon: ShieldAlert,
    link: "/admin/settings",
    waveColor: "#f59e0b",
    iconBg: "bg-[#f59e0b]/10",
    iconColor: "text-[#f59e0b]",
  },
];

export default function DashboardHomePage() {
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [activeTab, setActiveTab] = useState("Lưu lượng");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch dữ liệu song song để tối ưu tốc độ
        const [usersResult, tutorialsResult, reportsResult, keywordsResult] =
          await Promise.allSettled([
            adminApi.getUsers({ page: 1, pageSize: 1 }),
            adminApi.getContributorQueue({ page: 1, pageSize: 1 }),
            adminApi.getPendingReports(),
            adminApi.getBlockedWords(),
          ]);

        const usersRes =
          usersResult.status === "fulfilled" ? usersResult.value : null;
        const tutorialsRes =
          tutorialsResult.status === "fulfilled" ? tutorialsResult.value : null;
        const reportsRes =
          reportsResult.status === "fulfilled" ? reportsResult.value : null;
        const keywordsRes =
          keywordsResult.status === "fulfilled" ? keywordsResult.value : null;

        setStats([
          {
            label: "Tổng người dùng",
            value: usersRes?.totalCount?.toLocaleString() || "0",
            change:
              usersResult.status === "fulfilled" ? "Cập nhật mới" : "Lỗi tải",
            changeType:
              usersResult.status === "fulfilled" ? "positive" : "disabled",
            icon: Users,
            link: "/admin/users",
            waveColor: "#10b981",
            iconBg: "bg-[#10b981]/10",
            iconColor: "text-[#10b981]",
          },
          {
            label: "Bài chờ duyệt",
            value: tutorialsRes?.totalCount?.toString() || "0",
            change:
              tutorialsResult.status === "rejected"
                ? "Lỗi tải"
                : (tutorialsRes?.totalCount || 0) > 0
                  ? "Cần xử lý"
                  : "Đã xong",
            changeType:
              tutorialsResult.status === "rejected"
                ? "disabled"
                : (tutorialsRes?.totalCount || 0) > 0
                  ? "warning"
                  : "positive",
            icon: BookOpen,
            link: "/admin/tutorials",
            waveColor: "#0ea5e9",
            iconBg: "bg-[#0ea5e9]/10",
            iconColor: "text-[#0ea5e9]",
          },
          {
            label: "Báo cáo vi phạm",
            value: (reportsRes?.length || 0).toString(),
            change:
              reportsResult.status === "rejected"
                ? "Lỗi tải"
                : (reportsRes?.length || 0) > 0
                  ? "Chưa giải quyết"
                  : "Tuyệt vời",
            changeType:
              reportsResult.status === "rejected"
                ? "disabled"
                : (reportsRes?.length || 0) > 0
                  ? "danger"
                  : "positive",
            icon: Flag,
            link: "/admin/reports",
            waveColor: "#3b82f6",
            iconBg: "bg-[#3b82f6]/10",
            iconColor: "text-[#3b82f6]",
          },
          {
            label: "Từ khóa cấm",
            value: (keywordsRes?.length || 0).toString(),
            change:
              keywordsResult.status === "rejected"
                ? "Lỗi tải"
                : "Đang hoạt động",
            changeType:
              keywordsResult.status === "rejected" ? "disabled" : "neutral",
            icon: ShieldAlert,
            link: "/admin/settings",
            waveColor: "#f59e0b",
            iconBg: "bg-[#f59e0b]/10",
            iconColor: "text-[#f59e0b]",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }

    fetchStats();
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-[#10b981]/10 text-emerald-600 dark:text-[#10b981] rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-emerald-100 dark:border-[#10b981]/20">
          <span>✦</span> Chào mừng trở lại
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Tổng quan Hệ thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Theo dõi các chỉ số quan trọng và tình trạng hoạt động của nền tảng
          OriGami.
        </p>
      </div>

      {/* KPI CARDS VỚI SPARKLINE SVG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive =
            stat.changeType === "positive" || stat.changeType === "neutral";

          return (
            <Link
              key={idx}
              href={stat.link}
              className="bg-white dark:bg-[#131722] rounded-2xl p-5 border border-slate-200 dark:border-white/5 relative overflow-hidden hover:border-slate-300 dark:hover:border-white/10 shadow-sm transition-all text-decoration-none group flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex justify-between items-start z-10">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div
                  className={`p-2 rounded-xl ${stat.iconBg} ${stat.iconColor} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
              </div>

              <div className="mt-2 z-10">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={`flex items-center gap-1 ${isPositive ? "text-[#10b981]" : "text-rose-500"}`}
                  >
                    {isPositive ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {stat.change}
                  </span>
                </div>
              </div>

              {/* Đường lượn sóng trang trí đáy Card */}
              <div className="absolute bottom-0 left-0 right-0 h-12 opacity-50 pointer-events-none">
                <svg
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <path
                    d="M0,10 C20,20 40,0 60,10 C80,20 100,0 100,0 L100,20 L0,20 Z"
                    fill={`url(#grad-${idx})`}
                    stroke={stat.waveColor}
                    strokeWidth="0.5"
                  />
                  <defs>
                    <linearGradient
                      id={`grad-${idx}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={stat.waveColor}
                        stopOpacity={isDark ? "0.2" : "0.1"}
                      />
                      <stop
                        offset="100%"
                        stopColor={stat.waveColor}
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* BỐ CỤC 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* KHU VỰC BIỂU ĐỒ RECHARTS (Chiếm 2 cột) */}
        <div className="bg-white dark:bg-[#131722] p-6 rounded-2xl border border-slate-200 dark:border-white/5 lg:col-span-2 flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-[#10b981]/10 text-emerald-600 dark:text-[#10b981] rounded-xl flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Hoạt động hệ thống
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Lưu lượng truy cập 7 ngày qua
                </p>
              </div>
            </div>

            {/* Tabs giả lập */}
            <div className="flex items-center bg-slate-50 dark:bg-[#0b0f19] p-1 rounded-xl border border-slate-100 dark:border-white/5">
              {["Lưu lượng", "Tương tác"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? "bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trafficData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke={isDark ? "#1f2937" : "#f1f5f9"}
                  opacity={isDark ? 0.5 : 1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    borderRadius: "12px",
                    border: isDark
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#10b981", fontWeight: 600 }}
                  cursor={{
                    stroke: isDark ? "#334155" : "#cbd5e1",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name={activeTab}
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMain)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LỐI TẮT TRUY CẬP */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#131722] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Truy cập nhanh
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Các tác vụ quản lý thường dùng
            </p>

            <div className="space-y-3">
              {[
                {
                  href: "/admin/tutorials",
                  text: "Duyệt bài viết mới",
                  color: "text-emerald-600 dark:text-[#10b981]",
                  bg: "bg-emerald-50 dark:bg-[#10b981]/10",
                  icon: BookOpen,
                },
                {
                  href: "/admin/reports",
                  text: "Xử lý khiếu nại",
                  color: "text-red-500 dark:text-rose-500",
                  bg: "bg-red-50 dark:bg-rose-500/10",
                  icon: Flag,
                },
                {
                  href: "/admin/settings",
                  text: "Từ khóa vi phạm",
                  color: "text-amber-500 dark:text-[#f59e0b]",
                  bg: "bg-amber-50 dark:bg-[#f59e0b]/10",
                  icon: ShieldAlert,
                },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:bg-slate-100 dark:hover:bg-[#1f2937] border border-transparent dark:border-white/5 transition-all group"
                >
                  <div
                    className={`p-2 rounded-lg ${link.bg} ${link.color} mr-3`}
                  >
                    <link.icon size={16} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {link.text}
                  </span>
                  <ArrowRight
                    size={16}
                    className="ml-auto text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-white transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
