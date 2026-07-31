import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthName(month: number): string {
  const names = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return names[month - 1] ?? "-";
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** Formats a { month, year } pair into a "yyyy-MM" period key, e.g. 2026-01. */
export function periodKey(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** "2026-01" -> "Jan 26" */
export function periodLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return `${MONTH_SHORT[month - 1]} ${String(year).slice(2)}`;
}

/** Builds an inclusive ascending list of "yyyy-MM" keys between two periods. */
export function buildMonthRange(
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
): string[] {
  const months: string[] = [];
  let m = startMonth;
  let y = startYear;
  let guard = 0;
  while ((y < endYear || (y === endYear && m <= endMonth)) && guard < 120) {
    months.push(periodKey(m, y));
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    guard += 1;
  }
  return months;
}

/** Deposit adds to balance; Withdrawal and Belanja both subtract from balance. */
export function isCreditType(transactionType: "Deposit" | "Withdrawal" | "Belanja"): boolean {
  return transactionType === "Withdrawal" || transactionType === "Belanja";
}

export function transactionBadgeVariant(
  transactionType: "Deposit" | "Withdrawal" | "Belanja"
): "success" | "destructive" | "brass" {
  if (transactionType === "Deposit") return "success";
  if (transactionType === "Belanja") return "brass";
  return "destructive";
}
