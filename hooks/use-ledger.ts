"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ledgerService } from "@/services/ledger.service";
import type { LedgerEntryInput, LedgerFilters } from "@/types";
import { toast } from "@/hooks/use-toast";

const KEY = "ledger";

export function useLedger(filters: LedgerFilters) {
  return useQuery({
    queryKey: [KEY, filters],
    queryFn: () => ledgerService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useStudentLedger(studentId: string | undefined) {
  return useQuery({
    queryKey: [KEY, "student", studentId],
    queryFn: () => ledgerService.studentLedger(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useCreateLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LedgerEntryInput) => ledgerService.create(input),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      if (result && "count" in result && result.count > 1) {
        toast({ title: `${result.count} transaksi bulanan disimpan`, variant: "success" });
      } else {
        toast({ title: "Transaksi disimpan", variant: "success" });
      }
    },
    onError: (err: Error) =>
      toast({ title: "Gagal menyimpan transaksi", description: err.message, variant: "destructive" }),
  });
}

export function useDeleteLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ledgerService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast({ title: "Transaksi dihapus", variant: "success" });
    },
    onError: (err: Error) =>
      toast({ title: "Gagal menghapus transaksi", description: err.message, variant: "destructive" }),
  });
}
