import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

export function TopNav({ title, description }: { title: string; description?: string }) {
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
      <ThemeToggle />
    </header>
  );
}
