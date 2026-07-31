import { apiClient } from "@/services/api-client";
import type { Student, StudentInput } from "@/types";

export const studentsService = {
  list: (search?: string) =>
    apiClient.get<Student[]>("students", { search }),

  get: (id: string) => apiClient.get<Student>("students", { id }),

  create: (input: StudentInput) =>
    apiClient.mutate<Student>("students", "create", input),

  update: (id: string, input: StudentInput) =>
    apiClient.mutate<Student>("students", "update", { id, ...input }),

  remove: (id: string) =>
    apiClient.mutate<{ id: string }>("students", "delete", { id }),
};
