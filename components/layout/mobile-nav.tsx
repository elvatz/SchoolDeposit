"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BookOpen,
  FileBarChart,
  Settings,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SealMark } from "@/components/layout/seal-mark";

const ICONS = {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  BookOpen,
  FileBarChart,
  Settings,
} as const;

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 h-full max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r border-l-0 border-y-0 bg-ledger p-0 text-ledger-foreground data-[state=open]:animate-fade-in">
          <DialogTitle className="sr-only">Menu Navigasi</DialogTitle>
          <div className="flex items-center gap-3 border-b border-ledger-foreground/10 px-5 py-6">
            <SealMark className="h-9 w-9 text-brass" />
            <p className="font-display text-base font-semibold">Kas &amp; Tabungan</p>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon];
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-ledger-foreground/10 text-brass"
                      : "text-ledger-foreground/75 hover:bg-ledger-foreground/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
