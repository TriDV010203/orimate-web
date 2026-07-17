"use client";

import AdminSidebar from "./_components/AdminSidebar";
import { Bell, Search, UserCircle } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import "./css/style.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/dang-nhap");
      return;
    }

    const user = getUser();
    if (!user?.roles?.includes("Admin")) {
      router.push("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    // 3. Bọc QueryClientProvider ngoài cùng của Layout này
    <QueryClientProvider client={queryClient}>
      <div className="layoutContainer">
        {/* Sidebar bên trái */}
        <AdminSidebar />

        {/* Khu vực chính bên phải */}
        <div className="mainContent">
          {/* Header */}
          <header className="header">
            <div className="searchWrapper">
              <Search className="searchIcon" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="searchInput"
              />
            </div>

            <div className="actionsContainer">
              <button className="notificationButton">
                <Bell className="notificationIcon" />
                <span className="notificationBadge"></span>
              </button>

              <div className="profileContainer">
                <div className="profileTextWrapper">
                  <p className="profileName">
                    Admin User
                  </p>
                  <p className="profileRole">
                    Quản trị viên
                  </p>
                </div>
                <UserCircle className="profileIcon" />
              </div>
            </div>
          </header>

          {/* Nội dung trang */}
          <main className="mainArea">
            <div className="contentWrapper">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
