import type { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_GAS_API_URL;

if (!BASE_URL && typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_GAS_API_URL belum diset. Lihat docs/SETUP.md untuk konfigurasi Google Apps Script."
  );
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

/**
 * Google Apps Script web apps only reliably support GET and POST.
 * We route all writes (create/update/delete) through POST with an
 * `action` field, and reads through GET query params.
 */
async function request<T>(
  method: "GET" | "POST",
  resource: string,
  options: RequestOptions = {}
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError(
      "URL Google Apps Script belum dikonfigurasi (NEXT_PUBLIC_GAS_API_URL)."
    );
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("resource", resource);

  if (method === "GET" && options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const init: RequestInit = { method };

  if (method === "POST") {
    init.headers = { "Content-Type": "text/plain;charset=utf-8" };
    init.body = JSON.stringify({ resource, ...(options.body as object) });
  }

  const res = await fetch(url.toString(), init);

  if (!res.ok) {
    throw new ApiError(`Permintaan gagal (${res.status})`, res.status);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(json.error ?? "Terjadi kesalahan pada server");
  }

  return json.data as T;
}

export const apiClient = {
  get: <T>(resource: string, params?: RequestOptions["params"]) =>
    request<T>("GET", resource, { params }),
  mutate: <T>(resource: string, action: string, body?: unknown) =>
    request<T>("POST", resource, { body: { action, ...(body as object) } }),
};
