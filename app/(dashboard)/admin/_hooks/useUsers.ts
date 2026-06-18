import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

export function useUsers() {
  const qc = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  // 1. Fetch Dữ liệu
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", keyword, page],
    queryFn: () => adminApi.getUsers({ keyword, page, pageSize: 10 }),
    placeholderData: keepPreviousData,
  });

  // 2. Logic Khóa User
  const suspendMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.suspendUser(id, reason),
    onSuccess: () => {
      toast.success("Đã khóa tài khoản thành công!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi khóa tài khoản");
    },
  });

  // 3. Logic Mở Khóa User
  const activateMut = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      toast.success("Tài khoản đã được mở khóa!");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi mở khóa");
    },
  });

  return {
    data,
    isLoading,
    keyword,
    setKeyword,
    page,
    setPage,
    suspendUser: suspendMut.mutate,
    activateUser: activateMut.mutate,
    isMutating: suspendMut.isPending || activateMut.isPending,
  };
}
