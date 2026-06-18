"use client";

import {
  Users,
  BookOpen,
  Flag,
  ShieldAlert,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const STATS = [
  {
    label: "Tổng người dùng",
    value: "52,480",
    change: "+124 hôm nay",
    icon: Users,
    color: "text-[#2C7DA0]",
    bg: "bg-[#2C7DA0]/10",
    link: "/admin/users",
  },
  {
    label: "Bài chờ duyệt",
    value: "8",
    change: "Cần xử lý",
    icon: BookOpen,
    color: "text-[#2D6A4F]",
    bg: "bg-[#2D6A4F]/10",
    link: "/admin/tutorials",
  },
  {
    label: "Báo cáo vi phạm",
    value: "14",
    change: "Chưa giải quyết",
    icon: Flag,
    color: "text-red-500",
    bg: "bg-red-50",
    link: "/admin/reports",
  },
  {
    label: "Từ khóa cấm",
    value: "312",
    change: "Đang hoạt động",
    icon: ShieldAlert,
    color: "text-[#d4713b]",
    bg: "bg-[#d4713b]/10",
    link: "/admin/settings",
  },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* HEADER */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-50 via-teal-50/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-80 pointer-events-none blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
            <span>✦</span> Chào mừng trở lại
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Tổng quan Hệ thống
          </h1>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              href={stat.link}
              key={stat.label}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 block hover:-translate-y-1 hover:shadow-md hover:border-emerald-200 transition-all text-decoration-none group"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} />
                </div>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-medium border border-slate-100">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 leading-none mb-2">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* BỐ CỤC 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ giả lập */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Hoạt động hệ thống
            </h3>
          </div>
          <div className="flex-1 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400 min-h-[300px]">
            <Activity className="w-10 h-10 mb-3 opacity-20" />
            <span className="font-medium text-sm">
              Biểu đồ đang được cập nhật
            </span>
          </div>
        </div>

        {/* Lối tắt truy cập */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Truy cập nhanh
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/tutorials"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all text-slate-700 text-decoration-none group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-emerald-600" />
                <span className="font-semibold text-sm">Duyệt bài viết</span>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
              />
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-slate-700 text-decoration-none group"
            >
              <div className="flex items-center gap-3">
                <Flag size={18} className="text-red-500" />
                <span className="font-semibold text-sm">Xử lý báo cáo</span>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all"
              />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all text-slate-700 text-decoration-none group"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-amber-500" />
                <span className="font-semibold text-sm">Từ khóa vi phạm</span>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
