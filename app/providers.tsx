"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu coi là "mới" trong 30s — quay lại trang trong khoảng này hiện luôn từ cache, không gọi lại API
            staleTime: 30_000,
            // Giữ cache 5 phút sau khi component unmount, để back/forward vẫn còn dữ liệu
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
