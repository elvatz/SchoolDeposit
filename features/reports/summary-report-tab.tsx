"use client";

import * as React from "react";
import { FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonthYearFilter } from "@/features/reports/month-year-filter";
import { SummaryReportCard } from "@/features/reports/summary-report-card";
import { useMonthlySummary } from "@/hooks/use-reports";
import { useLedger } from "@/hooks/use-ledger";
import { exportLedgerToExcel } from "@/lib/export";
import { monthName } from "@/lib/utils";

function dateRangeFor(month?: number, year?: number) {
  if (!month || !year) return { startDate: undefined, endDate: undefined };
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function SummaryReportTab() {
  const [month, setMonth] = React.useState<number | undefined>();
  const [year, setYear] = React.useState<number | undefined>();
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  const { data: summary, isLoading } = useMonthlySummary(month, year);
  const { data: ledgerData } = useLedger({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page: 1,
    pageSize: 10000,
    sortBy: "date",
    sortDir: "asc",
  });

  const title =
    month && year ? `Laporan Bulanan - ${monthName(month)} ${year}` : "Laporan Ringkasan";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <MonthYearFilter
              month={month}
              year={year}
              onChange={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />

            <div className="flex flex-wrap gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Range Tanggal Awal</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Range Tanggal Akhir</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!ledgerData?.data.length}
              onClick={() => ledgerData && exportLedgerToExcel(ledgerData.data, "buku-besar.xlsx")}
            >
              <FileSpreadsheet className="h-4 w-4" /> Buku Besar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <SummaryReportCard data={summary} isLoading={isLoading} />
    </div>
  );
}
