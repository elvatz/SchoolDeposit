import { TopNav } from "@/components/layout/topnav";
import { StudentLedgerView } from "@/features/ledger/student-ledger-view";

export default async function StudentLedgerPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <div className="pb-10">
      <TopNav title="Buku Besar Siswa" description="Detail saldo dan riwayat transaksi per siswa" />
      <div className="px-4 py-6 sm:px-8">
        <StudentLedgerView studentId={studentId} />
      </div>
    </div>
  );
}
