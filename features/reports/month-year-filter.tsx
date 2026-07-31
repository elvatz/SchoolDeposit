"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { monthName } from "@/lib/utils";

interface MonthYearFilterProps {
  month?: number;
  year?: number;
  onChange: (month?: number, year?: number) => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export function MonthYearFilter({ month, year, onChange }: MonthYearFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={month ? String(month) : "all"}
        onValueChange={(v) => onChange(v === "all" ? undefined : Number(v), year)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Semua Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Bulan</SelectItem>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={String(m)}>
              {monthName(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year ? String(year) : "all"}
        onValueChange={(v) => onChange(month, v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Semua Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tahun</SelectItem>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
