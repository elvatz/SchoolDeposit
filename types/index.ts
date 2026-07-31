export type Account = "Tabungan" | "Kas";
export type TransactionType = "Deposit" | "Withdrawal" | "Belanja";

export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  createdAt: string;
}

export type StudentInput = Omit<Student, "id" | "createdAt">;

export interface Period {
  month: number; // 1-12
  year: number;
}

export interface LedgerEntry {
  id: string;
  date: string; // ISO date, yyyy-MM-dd
  studentId: string;
  studentName: string;
  account: Account;
  transactionType: TransactionType;
  /** "yyyy-MM" — which month's dues this Deposit covers. Empty for Withdrawal/Belanja. */
  period?: string;
  amount: number;
  description: string;
  createdAt: string;
}

export type LedgerEntryInput = Omit<
  LedgerEntry,
  "id" | "createdAt" | "studentName" | "period"
> & {
  studentName?: string;
  /** For Deposit: one or more months this total amount should be split across. */
  periods?: Period[];
};

export interface LedgerBulkCreateResult {
  entries: LedgerEntry[];
  count: number;
}

export interface LedgerEntryWithBalance extends LedgerEntry {
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface DashboardSummary {
  totalStudents: number;
  totalTabungan: number;
  totalKas: number;
  totalWithdrawal: number;
  totalBelanja: number;
  totalSaldo: number;
  recentTransactions: LedgerEntry[];
}

export interface StudentBalance {
  student: Student;
  saldoTabungan: number;
  saldoKas: number;
  entries: LedgerEntryWithBalance[];
}

export interface ReportSummary {
  totalTabungan: number;
  totalKas: number;
  totalWithdrawal: number;
  totalBelanja: number;
  saldo: number;
}

export interface MonthlyReportFilter {
  month: number; // 1-12
  year: number;
}

export interface LedgerFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
  account?: Account | "all";
  page?: number;
  pageSize?: number;
  sortBy?: "date" | "amount";
  sortDir?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MonthlyMatrixRow {
  studentId: string;
  name: string;
  class: string;
  /** keyed by "yyyy-MM" */
  amounts: Record<string, number>;
  total: number;
}

export interface MonthlyMatrix {
  account: Account;
  months: string[]; // "yyyy-MM", ascending
  students: MonthlyMatrixRow[];
  totalsByMonth: Record<string, number>;
  grandTotal: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
