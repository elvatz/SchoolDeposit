import { apiClient } from "@/services/api-client";
import type { Account, DashboardSummary, MonthlyMatrix, ReportSummary } from "@/types";

export const reportsService = {
  dashboard: () => apiClient.get<DashboardSummary>("reports", { mode: "dashboard" }),

  summary: (month?: number, year?: number) =>
    apiClient.get<ReportSummary>("reports", { mode: "summary", month, year }),

  perStudent: (studentId: string) =>
    apiClient.get<ReportSummary>("reports", { mode: "student", studentId }),

  monthlyMatrix: (
    account: Account,
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number
  ) =>
    apiClient.get<MonthlyMatrix>("reports", {
      mode: "monthlyMatrix",
      account,
      startMonth,
      startYear,
      endMonth,
      endYear,
    }),
};
