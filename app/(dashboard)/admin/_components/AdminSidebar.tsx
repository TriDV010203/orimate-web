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
    <aside className="sidebar">
      {/* Hiệu ứng Glow */}
      <div className="sidebarGlow" />

      {/* KHỐI LOGO (Viết thẳng inline) */}
      <div className="logoContainer">
        <Link
          href="/admin"
          className="logoLink"
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
            className="logoIcon"
          >
            <path d="M2 20l10-16 10 16H2z" />
            <path d="M12 4L6 14h12L12 4z" />
          </svg>
          <span className="logoText">
            Ori<span className="logoAccent">Gami</span>
          </span>
        </Link>
      </div>

      {/* KHỐI MENU */}
      <nav className="navContainer">
        <p className="navTitle">
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
              className={`navItem ${isActive ? "navItemActive" : "navItemInactive"}`}
            >
              <Icon
                className={`navIcon ${isActive ? "navIconActive" : ""}`}
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
