"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Flag, Settings } from "lucide-react";

const navItems = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Duyệt bài viết", href: "/admin/tutorials", icon: BookOpen },
  { name: "Báo cáo vi phạm", href: "/admin/reports", icon: Flag },
  { name: "Cấu hình hệ thống", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[280px] flex-shrink-0 flex-col h-full bg-gradient-to-b from-[#0f2a1d] via-[#163828] to-[#1b4332] text-white shadow-[10px_0_40px_rgba(0,0,0,0.08)] relative z-50 overflow-hidden">
      {/* Hiệu ứng Glow */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* KHỐI LOGO (Viết thẳng inline) */}
      <div className="h-20 flex items-center px-8 relative z-10 border-b border-white/5">
        <Link
          href="/admin"
          className="flex items-center gap-3 text-decoration-none group"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:scale-110"
          >
            <path d="M2 20l10-16 10 16H2z" />
            <path d="M12 4L6 14h12L12 4z" />
          </svg>
          <span className="font-serif text-3xl font-bold tracking-tight text-white">
            Ori<span className="text-[#d4713b]">Gami</span>
          </span>
        </Link>
      </div>

      {/* KHỐI MENU */}
      <nav className="flex-1 py-10 px-5 space-y-3 overflow-y-auto relative z-10 scrollbar-hide">
        <p className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/40 mb-6">
          Menu Quản trị
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-[16px] text-[15px] font-semibold transition-all duration-300 text-decoration-none ${
                isActive
                  ? "bg-white text-[#0f2a1d] shadow-[0_8px_30px_rgba(0,0,0,0.12)] translate-x-1"
                  : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1"
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] transition-colors ${
                  isActive ? "text-[#2d6a4f]" : ""
                }`}
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
