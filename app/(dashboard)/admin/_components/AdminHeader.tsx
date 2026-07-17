"use client";

import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Search, Plus, Sun, Moon, Palette, Bell } from "lucide-react"; // Nhớ import thêm Moon
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function AdminHeader() {
  const router = useRouter();
  const user = getUser();
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : "A";

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="adminHeader">
      {/* Vùng Search */}
      <div className="headerSearchArea">
        <div className="headerSearchWrapper">
          <Search className="headerSearchIcon" />
          <input
            type="text"
            placeholder="Search anything..."
            className="headerSearchInput"
          />
          <div className="headerKbdWrapper">
            <kbd className="headerKbd">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="headerActions">
        <div className="headerDivider"></div>

        {/* Nút Toggle Giao diện Sáng/Tối Chuẩn */}
        {mounted ? (
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="headerIconButton"
            title="Đổi giao diện"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="headerIcon" />
            ) : (
              <Moon className="headerIcon" />
            )}
          </button>
        ) : (
          /* Placeholder tránh giật layout trong lúc chờ mount */
          <div className="headerPlaceholder" />
        )}

        <button className="headerIconButtonHiddenMobile">
          <Palette className="headerIcon" />
        </button>

        <button className="headerIconButton">
          <Bell className="headerIcon" />
          <span className="headerBadge"></span>
        </button>

        <button className="headerAvatar">
          {initials}
        </button>
      </div>
    </header>
  );
}
