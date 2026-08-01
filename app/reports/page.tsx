import { TopNav } from "@/components/layout/topnav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryReportTab } from "@/features/reports/summary-report-tab";
import { StudentReportTab } from "@/features/reports/student-report-tab";
import { MonthlyMatrixTab } from "@/features/reports/monthly-matrix-tab";
import { ExpenseReportTab } from "@/features/reports/expense-report-tab";

export default function ReportsPage() {
  return (
    <div className="pb-10">
      <TopNav title="Laporan" description="Laporan ringkasan, per siswa, iuran bulanan, dan belanja" />
      <div className="px-4 py-6 sm:px-8">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Ringkasan &amp; Bulanan</TabsTrigger>
            <TabsTrigger value="matrix">Iuran Bulanan</TabsTrigger>
            <TabsTrigger value="expense">Laporan Belanja</TabsTrigger>
            <TabsTrigger value="student">Laporan Per Siswa</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <SummaryReportTab />
          </TabsContent>
          <TabsContent value="matrix">
            <MonthlyMatrixTab />
          </TabsContent>
          <TabsContent value="expense">
            <ExpenseReportTab />
          </TabsContent>
          <TabsContent value="student">
            <StudentReportTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
