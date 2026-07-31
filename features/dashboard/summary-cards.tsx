import { Users, PiggyBank, Wallet, ArrowDownCircle, ShoppingCart, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

interface SummaryCardsProps {
  data?: DashboardSummary;
  isLoading: boolean;
}

const CARD_META = [
  { key: "totalStudents", label: "Total Siswa", icon: Users, format: (v: number) => v.toString() },
  { key: "totalTabungan", label: "Total Tabungan", icon: PiggyBank, format: formatCurrency },
  { key: "totalKas", label: "Total Kas", icon: Wallet, format: formatCurrency },
  { key: "totalWithdrawal", label: "Total Penarikan", icon: ArrowDownCircle, format: formatCurrency },
  { key: "totalBelanja", label: "Total Belanja", icon: ShoppingCart, format: formatCurrency },
  { key: "totalSaldo", label: "Total Saldo", icon: Landmark, format: formatCurrency },
] as const;

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {CARD_META.map(({ key, label, icon: Icon, format }) => (
        <Card key={key} className="relative overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle>{label}</CardTitle>
            <Icon className="h-4 w-4 text-brass" />
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className="font-display text-2xl font-semibold text-foreground font-tabular">
                {format(data ? data[key] : 0)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
