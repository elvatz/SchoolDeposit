"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services/students.service";
import type { StudentInput } from "@/types";
import { toast } from "@/hooks/use-toast";

const KEY = "students";

export function useStudents(search?: string) {
  return useQuery({
    queryKey: [KEY, search ?? ""],
    queryFn: () => studentsService.list(search),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => studentsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast({ title: "Siswa ditambahkan", variant: "success" });
    },
    onError: (err: Error) =>
      toast({ title: "Gagal menambah siswa", description: err.message, variant: "destructive" }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentInput }) =>
      studentsService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast({ title: "Data siswa diperbarui", variant: "success" });
    },
    onError: (err: Error) =>
      toast({ title: "Gagal memperbarui siswa", description: err.message, variant: "destructive" }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast({ title: "Siswa dihapus", variant: "success" });
    },
    onError: (err: Error) =>
      toast({ title: "Gagal menghapus siswa", description: err.message, variant: "destructive" }),
  });
}
