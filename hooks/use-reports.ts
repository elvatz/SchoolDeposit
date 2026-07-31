"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reports.service";
import type { Account } from "@/types";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => reportsService.dashboard(),
    refetchInterval: 60_000, // auto refresh every minute
  });
}

export function useMonthlySummary(month?: number, year?: number) {
  return useQuery({
    queryKey: ["reports", "summary", month, year],
    queryFn: () => reportsService.summary(month, year),
  });
}

export function useStudentReport(studentId: string | undefined) {
  return useQuery({
    queryKey: ["reports", "student", studentId],
    queryFn: () => reportsService.perStudent(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useMonthlyMatrix(
  account: Account,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
) {
  return useQuery({
    queryKey: ["reports", "monthlyMatrix", account, startMonth, startYear, endMonth, endYear],
    queryFn: () => reportsService.monthlyMatrix(account, startMonth, startYear, endMonth, endYear),
    placeholderData: (prev) => prev,
  });
}
