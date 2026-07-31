import type { LedgerEntry } from "@/types";
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

export async function exportLedgerToExcel(entries: LedgerEntry[], filename = "buku-besar.xlsx") {
  const XLSX = await import("xlsx");
  const rows = entries.map((e) => ({
    Tanggal: formatDate(e.date),
    Siswa: e.studentName,
    Account: e.account,
    Jenis: e.transactionType,
    Nominal: e.amount,
    Keterangan: e.description,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
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
