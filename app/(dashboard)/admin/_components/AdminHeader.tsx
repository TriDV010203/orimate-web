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
    <header className="h-16 flex-shrink-0 bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-white/5 px-4 md:px-6 flex items-center justify-between z-40 sticky top-0 transition-colors duration-300">
      {/* Vùng Search */}
      <div className="flex-1 flex items-center">
        <div className="relative group w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full h-10 pl-10 pr-12 bg-slate-100 dark:bg-[#131722] border border-transparent dark:border-white/5 rounded-xl outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-[#10b981] dark:focus:border-[#10b981] transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-medium font-sans border border-slate-300 dark:border-white/5">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        {/* Nút Toggle Giao diện Sáng/Tối Chuẩn */}
        {mounted ? (
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            title="Đổi giao diện"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        ) : (
          /* Placeholder tránh giật layout trong lúc chờ mount */
          <div className="w-9 h-9" />
        )}

        <button className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors hidden sm:flex">
          <Palette className="w-5 h-5" />
        </button>

        <button className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0b0f19]"></span>
        </button>

        <button className="ml-1 w-9 h-9 rounded-full bg-[#10b981]/10 dark:bg-[#10b981]/20 text-[#10b981] flex items-center justify-center font-bold text-sm border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors">
          {initials}
        </button>
      </div>
    </header>
  );
}
