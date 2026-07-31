"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations";
import { useStudents } from "@/hooks/use-students";
import { useCreateLedgerEntry } from "@/hooks/use-ledger";
import { formatCurrency, monthName, todayISO } from "@/lib/utils";

const currentDate = new Date();
const CURRENT_MONTH = currentDate.getMonth() + 1;
const CURRENT_YEAR = currentDate.getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i);

const DEFAULT_VALUES: TransactionFormValues = {
  date: todayISO(),
  studentId: "",
  account: "Tabungan",
  transactionType: "Deposit",
  amount: 0,
  description: "",
  periods: [{ month: CURRENT_MONTH, year: CURRENT_YEAR }],
};

export function TransactionForm() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const createEntry = useCreateLedgerEntry();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "periods" });

  const transactionType = watch("transactionType");
  const amount = watch("amount");
  const isDeposit = transactionType === "Deposit";
  const isBelanja = transactionType === "Belanja";
  const isWithdrawal = transactionType === "Withdrawal";

  // Account is dictated by the transaction type: Withdrawal always draws
  // from Tabungan (personal savings), Belanja always draws from Kas
  // (shared class fund) and drops the per-student field entirely.
  React.useEffect(() => {
    if (isWithdrawal) {
      setValue("account", "Tabungan");
    } else if (isBelanja) {
      setValue("account", "Kas");
      setValue("studentId", "");
    }
  }, [isWithdrawal, isBelanja, setValue]);

  React.useEffect(() => {
    if (isDeposit && fields.length === 0) {
      append({ month: CURRENT_MONTH, year: CURRENT_YEAR });
    }
  }, [isDeposit, fields.length, append]);

  const addNextMonth = () => {
    const last = fields[fields.length - 1];
    let month = last ? last.month + 1 : CURRENT_MONTH;
    let year = last ? last.year : CURRENT_YEAR;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    append({ month, year });
  };

  const perMonthAmount = isDeposit && fields.length > 0 ? Math.floor((amount || 0) / fields.length) : 0;

  const onSubmit = async (values: TransactionFormValues) => {
    await createEntry.mutateAsync({
      ...values,
      studentId: values.transactionType === "Belanja" ? "" : values.studentId,
      periods: values.transactionType === "Deposit" ? values.periods : [],
    });
    reset(DEFAULT_VALUES);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base text-foreground">Catat Transaksi Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Jenis Transaksi</Label>
              <Controller
                control={control}
                name="transactionType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deposit">Deposit (Setor)</SelectItem>
                      <SelectItem value="Withdrawal">Withdrawal (Ambil Tabungan)</SelectItem>
                      <SelectItem value="Belanja">Belanja (Pengeluaran Kas Kelas)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {isBelanja ? (
            <div className="rounded-md border border-brass/30 bg-brass/10 px-4 py-3 text-sm text-foreground">
              Transaksi ini adalah <span className="font-medium">pengeluaran Kas kelas</span> dan
              tidak dikaitkan dengan siswa tertentu — Kas dipakai dan dihitung bersama, terpisah
              dari saldo Tabungan masing-masing siswa.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Siswa</Label>
                <Controller
                  control={control}
                  name="studentId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={studentsLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} · {s.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.studentId && (
                  <p className="text-xs text-destructive">{errors.studentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account</Label>
                {isWithdrawal ? (
                  <div className="flex h-10 items-center justify-between rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                    Tabungan
                    <span className="text-xs italic">otomatis</span>
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="account"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tabungan">Tabungan</SelectItem>
                          <SelectItem value="Kas">Kas</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {isDeposit && fields.length > 1 ? "Nominal Total (Rp)" : "Nominal (Rp)"}
              </Label>
              <Input id="amount" type="number" min={1} step={1} {...register("amount")} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Keterangan</Label>
              <Input
                id="description"
                placeholder={
                  isBelanja ? "Contoh: Beli alat kebersihan kelas" : "Contoh: Setor tabungan mingguan"
                }
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {isDeposit && (
            <div className="space-y-3 rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <Label>Periode Iuran (bulan yang dibayar)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addNextMonth}>
                  <Plus className="h-3.5 w-3.5" /> Tambah Bulan
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`periods.${index}.month`}
                      render={({ field: monthField }) => (
                        <Select
                          value={String(monthField.value)}
                          onValueChange={(v) => monthField.onChange(Number(v))}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <SelectItem key={m} value={String(m)}>
                                {monthName(m)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Controller
                      control={control}
                      name={`periods.${index}.year`}
                      render={({ field: yearField }) => (
                        <Select
                          value={String(yearField.value)}
                          onValueChange={(v) => yearField.onChange(Number(v))}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {YEAR_OPTIONS.map((y) => (
                              <SelectItem key={y} value={String(y)}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.periods && (
                <p className="text-xs text-destructive">
                  {(errors.periods as { message?: string }).message ?? "Periode tidak valid"}
                </p>
              )}

              {fields.length > 1 && amount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total {formatCurrency(amount)} akan dibagi rata ke {fields.length} bulan — setiap
                  bulan tercatat sebesar sekitar <span className="font-medium text-foreground">{formatCurrency(perMonthAmount)}</span>.
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={createEntry.isPending} className="w-full sm:w-auto">
            {createEntry.isPending ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
