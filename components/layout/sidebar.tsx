"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BookOpen,
  FileBarChart,
  Settings,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SealMark } from "@/components/layout/seal-mark";
import { useAuth } from "@/components/providers";

const ICONS = {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BookOpen,
  FileBarChart,
  Settings,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const visibleItems =
    role === "guest"
      ? NAV_ITEMS.filter((item) => item.href === "/dashboard" || item.href === "/reports")
      : NAV_ITEMS;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-ledger text-ledger-foreground lg:flex">
      <div className="flex items-center gap-3 border-b border-ledger-foreground/10 px-5 py-6">
        <SealMark className="h-10 w-10 shrink-0 text-brass" />
        <div className="leading-tight">
          <p className="font-display text-base font-semibold">Kas &amp; Tabungan</p>
          <p className="text-xs text-ledger-foreground/60">Buku Besar Siswa</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-ledger-foreground/10 text-brass"
                  : "text-ledger-foreground/75 hover:bg-ledger-foreground/5 hover:text-ledger-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ledger-foreground/10 px-5 py-4 text-xs text-ledger-foreground/50">
        Saldo dihitung realtime dari Buku Besar.
      </div>
    </aside>
  );
}
