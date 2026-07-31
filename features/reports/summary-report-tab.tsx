"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthYearFilter } from "@/features/reports/month-year-filter";
import { SummaryReportCard } from "@/features/reports/summary-report-card";
import { useMonthlySummary } from "@/hooks/use-reports";
import { useLedger } from "@/hooks/use-ledger";
import { exportLedgerToExcel, exportLedgerToPdf } from "@/lib/export";
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

  const { data: summary, isLoading } = useMonthlySummary(month, year);
  const { startDate, endDate } = dateRangeFor(month, year);
  const { data: ledgerData } = useLedger({ startDate, endDate, page: 1, pageSize: 10000 });

  const title =
    month && year ? `Laporan Bulanan - ${monthName(month)} ${year}` : "Laporan Ringkasan";

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <MonthYearFilter
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!ledgerData?.data.length}
              onClick={() =>
                ledgerData &&
                exportLedgerToPdf(ledgerData.data, title, `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`)
              }
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button
              variant="outline"
              disabled={!ledgerData?.data.length}
              onClick={() =>
                ledgerData &&
                exportLedgerToExcel(ledgerData.data, `${title.toLowerCase().replace(/\s+/g, "-")}.xlsx`)
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

      <SummaryReportCard data={summary} isLoading={isLoading} />
    </div>
  );
}
