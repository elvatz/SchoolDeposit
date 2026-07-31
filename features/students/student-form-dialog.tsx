"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { studentSchema, type StudentFormValues } from "@/lib/validations";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import type { Student } from "@/types";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEdit = Boolean(student);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: { nis: "", name: "", class: "" },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        student
          ? { nis: student.nis, name: student.name, class: student.class }
          : { nis: "", name: "", class: "" }
      );
    }
  }, [open, student, reset]);

  const isPending = createStudent.isPending || updateStudent.isPending;

  const onSubmit = async (values: StudentFormValues) => {
    if (isEdit && student) {
      await updateStudent.mutateAsync({ id: student.id, input: values });
    } else {
      await createStudent.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui data siswa di bawah ini."
              : "Lengkapi data siswa baru untuk ditambahkan ke sistem."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nis">NIS</Label>
            <Input id="nis" placeholder="Contoh: 2024001" {...register("nis")} />
            {errors.nis && <p className="text-xs text-destructive">{errors.nis.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" placeholder="Nama lengkap siswa" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Kelas</Label>
            <Input id="class" placeholder="Contoh: 6A" {...register("class")} />
            {errors.class && <p className="text-xs text-destructive">{errors.class.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
