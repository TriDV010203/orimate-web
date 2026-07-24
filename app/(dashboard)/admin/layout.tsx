"use client";

import AdminSidebar from "./_components/AdminSidebar";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { isLoggedIn, getUser } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme, setTheme } = useTheme();
  const user = getUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
      return;
    }

    const currentUser = getUser();
    const hasAccess =
      currentUser?.roles?.includes("Admin") ||
      currentUser?.roles?.includes("Manager");
    if (!hasAccess) {
      router.push("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <div className="admin-shell">
        <AdminSidebar />

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header-search input-with-icon">
              <Search className="input-icon" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="input-field"
              />
            </div>

            <div className="admin-header-actions">
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="admin-icon-btn"
                title="Đổi giao diện"
              >
                {resolvedTheme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
              </button>

              <button className="admin-icon-btn">
                <Bell size={18} />
              </button>

              <button className="admin-avatar" title={user?.email}>
                {(user?.email ?? "A").charAt(0).toUpperCase()}
              </button>
            </div>
          </header>

          <main className="admin-content">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
