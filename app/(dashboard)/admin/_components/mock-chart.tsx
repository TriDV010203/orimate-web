import React from "react";

export default function MockChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[360px]">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Xu hướng truy cập & Đăng tải
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thống kê 6 tháng đầu năm 2026
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium shrink-0">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 bg-emerald-600 rounded-none block"></span>{" "}
                Lượt xem video
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 bg-slate-200 rounded-none block"></span>{" "}
                Bài viết mới
              </span>
            </div>
          </div>

          <div className="h-52 w-full flex items-end gap-4 pt-4 px-2 border-b border-l border-slate-100 pb-2">
            {[45, 60, 55, 85, 70, 95].map((val, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <div className="w-full bg-slate-50 rounded-none h-full relative flex items-end justify-center">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-none transition-all duration-500 group-hover:brightness-95"
                    style={{ height: `${val}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  T0{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex flex-col justify-between min-h-[360px]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Tỷ lệ bài viết phân bố theo thể loại
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "Mô hình Động vật",
                count: "524 bài",
                pct: "42%",
                color: "bg-emerald-600",
              },
              {
                label: "Hình khối Kusudama",
                count: "312 bài",
                pct: "25%",
                color: "bg-blue-600",
              },
              {
                label: "Đồ chơi & Hộp quà",
                count: "250 bài",
                pct: "20%",
                color: "bg-amber-500",
              },
              {
                label: "Chủ đề Lễ hội",
                count: "162 bài",
                pct: "13%",
                color: "bg-slate-400",
              },
            ].map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{item.label}</span>
                  <span className="text-slate-400">
                    {item.count} ({item.pct})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-none overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-none`}
                    style={{ width: item.pct }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
