export const ACCOUNTS = ["Tabungan", "Kas"] as const;
export const TRANSACTION_TYPES = ["Deposit", "Withdrawal", "Belanja"] as const;

/** Belanja (class purchase/expense) is a shared Kas expense — not tied to any single student. */
export const CLASS_KAS_LABEL = "Kas Kelas";

export const DEFAULT_PAGE_SIZE = 10;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/students", label: "Siswa", icon: "Users" },
  { href: "/transactions", label: "Transaksi", icon: "ArrowLeftRight" },
  { href: "/ledger", label: "Buku Besar", icon: "BookOpen" },
  { href: "/reports", label: "Laporan", icon: "FileBarChart" },
  { href: "/settings", label: "Pengaturan", icon: "Settings" },
] as const;
