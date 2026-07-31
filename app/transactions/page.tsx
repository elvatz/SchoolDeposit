"use client";

import { TopNav } from "@/components/layout/topnav";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import { formatCurrency, formatDate, isCreditType, transactionBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLedger } from "@/hooks/use-ledger";

export default function TransactionsPage() {
  const { data, isLoading } = useLedger({ page: 1, pageSize: 5, sortBy: "date", sortDir: "desc" });

  return (
    <div className="pb-10">
      <TopNav title="Transaksi" description="Catat setoran, pembayaran kas, dan penarikan" />
      <div className="grid grid-cols-1 gap-6 px-4 py-6 sm:px-8 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TransactionForm />
        </div>
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base text-foreground">
                5 Transaksi Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
              ) : !data?.data.length ? (
                <EmptyState icon={Receipt} title="Belum ada transaksi" />
              ) : (
                data.data.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)} · {tx.account}
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
        </div>
      </div>
    </div>
  );
}
