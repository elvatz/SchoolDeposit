"use client";

import { PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, periodLabel, transactionBadgeVariant } from "@/lib/utils";
import { useStudentLedger } from "@/hooks/use-ledger";
import { BookOpen } from "lucide-react";

export function StudentLedgerView({ studentId }: { studentId: string }) {
  const { data, isLoading } = useStudentLedger(studentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState icon={BookOpen} title="Data siswa tidak ditemukan" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>Nama Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-lg font-semibold text-foreground">{data.student.name}</p>
            <p className="text-sm text-muted-foreground">
              NIS {data.student.nis} · Kelas {data.student.class}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle>Saldo Tabungan</CardTitle>
            <PiggyBank className="h-4 w-4 text-brass" />
          </CardHeader>
          <CardContent>
            <p className="font-tabular font-display text-2xl font-semibold text-foreground">
              {formatCurrency(data.saldoTabungan)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle>Saldo Kas</CardTitle>
            <Wallet className="h-4 w-4 text-brass" />
          </CardHeader>
          <CardContent>
            <p className="font-tabular font-display text-2xl font-semibold text-foreground">
              {formatCurrency(data.saldoKas)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base text-foreground">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="ruled-paper">
          {!data.entries.length ? (
            <EmptyState icon={BookOpen} title="Belum ada riwayat transaksi untuk siswa ini" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Saldo Berjalan</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-tabular">{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.account}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transactionBadgeVariant(entry.transactionType)}>
                        {entry.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-tabular text-primary">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-tabular text-destructive">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-tabular font-semibold">
                      {formatCurrency(entry.runningBalance)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.description}
                      {entry.period && (
                        <span className="ml-1 text-xs text-brass">({periodLabel(entry.period)})</span>
                      )}
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
