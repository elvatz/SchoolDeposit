"use client";

import { Search, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudents } from "@/hooks/use-students";
import type { LedgerFilters } from "@/types";

interface LedgerFilterBarProps {
  filters: LedgerFilters;
  onChange: (filters: LedgerFilters) => void;
  onExportExcel: () => void;
}

export function LedgerFilterBar({ filters, onChange, onExportExcel }: LedgerFilterBarProps) {
  const { data: students = [] } = useStudents();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari keterangan..."
            className="pl-9"
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <Select
          value={filters.studentId ?? "all"}
          onValueChange={(v) => onChange({ ...filters, studentId: v === "all" ? undefined : v, page: 1 })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Siswa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Siswa</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.account ?? "all"}
          onValueChange={(v) =>
            onChange({ ...filters, account: v === "all" ? "all" : (v as "Tabungan" | "Kas"), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Account</SelectItem>
            <SelectItem value="Tabungan">Tabungan</SelectItem>
            <SelectItem value="Kas">Kas</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value, page: 1 })}
          />
          <Input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <Button variant="outline" className="w-full sm:w-auto lg:flex-shrink-0" onClick={onExportExcel}>
        <FileSpreadsheet className="h-4 w-4" /> Export Excel
      </Button>
    </div>
  );
}
