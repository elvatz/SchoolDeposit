"use client";

import * as React from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FileBarChart } from "lucide-react";
import { useMonthlyMatrix } from "@/hooks/use-reports";
import { formatCurrency, monthName, periodLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Account } from "@/types";

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

function defaultStart() {
  return { month: 7, year: 2026 };
}

function defaultEnd() {
  return { month: 6, year: 2027 };
}

function MonthYearPair({
  label,
  month,
  year,
  onChange,
}: {
  label: string;
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Select value={String(month)} onValueChange={(v) => onChange(Number(v), year)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <SelectItem key={m} value={String(m)}>
                {monthName(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => onChange(month, Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function MonthlyMatrixTab() {
  const [account, setAccount] = React.useState<Account>("Kas");
  const [start, setStart] = React.useState(defaultStart());
  const [end, setEnd] = React.useState(defaultEnd());

  const { data, isLoading } = useMonthlyMatrix(
    account,
    start.month,
    start.year,
    end.month,
    end.year
  );

  const exportCsv = () => {
    if (!data) return;
    const header = ["Nama", "Kelas", ...data.months.map(periodLabel), "Total"];
    const rows = data.students.map((s) => [
      s.name,
      s.class,
      ...data.months.map((m) => String(s.amounts[m] ?? 0)),
      String(s.total),
    ]);
    const totalRow = [
      "TOTAL KESELURUHAN",
      "",
      ...data.months.map((m) => String(data.totalsByMonth[m] ?? 0)),
      String(data.grandTotal),
    ];
    const csv = [header, ...rows, totalRow].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iuran-${account.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    if (!data) return;
    const XLSX = await import("xlsx");
    const rows = data.students.map((s) => {
      const row: Record<string, string | number> = { Nama: s.name, Kelas: s.class };
      data.months.forEach((m) => {
        row[periodLabel(m)] = s.amounts[m] ?? 0;
      });
      row.Total = s.total;
      return row;
    });
    const totalRow: Record<string, string | number> = { Nama: "TOTAL KESELURUHAN", Kelas: "" };
    data.months.forEach((m) => {
      totalRow[periodLabel(m)] = data.totalsByMonth[m] ?? 0;
    });
    totalRow.Total = data.grandTotal;
    rows.push(totalRow);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Iuran ${account}`);
    XLSX.writeFile(workbook, `iuran-${account.toLowerCase()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Account</p>
              <Select value={account} onValueChange={(v) => setAccount(v as Account)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tabungan">Tabungan</SelectItem>
                  <SelectItem value="Kas">Kas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <MonthYearPair
              label="Dari"
              month={start.month}
              year={start.year}
              onChange={(month, year) => setStart({ month, year })}
            />
            <MonthYearPair
              label="Sampai"
              month={end.month}
              year={end.year}
              onChange={(month, year) => setEnd({ month, year })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportCsv} disabled={!data}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportExcel} disabled={!data}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="mb-3 text-xs text-muted-foreground">
            Iuran {account} Rp/bulan bersifat bebas sesuai yang disetor. Sel kosong (
            <span className="rounded bg-brass/20 px-1">kuning</span>) = belum ada catatan setoran
            bulan tersebut.
          </p>

          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : !data || !data.students.length ? (
            <EmptyState icon={FileBarChart} title="Belum ada data siswa atau transaksi" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-ledger">Nama Siswa</TableHead>
                  {data.months.map((m) => (
                    <TableHead key={m} className="text-right whitespace-nowrap">
                      {periodLabel(m)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((s) => (
                  <TableRow key={s.studentId}>
                    <TableCell className="sticky left-0 bg-card font-medium text-foreground">
                      {s.name}
                    </TableCell>
                    {data.months.map((m) => {
                      const value = s.amounts[m] ?? 0;
                      return (
                        <TableCell
                          key={m}
                          className={cn(
                            "text-right font-tabular",
                            value === 0 ? "bg-brass/10 text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {value > 0 ? formatCurrency(value) : "-"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-tabular font-semibold text-foreground">
                      {formatCurrency(s.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <TableRow className="bg-ledger font-semibold text-ledger-foreground hover:bg-ledger">
                  <TableCell className="sticky left-0 bg-ledger">TOTAL KESELURUHAN</TableCell>
                  {data.months.map((m) => (
                    <TableCell key={m} className="text-right font-tabular">
                      {formatCurrency(data.totalsByMonth[m] ?? 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-tabular">
                    {formatCurrency(data.grandTotal)}
                  </TableCell>
                </TableRow>
              </tfoot>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
