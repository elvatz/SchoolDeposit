import { z } from "zod";

export const studentSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  class: z.string().min(1, "Kelas wajib diisi"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

const periodSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});

export const transactionSchema = z
  .object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    studentId: z.string().optional().default(""),
    account: z.enum(["Tabungan", "Kas"], {
      required_error: "Account wajib dipilih",
    }),
    transactionType: z.enum(["Deposit", "Withdrawal", "Belanja"], {
      required_error: "Jenis transaksi wajib dipilih",
    }),
    amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
    description: z.string().min(1, "Keterangan wajib diisi"),
    periods: z.array(periodSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.transactionType === "Belanja") {
      if (data.account !== "Kas") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["account"],
          message: "Belanja hanya berlaku untuk account Kas",
        });
      }
      return;
    }

    if (!data.studentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentId"],
        message: "Siswa wajib dipilih",
      });
    }

    if (data.transactionType === "Withdrawal" && data.account !== "Tabungan") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["account"],
        message: "Withdrawal hanya berlaku untuk account Tabungan",
      });
    }

    if (data.transactionType === "Deposit" && data.periods.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periods"],
        message: "Pilih minimal satu periode bulan untuk Deposit",
      });
    }
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
