"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "@/lib/api";
import { Check, X, ExternalLink, Loader2, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import toast from "react-hot-toast";

export default function TutorialsQueuePage() {
  const qc = useQueryClient();

  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin-tutorials-queue"],
    queryFn: () => adminApi.getContributorQueue(),
  });
  const queue = queueData?.items || [];

  const publishMut = useMutation({
    mutationFn: (id: string) => adminApi.publishTutorial(id),
    onSuccess: () => {
      toast.success("Đã xuất bản thành công!");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi xuất bản");
    },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.contributorRequestRevision(id, reason),
    onSuccess: () => {
      toast.success("Đã gửi yêu cầu sửa.");
      qc.invalidateQueries({ queryKey: ["admin-tutorials-queue"] });
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      toast.error(err.message || "Lỗi thao tác");
    },
  });

  const handleReject = (id: string) => {
    const reason = prompt("Nhập lý do từ chối (tối thiểu 10 ký tự):");
    if (!reason || reason.length < 10) {
      if (reason !== null) toast.error("Lý do quá ngắn!");
      return;
    }
    rejectMut.mutate({ id, reason });
  };

  return (
    <div className="usersContainer">
      <div className="tutorialsHeader">
        <div className="tutorialsHeaderInner">
          <h1 className="tutorialsTitle">
            Duyệt bài Hướng dẫn
          </h1>
          <p className="tutorialsDesc">
            Danh sách chờ được xuất bản lên nền tảng.
          </p>
        </div>
        <div className="tutorialsStatsCard">
          <div className="tutorialsStatsInner">
            <span className="tutorialsStatsLabel">
              Bài chờ duyệt
            </span>
            <span className="tutorialsStatsValue">
              {queue.length}
            </span>
          </div>
        </div>
      </div>

      <div className="tutorialsList">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="tutorialsItem">
                <div>
                  <div className="tutorialsItemHeader">
                    <span className="skeleton" style={{ width: 100, height: 24, display: 'inline-block', borderRadius: 12 }}></span>
                    <span className="skeleton" style={{ width: 120, height: 24, display: 'inline-block' }}></span>
                  </div>
                  <div className="skeleton" style={{ width: '80%', height: 28, marginBottom: 12, borderRadius: 6 }}></div>
                  <div className="skeleton" style={{ width: '60%', height: 20, borderRadius: 6 }}></div>
                </div>

                <div className="tutorialsItemActions">
                  <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 6 }}></div>
                  <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 6 }}></div>
                </div>
              </div>
            ))}
          </>
        ) : queue.length === 0 ? (
          <div className="tutorialsEmptyBox">
            <div className="tutorialsEmptyIcon">
              <PartyPopper
                size={32}
                style={{ color: "#94a3b8" }}
              />
            </div>
            <h3 className="tutorialsEmptyTitle">
              Tuyệt vời, không có hàng chờ!
            </h3>
            <p className="tutorialsEmptyDesc">
              Hiện không có bài hướng dẫn nào cần phê duyệt.
            </p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="tutorialsItem"
            >
              <div>
                <div className="tutorialsItemHeader">
                  <span className="tutorialsItemBadge">
                    Đang chờ duyệt
                  </span>
                  <span className="tutorialsItemDate">
                    🕒{" "}
                    {format(new Date(item.createdAt), "HH:mm dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
                <h3 className="tutorialsItemTitle">
                  {item.title}
                  <a
                    href={`/huong-dan/${item.slug}?preview=true`}
                    target="_blank"
                    rel="noreferrer"
                    className="tutorialsItemLink"
                    title="Xem trước"
                  >
                    <ExternalLink size={14} />
                  </a>
                </h3>
                <p className="tutorialsItemMeta">
                  Tác giả:{" "}
                  <span className="tutorialsItemHighlight">
                    {item.authorName}
                  </span>{" "}
                  <span className="tutorialsItemDivider">
                    |
                  </span>{" "}
                  Quy mô:{" "}
                  <span className="tutorialsItemHighlight">
                    {item.stepCount} bước
                  </span>
                </p>
              </div>

              <div className="tutorialsItemActions">
                <button
                  className="tutorialsBtnReject"
                  onClick={() => handleReject(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  <X size={16} /> Sửa
                </button>
                <button
                  className="tutorialsBtnPublish"
                  onClick={() => publishMut.mutate(item.id)}
                  disabled={rejectMut.isPending || publishMut.isPending}
                >
                  {publishMut.isPending && publishMut.variables === item.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}{" "}
                  Xuất bản
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
