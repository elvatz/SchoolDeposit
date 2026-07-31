import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { ReportSummary } from "@/types";

export function SummaryReportCard({ data, isLoading }: { data?: ReportSummary; isLoading: boolean }) {
  const rows = [
    { label: "Total Tabungan", value: data?.totalTabungan ?? 0 },
    { label: "Total Kas", value: data?.totalKas ?? 0 },
    { label: "Total Penarikan", value: data?.totalWithdrawal ?? 0 },
    { label: "Total Belanja", value: data?.totalBelanja ?? 0 },
    { label: "Saldo", value: data?.saldo ?? 0, emphasize: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base text-foreground">Ringkasan Laporan</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            {isLoading ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <span
                className={`font-tabular font-display text-lg font-semibold ${
                  row.emphasize ? "text-brass" : "text-foreground"
                }`}
              >
                {formatCurrency(row.value)}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
