import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import { formatCurrency, formatDate, isCreditType, transactionBadgeVariant } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

export function RecentTransactionsCard({
  data,
  isLoading,
}: {
  data?: DashboardSummary;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground font-display text-base">
          Transaksi Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : !data?.recentTransactions.length ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada transaksi"
            description="Transaksi yang baru dicatat akan muncul di sini."
          />
        ) : (
          data.recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{tx.studentName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(tx.date)} · {tx.account} · {tx.description}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-tabular text-sm font-semibold ${
                    tx.transactionType === "Deposit" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {isCreditType(tx.transactionType) ? "-" : "+"}
                  {formatCurrency(tx.amount)}
                </p>
                <Badge variant={transactionBadgeVariant(tx.transactionType)}>
                  {tx.transactionType}
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
