"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/components/providers";

const GUEST_ALLOWED_PATHS = ["/dashboard", "/reports"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, hydrated } = useAuth();

  React.useEffect(() => {
    if (!hydrated) return;
    if (pathname === "/login") return;
    if (!role) {
      router.replace("/login");
      return;
    }
    if (
      role === "guest" &&
      !GUEST_ALLOWED_PATHS.some((allowedPath) => pathname === allowedPath || pathname.startsWith(`${allowedPath}/`))
    ) {
      router.replace("/dashboard");
    }
  }, [hydrated, pathname, role, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!role) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
