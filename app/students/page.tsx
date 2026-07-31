"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { TopNav } from "@/components/layout/topnav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentsTable } from "@/features/students/students-table";
import { StudentFormDialog } from "@/features/students/student-form-dialog";
import { useStudents } from "@/hooks/use-students";
import type { Student } from "@/types";

export default function StudentsPage() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: students = [], isLoading } = useStudents(debouncedSearch);

  return (
    <div className="pb-10">
      <TopNav title="Siswa" description="Kelola data siswa yang tercatat dalam sistem" />
      <div className="space-y-4 px-4 py-6 sm:px-8">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIS..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                setEditingStudent(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Tambah Siswa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <StudentsTable
              students={students}
              isLoading={isLoading}
              onEdit={(student) => {
                setEditingStudent(student);
                setDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <StudentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} student={editingStudent} />
    </div>
  );
}
