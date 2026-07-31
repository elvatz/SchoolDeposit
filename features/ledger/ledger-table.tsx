"use client";

import * as React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BookOpen } from "lucide-react";
import { formatCurrency, formatDate, periodLabel, transactionBadgeVariant } from "@/lib/utils";
import { useDeleteLedgerEntry } from "@/hooks/use-ledger";
import type { LedgerEntryWithBalance, LedgerFilters, PaginatedResult } from "@/types";

interface LedgerTableProps {
  data?: PaginatedResult<LedgerEntryWithBalance>;
  isLoading: boolean;
  filters: LedgerFilters;
  onChange: (filters: LedgerFilters) => void;
}

export function LedgerTable({ data, isLoading, filters, onChange }: LedgerTableProps) {
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const deleteEntry = useDeleteLedgerEntry();

  const toggleSort = () => {
    onChange({
      ...filters,
      sortBy: "date",
      sortDir: filters.sortDir === "asc" ? "desc" : "asc",
    });
  };

  const rows = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Tidak ada transaksi"
        description="Coba ubah filter pencarian, atau catat transaksi baru."
      />
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button className="flex items-center gap-1" onClick={toggleSort}>
                Tanggal <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Siswa</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-right">Debit</TableHead>
            <TableHead className="text-right">Credit</TableHead>
            <TableHead className="text-right">Saldo Berjalan</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap font-tabular">{formatDate(row.date)}</TableCell>
              <TableCell className="font-medium text-foreground">{row.studentName}</TableCell>
              <TableCell>
                <Badge variant="outline">{row.account}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={transactionBadgeVariant(row.transactionType)}>
                  {row.transactionType}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-tabular text-primary">
                {row.debit > 0 ? formatCurrency(row.debit) : "-"}
              </TableCell>
              <TableCell className="text-right font-tabular text-destructive">
                {row.credit > 0 ? formatCurrency(row.credit) : "-"}
              </TableCell>
              <TableCell className="text-right font-tabular font-semibold text-foreground">
                {formatCurrency(row.runningBalance)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {row.description}
                {row.period && (
                  <span className="ml-1 text-xs text-brass">({periodLabel(row.period)})</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan {rows.length} dari {data?.total ?? 0} transaksi
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => onChange({ ...filters, page: (filters.page ?? 1) - 1 })}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {filters.page ?? 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => onChange({ ...filters, page: (filters.page ?? 1) + 1 })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus transaksi ini?"
        description="Transaksi akan dihapus permanen dari Buku Besar dan saldo akan dihitung ulang."
        loading={deleteEntry.isPending}
        onConfirm={async () => {
          if (deleteId) {
            await deleteEntry.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
