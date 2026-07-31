import { apiClient } from "@/services/api-client";
import type {
  LedgerBulkCreateResult,
  LedgerEntry,
  LedgerEntryInput,
  LedgerEntryWithBalance,
  LedgerFilters,
  PaginatedResult,
  StudentBalance,
} from "@/types";

export const ledgerService = {
  list: (filters: LedgerFilters = {}) =>
    apiClient.get<PaginatedResult<LedgerEntryWithBalance>>("ledger", {
      search: filters.search,
      startDate: filters.startDate,
      endDate: filters.endDate,
      studentId: filters.studentId,
      account: filters.account,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 10,
      sortBy: filters.sortBy ?? "date",
      sortDir: filters.sortDir ?? "desc",
    }),

  create: (input: LedgerEntryInput) =>
    apiClient.mutate<LedgerEntry | LedgerBulkCreateResult>("ledger", "create", input),

  update: (id: string, input: LedgerEntryInput) =>
    apiClient.mutate<LedgerEntry>("ledger", "update", { id, ...input }),

  remove: (id: string) =>
    apiClient.mutate<{ id: string }>("ledger", "delete", { id }),

  studentLedger: (studentId: string) =>
    apiClient.get<StudentBalance>("ledger", { studentId, mode: "student" }),
};
