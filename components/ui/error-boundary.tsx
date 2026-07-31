"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Terjadi kesalahan tak terduga:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-10 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-display text-base font-medium">Terjadi kesalahan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Halaman gagal dimuat. Silakan muat ulang halaman ini.
            </p>
          </div>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            Coba Lagi
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
