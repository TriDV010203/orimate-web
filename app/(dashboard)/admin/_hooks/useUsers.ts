import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export function useUsers() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("All");
  const [pageSize, setPageSize] = useState(10);

  // 1. LẤY DANH SÁCH
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", keyword, page, status, pageSize],
    queryFn: () => adminApi.getUsers({
      keyword,
      status: status !== "All" ? status : undefined,
      page,
      pageSize,
    }),
    placeholderData: keepPreviousData,
  });

  // 2. KHÓA TÀI KHOẢN
  const suspendMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendUser(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // 3. MỞ KHÓA TÀI KHOẢN
  const activateMut = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // 4. PHÂN QUYỀN (Assign/Remove role có thể gộp chung hoặc làm hàm update)
  const assignRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.assignRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Giả lập hàm updateUser vì API hiện tại chỉ có assignRole/removeRole/suspend
  // Ở đây chúng ta implement updateUser gọi các API tương ứng nếu cần
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Vì không có API update toàn bộ, tạm thời chỉ support đổi role
      if (data.roles && data.roles.length > 0) {
        await adminApi.assignRole(id, data.roles[0]);
      }
      return { message: "Updated" };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    data,
    isLoading,
    keyword,
    setKeyword,
    page,
    setPage,
    status,
    setStatus,
    pageSize,
    setPageSize,
    suspendUser: suspendMut.mutate,
    activateUser: activateMut.mutate,
    updateUser: updateMut.mutate,
    assignRole: assignRoleMut.mutate,
    isMutating: suspendMut.isPending || activateMut.isPending || assignRoleMut.isPending || updateMut.isPending,
    invalidateUsers: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  };
}
