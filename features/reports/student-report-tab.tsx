"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FileBarChart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useStudents } from "@/hooks/use-students";
import { useStudentLedger } from "@/hooks/use-ledger";
import { exportLedgerToExcel, exportLedgerToPdf } from "@/lib/export";

export function StudentReportTab() {
  const { data: students = [] } = useStudents();
  const [studentId, setStudentId] = React.useState<string>("");
  const { data, isLoading } = useStudentLedger(studentId || undefined);

  const entriesAsLedgerEntries = data?.entries ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih siswa" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.class}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!data}
              onClick={() =>
                data &&
                exportLedgerToPdf(
                  entriesAsLedgerEntries,
                  `Laporan Siswa - ${data.student.name}`,
                  `laporan-${data.student.nis}.pdf`
                )
              }
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button
              variant="outline"
              disabled={!data}
              onClick={() =>
                data && exportLedgerToExcel(entriesAsLedgerEntries, `laporan-${data.student.nis}.xlsx`)
              }
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          {!studentId ? (
            <EmptyState icon={FileBarChart} title="Pilih siswa untuk melihat laporan" />
          ) : isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !data?.entries.length ? (
            <EmptyState icon={FileBarChart} title="Belum ada transaksi untuk siswa ini" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Saldo Berjalan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-tabular">{formatDate(entry.date)}</TableCell>
                    <TableCell className="text-right font-tabular text-primary">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-tabular text-destructive">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-tabular font-semibold">
                      {formatCurrency(entry.runningBalance)}
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
