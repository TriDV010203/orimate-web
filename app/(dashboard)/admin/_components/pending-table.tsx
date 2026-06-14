import React from "react";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function PendingTable() {
  const pendingTutorials = [
    {
      id: "ORI-2026A",
      title: "Hướng dẫn gấp Rồng Thần Kusudama 3D siêu phức tạp",
      author: "nguyen_van_ori",
      category: "Hình khối",
      date: "12/06/2026",
      status: "Chờ duyệt",
    },
    {
      id: "ORI-2026B",
      title: "Cách gấp Chim Hạc Nhật Bản biến thể đuôi xòe",
      author: "orimaster_99",
      category: "Động vật",
      date: "11/06/2026",
      status: "Chờ duyệt",
    },
    {
      id: "ORI-2026C",
      title: "Hộp quà Origami đa giác vuông có nắp khóa",
      author: "hoa_giay_art",
      category: "Đồ chơi",
      date: "10/06/2026",
      status: "Chờ duyệt",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden w-full">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">
            Hàng đợi phê duyệt tài liệu hướng dẫn mới
          </h3>
          <p className="text-xs text-slate-400">
            Các bài viết do người dùng đăng tải cần được kiểm duyệt trước khi
            hiển thị công khai.
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-none border border-amber-200 shrink-0 self-start sm:self-center">
          {pendingTutorials.length} Yêu cầu tồn đọng
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/75 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 w-28 pl-6">Mã số</th>
              <th className="p-4 max-w-sm">Tiêu đề tài liệu</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4">Chuyên mục</th>
              <th className="p-4">Ngày gửi</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 pr-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {pendingTutorials.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-400">
                  {item.id}
                </td>
                <td className="p-4 font-semibold text-slate-900 max-w-sm truncate">
                  {item.title}
                </td>
                <td className="p-4 text-slate-500 font-medium">
                  @{item.author}
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-none text-xs font-medium">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-xs font-medium">
                  {item.date}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-none"></span>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end w-full">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-none hover:bg-slate-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-none hover:bg-emerald-50 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-rose-600 hover:text-rose-700 rounded-none hover:bg-rose-50 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
