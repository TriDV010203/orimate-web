import React from "react";
import { BookOpen, Users, AlertTriangle, ShieldAlert } from "lucide-react";

export default function KpiGrid() {
  const kpiCards = [
    {
      title: "Tổng bài hướng dẫn",
      value: "1,248",
      change: "+12% tháng này",
      isPositive: true,
      icon: BookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Bài viết chờ duyệt",
      value: "14",
      change: "4 bài nghiêm trọng",
      isPositive: false,
      icon: ShieldAlert,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Thành viên hoạt động",
      value: "8,942",
      change: "+842 người dùng mới",
      isPositive: true,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Báo cáo vi phạm",
      value: "3",
      change: "-50% so với tuần trước",
      isPositive: true,
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {kpiCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white p-6 rounded-none border border-slate-200 shadow-sm flex justify-between items-start transition-all hover:shadow-md"
          >
            <div className="space-y-2 min-w-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block truncate">
                {card.title}
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 leading-none py-1">
                {card.value}
              </h3>
              <p
                className={`text-xs font-medium ${card.isPositive ? "text-emerald-600" : "text-amber-600"}`}
              >
                {card.change}
              </p>
            </div>
            <div className={`p-2.5 rounded-none shrink-0 ${card.bgColor}`}>
              <IconComponent className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
