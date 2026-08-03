import type { LedgerEntry, LedgerEntryWithBalance } from "@/types";
import { formatDate } from "@/lib/utils";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportLedgerToCsv(entries: LedgerEntry[], filename = "buku-besar.csv") {
  const header = ["Tanggal", "Siswa", "Account", "Jenis", "Nominal", "Keterangan"];
  const rows = entries.map((e) => [
    formatDate(e.date),
    e.studentName,
    e.account,
    e.transactionType,
    e.amount.toString(),
    e.description.replace(/,/g, ";"),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export async function exportLedgerToExcel(
  entries: Array<LedgerEntry | LedgerEntryWithBalance>,
  filename = "buku-besar.xlsx"
) {
  const XLSX = await import("xlsx");

  const rows: Array<Record<string, string | number>> = entries.map((entry) => {
    const hasBalance = "debit" in entry && "credit" in entry && "runningBalance" in entry;
    const debit = hasBalance ? entry.debit : entry.transactionType === "Deposit" ? entry.amount : 0;
    const credit = hasBalance
      ? entry.credit
      : entry.transactionType === "Withdrawal" || entry.transactionType === "Belanja"
        ? entry.amount
        : 0;
    const runningBalance = hasBalance ? entry.runningBalance : 0;

    return {
      Tanggal: formatDate(entry.date),
      Siswa: entry.studentName,
      Account: entry.account,
      Jenis: entry.transactionType,
      Debit: debit,
      Kredit: credit,
      Saldo: runningBalance,
      Keterangan: entry.description,
    };
  });

  let totalDebit = 0;
  let totalCredit = 0;
  let totalSaldo = 0;

  for (const row of rows) {
    totalDebit += Number(row.Debit ?? 0);
    totalCredit += Number(row.Kredit ?? 0);
    totalSaldo = Number(row.Saldo ?? 0);
  }

  rows.push({
    Tanggal: "TOTAL",
    Siswa: "",
    Account: "",
    Jenis: "",
    Debit: totalDebit,
    Kredit: totalCredit,
    Saldo: totalSaldo,
    Keterangan: "",
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Besar");
  XLSX.writeFile(workbook, filename);
}

export async function exportLedgerToPdf(
  entries: LedgerEntry[],
  title: string,
  filename = "buku-besar.pdf"
) {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(title, 14, 16);

  // @ts-expect-error - autotable plugin attaches to jsPDF prototype at runtime
  doc.autoTable({
    startY: 22,
    head: [["Tanggal", "Siswa", "Account", "Jenis", "Nominal", "Keterangan"]],
    body: entries.map((e) => [
      formatDate(e.date),
      e.studentName,
      e.account,
      e.transactionType,
      e.amount.toLocaleString("id-ID"),
      e.description,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [31, 74, 61] },
  });

  doc.save(filename);
}
