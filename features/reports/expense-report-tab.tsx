"use client";

import * as React from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthYearFilter } from "@/features/reports/month-year-filter";
import { useLedger } from "@/hooks/use-ledger";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ExpenseReportTab() {
  const [month, setMonth] = React.useState<number | undefined>();
  const [year, setYear] = React.useState<number | undefined>();

  const { data: ledgerData, isLoading } = useLedger({
    account: "Kas",
    page: 1,
    pageSize: 10000,
    sortBy: "date",
    sortDir: "desc",
  });

  const expenseEntries = React.useMemo(() => {
    const entries = (ledgerData?.data ?? []).filter((entry) => entry.transactionType === "Belanja");

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const matchesMonth = !month || entryDate.getMonth() + 1 === month;
      const matchesYear = !year || entryDate.getFullYear() === year;
      return matchesMonth && matchesYear;
    });
  }, [ledgerData, month, year]);

  const totalBelanja = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <MonthYearFilter
            month={month}
            year={year}
            onChange={(nextMonth, nextYear) => {
              setMonth(nextMonth);
              setYear(nextYear);
            }}
          />

          <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Total Pengeluaran:</span>{" "}
            <span className="font-semibold text-foreground">{formatCurrency(totalBelanja)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : expenseEntries.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Belum ada data pengeluaran"
              description="Pilih semua bulan/tahun atau ubah filter untuk melihat detail belanja."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-tabular">{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.description || "-"}</TableCell>
                    <TableCell className="text-right font-tabular font-semibold text-destructive">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
