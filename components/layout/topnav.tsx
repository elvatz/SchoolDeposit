"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers";

export function TopNav({ title, description }: { title: string; description?: string }) {
  const router = useRouter();
  const { role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2">
        <MobileNav />
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {role && (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
