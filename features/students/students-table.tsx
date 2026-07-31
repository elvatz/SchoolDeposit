"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, BookOpen, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteStudent } from "@/hooks/use-students";
import type { Student } from "@/types";

interface StudentsTableProps {
  students: Student[];
  isLoading: boolean;
  onEdit: (student: Student) => void;
}

export function StudentsTable({ students, isLoading, onEdit }: StudentsTableProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<Student | null>(null);
  const deleteStudent = useDeleteStudent();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!students.length) {
    return (
      <EmptyState
        icon={Users}
        title="Belum ada siswa"
        description="Tambahkan siswa pertama untuk mulai mencatat tabungan dan kas."
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIS</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-tabular">{student.nis}</TableCell>
              <TableCell className="font-medium text-foreground">
                <Link href={`/ledger/${student.id}`} className="hover:text-brass hover:underline">
                  {student.name}
                </Link>
              </TableCell>
              <TableCell>{student.class}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/ledger/${student.id}`}>
                        <BookOpen className="h-4 w-4" /> Lihat Buku Besar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(student)}>
                      <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(student)}
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus siswa ini?"
        description={`Data siswa "${deleteTarget?.name}" akan dihapus permanen. Riwayat transaksi pada Buku Besar tidak akan terhapus.`}
        loading={deleteStudent.isPending}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteStudent.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
