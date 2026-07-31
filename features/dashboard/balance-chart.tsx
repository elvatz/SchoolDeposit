"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

export function BalanceChart({ data, isLoading }: { data?: DashboardSummary; isLoading: boolean }) {
  const chartData = [
    { name: "Tabungan", total: data?.totalTabungan ?? 0 },
    { name: "Kas", total: data?.totalKas ?? 0 },
    { name: "Penarikan", total: data?.totalWithdrawal ?? 0 },
    { name: "Belanja", total: data?.totalBelanja ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground font-display text-base">
          Ringkasan Saldo per Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(v) => formatCurrency(v).replace("Rp", "")}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--brass))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
