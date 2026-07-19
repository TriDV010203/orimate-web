"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, EyeOff, ShieldAlert, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
  const qc = useQueryClient();
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminApi.getPendingReports(),
  });

  const handleMut = useMutation({
    mutationFn: ({ id, actionType }: { id: string; actionType: number }) =>
      adminApi.handleReport(id, actionType),
    onSuccess: () => {
      toast.success("Đã xử lý khiếu nại thành công!");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi khi xử lý báo cáo");
    },
  });

  const processReport = (id: string, actionType: number) => {
    const actions = [
      "Bỏ qua (Không vi phạm)",
      "Gỡ bỏ nội dung này",
      "Khóa tài khoản người đăng",
    ];
    if (confirm(`Xác nhận hành động: ${actions[actionType]}?`))
      handleMut.mutate({ id, actionType });
  };

  const getTargetTypeName = (typeCode: number) => {
    if (typeCode === 0) return "Hướng dẫn";
    if (typeCode === 1) return "Bài đăng";
    if (typeCode === 2) return "Bình luận";
    return "Khác";
  };

  return (
    <div className="usersContainer">
      <div className="reportsHeader">
        <div className="settingsHeaderInner">
          <h1 className="reportsTitle">
            Xử lý Báo cáo vi phạm
          </h1>
          <p className="reportsDesc">
            Kiểm tra và áp dụng biện pháp với nội dung bị báo cáo.
          </p>
        </div>
      </div>

      <div className="reportsCard">
        <div className="reportsTableWrapper">
          <table className="reportsTable">
            <thead className="reportsThead">
              <tr>
                <th className="reportsTh" style={{ width: "120px" }}>Nguồn</th>
                <th className="reportsTh" style={{ minWidth: "250px" }}>Nội dung bị tố cáo</th>
                <th className="reportsTh" style={{ width: "200px" }}>Lý do vi phạm</th>
                <th className="reportsTh" style={{ width: "140px" }}>Thời gian gửi</th>
                <th className="reportsThRight" style={{ width: "160px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody className="reportsTbody">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="reportsLoading">
                    <Loader2
                      className="animate-spin mx-auto mb-4"
                      size={36}
                      style={{ color: "#10b981" }}
                    />
                  </td>
                </tr>
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="reportsEmpty">
                    {/* <ShieldCheck
                      className="mx-auto mb-4"
                      size={48}
                      style={{ color: "#94a3b8" }}
                    /> */}
                    <p className="reportsEmptyTitle">
                      Không có báo cáo vi phạm
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="reportsTr"
                  >
                    <td className="reportsTd">
                      <span className="reportsSourceBadge">
                        {getTargetTypeName(rep.targetType)}
                      </span>
                    </td>
                    <td className="reportsTd">
                      <div className="reportsContentBox">
                        &quot;
                        {rep.targetContent || (
                          <span style={{ color: "#94a3b8" }}>
                            [Nội dung đã bị xóa ẩn]
                          </span>
                        )}
                        &quot;
                      </div>
                    </td>
                    <td className="reportsTd reportsReasonText">
                      {rep.reason}
                    </td>
                    <td className="reportsTd reportsDateText">
                      {format(new Date(rep.createdAt), "HH:mm dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </td>
                    <td className="reportsTdRight">
                      <div className="reportsActions">
                        <button
                          className="reportsActionBtn reportsBtnIgnore"
                          title="Bỏ qua"
                          onClick={() => processReport(rep.id, 0)}
                          disabled={handleMut.isPending}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="reportsActionBtn reportsBtnDelete"
                          title="Gỡ bỏ"
                          onClick={() => processReport(rep.id, 1)}
                          disabled={handleMut.isPending}
                        >
                          <EyeOff size={16} />
                        </button>
                        <button
                          className="reportsActionBtn reportsBtnBan"
                          title="Khóa TK"
                          onClick={() => processReport(rep.id, 2)}
                          disabled={handleMut.isPending}
                        >
                          <ShieldAlert size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
