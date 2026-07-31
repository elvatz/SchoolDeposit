"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";

export default function RootPage() {
  const router = useRouter();
  const { role, hydrated } = useAuth();

  React.useEffect(() => {
    if (!hydrated) return;
    router.replace(role ? "/dashboard" : "/login");
  }, [hydrated, role, router]);

  return null;
}
