import { TopNav } from "@/components/layout/topnav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummaryReportTab } from "@/features/reports/summary-report-tab";
import { StudentReportTab } from "@/features/reports/student-report-tab";
import { MonthlyMatrixTab } from "@/features/reports/monthly-matrix-tab";

export default function ReportsPage() {
  return (
    <div className="pb-10">
      <TopNav title="Laporan" description="Laporan ringkasan, per siswa, dan iuran bulanan" />
      <div className="px-4 py-6 sm:px-8">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Ringkasan &amp; Bulanan</TabsTrigger>
            <TabsTrigger value="student">Per Siswa</TabsTrigger>
            <TabsTrigger value="matrix">Iuran Bulanan</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <SummaryReportTab />
          </TabsContent>
          <TabsContent value="student">
            <StudentReportTab />
          </TabsContent>
          <TabsContent value="matrix">
            <MonthlyMatrixTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
