"use client";

import { TopNav } from "@/components/layout/topnav";
import { SummaryCards } from "@/features/dashboard/summary-cards";
import { BalanceChart } from "@/features/dashboard/balance-chart";
import { RecentTransactionsCard } from "@/features/dashboard/recent-transactions-card";
import { useDashboardSummary } from "@/hooks/use-reports";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div className="pb-10">
      <TopNav
        title="Dashboard"
        description="Ringkasan tabungan, kas, dan aktivitas transaksi siswa"
      />
      <div className="space-y-6 px-4 py-6 sm:px-8">
        <SummaryCards data={data} isLoading={isLoading} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <BalanceChart data={data} isLoading={isLoading} />
          </div>
          <div className="xl:col-span-2">
            <RecentTransactionsCard data={data} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
