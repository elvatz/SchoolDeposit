import { Sidebar } from "@/components/layout/sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  );
}
