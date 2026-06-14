"use client";

import { useState } from "react";

export default function AdminTutorialsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tutorialsData = [
    {
      id: "T-1004",
      title: "Hướng dẫn gấp Chim Hạc giấy truyền thống Nhật Bản",
      category: "Động vật",
      author: "ichigo_fold",
      status: "published",
      views: "4.2K",
    },
    {
      id: "T-1003",
      title: "Mô hình siêu rồng Kusudama phức tạp",
      category: "Nâng cao",
      author: "orimaster_99",
      status: "pending",
      views: "0",
    },
    {
      id: "T-1002",
      title: "Cách gấp máy bay phản lực bay cực xa",
      category: "Đồ chơi",
      author: "tuan_tu",
      status: "published",
      views: "18.5K",
    },
    {
      id: "T-1001",
      title: "Thuyền buồm hai cánh buồm cơ bản",
      category: "Cơ bản",
      author: "hoa_giay",
      status: "hidden",
      views: "341",
    },
  ];

  const filteredData = tutorialsData.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const keyword = searchTerm.trim().toLowerCase();
    return (
      matchStatus &&
      (item.id.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.author.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div></div>
        <button className="btn btn-primary">Thêm bài viết mới</button>
      </div>

      {/* KHU VỰC BỘ LỌC (FILTER BAR) */}
      <div
        className="card p-4 flex flex-col sm:flex-row justify-between gap-3 items-center"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="search-bar w-full sm:max-w-sm">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề, mã số, tác giả..."
            style={{ borderRadius: "var(--radius-md)" }}
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Trạng thái:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-1.5 px-3"
            style={{
              width: "140px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
            }}
          >
            <option value="all">Tất cả</option>
            <option value="published">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="hidden">Bị ẩn</option>
          </select>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐỒ ÁN (DATATABLE UI) */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse"
            style={{ fontSize: "0.875rem" }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text-secondary)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <th className="p-4 font-semibold">Mã số</th>
                <th className="p-4 font-semibold w-[40%]">Tiêu đề bài viết</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Tác giả</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold">Lượt xem</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Không tìm thấy bài viết nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(45, 106, 79, 0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td
                      className="p-4 font-mono text-xs font-bold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.id}
                    </td>
                    <td
                      className="p-4 font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </td>
                    <td className="p-4">
                      <span className="badge badge-category">
                        {item.category}
                      </span>
                    </td>
                    <td
                      className="p-4"
                      style={{
                        color: "var(--color-primary-light)",
                        fontWeight: 500,
                      }}
                    >
                      @{item.author}
                    </td>
                    <td className="p-4">
                      {item.status === "published" && (
                        <span className="badge badge-free">Đã duyệt</span>
                      )}
                      {item.status === "pending" && (
                        <span className="badge badge-medium">Chờ duyệt</span>
                      )}
                      {item.status === "hidden" && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "var(--color-surface-2)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          Bị ẩn
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium">{item.views}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <button
                          className="p-1.5 rounded-lg text-sm hover:bg-slate-200/60"
                          title="Chỉnh sửa nghiệp vụ"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-sm hover:bg-slate-200/60"
                          title="Ẩn hiển thị"
                        >
                          👁️
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-sm hover:bg-rose-50 text-rose-600"
                          title="Xóa vĩnh viễn dữ liệu"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG (PAGINATION) */}
        <div
          className="flex justify-between items-center p-4 border-t"
          style={{
            backgroundColor: "var(--color-surface-2)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            fontSize: "0.8125rem",
          }}
        >
          <span>
            Hiển thị <strong>{filteredData.length}</strong> trên tổng số{" "}
            <strong>{tutorialsData.length}</strong> bài viết
          </span>
          <div className="flex gap-1.5">
            <button
              disabled
              className="filter-chip py-1 px-3 opacity-40 cursor-not-allowed"
            >
              Trước
            </button>
            <button className="filter-chip active py-1 px-3">1</button>
            <button className="filter-chip py-1 px-3">Tiếp</button>
          </div>
        </div>
      </div>
    </div>
  );
}
