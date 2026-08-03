"use client";

import * as React from "react";
import { TopNav } from "@/components/layout/topnav";
import { Card, CardContent } from "@/components/ui/card";
import { LedgerFilterBar } from "@/features/ledger/ledger-filter-bar";
import { LedgerTable } from "@/features/ledger/ledger-table";
import { useLedger } from "@/hooks/use-ledger";
import { exportLedgerToExcel } from "@/lib/export";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { LedgerFilters } from "@/types";

export default function LedgerPage() {
  const [filters, setFilters] = React.useState<LedgerFilters>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: "date",
    sortDir: "desc",
    account: "all",
  });

  const { data, isLoading } = useLedger(filters);
  const { data: exportData } = useLedger({ ...filters, page: 1, pageSize: 10000 });

  return (
    <div className="pb-10">
      <TopNav title="Buku Besar" description="Seluruh transaksi tabungan dan kas siswa" />
      <div className="space-y-4 px-4 py-6 sm:px-8">
        <Card>
          <CardContent className="pt-5">
            <LedgerFilterBar
              filters={filters}
              onChange={setFilters}
              onExportExcel={() => exportData && exportLedgerToExcel(exportData.data, "buku-besar.xlsx")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <LedgerTable data={data} isLoading={isLoading} filters={filters} onChange={setFilters} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
