"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, FolderCog, FolderOpen, Map, Trophy, Medal, Flag, Settings, Wallet, ShoppingBag } from "lucide-react";

const navItems = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Duyệt bài viết", href: "/admin/tutorials", icon: BookOpen },
  { name: "Quản lý hướng dẫn", href: "/admin/tutorials/manage", icon: FolderCog },
  { name: "Danh mục", href: "/admin/categories", icon: FolderOpen },
  { name: "Lộ trình học", href: "/admin/learning-paths", icon: Map },
  { name: "Thử thách ngày", href: "/admin/daily-challenges", icon: Trophy },
  { name: "Thử thách tuần", href: "/admin/weekly-challenges", icon: Medal },
  { name: "Cửa hàng", href: "/admin/shop", icon: ShoppingBag },
  { name: "Doanh thu VIP", href: "/admin/revenue", icon: Wallet },
  { name: "Báo cáo vi phạm", href: "/admin/reports", icon: Flag },
  { name: "Cấu hình hệ thống", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-sidebar-logo">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20l10-16 10 16H2z" />
          <path d="M12 4L6 14h12L12 4z" />
        </svg>
        Ori<span>Gami</span>
      </Link>

      <nav>
        <p className="admin-sidebar-nav-title">Menu Quản trị</p>

        {navItems.map((item) => {
          const Icon = item.icon;
          // Pick the most specific href match so overlapping routes (e.g. /admin/tutorials
          // and /admin/tutorials/new) don't both light up at once.
          const bestMatch = navItems
            .filter((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href + "/")))
            .sort((a, b) => b.href.length - a.href.length)[0];
          const isActive = bestMatch?.href === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`admin-nav-item ${isActive ? "admin-nav-item-active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
