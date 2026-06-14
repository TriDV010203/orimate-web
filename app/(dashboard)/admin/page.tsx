import React from "react";
import KpiGrid from "./_components/kpi-grid";
import MockChart from "./_components/mock-chart";

export default function AdminDashboard() {
  return (
    <div className="w-full p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <KpiGrid />
        <MockChart />
      </div>
    </div>
  );
}
