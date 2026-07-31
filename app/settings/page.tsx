"use client";

import * as React from "react";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { TopNav } from "@/components/layout/topnav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { reportsService } from "@/services/reports.service";

export default function SettingsPage() {
  const [status, setStatus] = React.useState<"idle" | "checking" | "ok" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const testConnection = async () => {
    setStatus("checking");
    try {
      await reportsService.dashboard();
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Gagal terhubung");
    }
  };

  return (
    <div className="pb-10">
      <TopNav title="Pengaturan" description="Konfigurasi koneksi dan informasi aplikasi" />
      <div className="max-w-2xl space-y-4 px-4 py-6 sm:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-foreground">
              Koneksi Google Apps Script
            </CardTitle>
            <CardDescription>
              Aplikasi ini membaca dan menulis data melalui Google Apps Script yang terhubung ke
              Google Spreadsheet. Lihat <code>docs/SETUP.md</code> untuk panduan konfigurasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <span className="text-sm text-muted-foreground">
                NEXT_PUBLIC_GAS_API_URL
              </span>
              <Badge variant={process.env.NEXT_PUBLIC_GAS_API_URL ? "success" : "destructive"}>
                {process.env.NEXT_PUBLIC_GAS_API_URL ? "Terkonfigurasi" : "Belum diset"}
              </Badge>
            </div>
            <Button variant="outline" onClick={testConnection} disabled={status === "checking"}>
              <RefreshCw className={`h-4 w-4 ${status === "checking" ? "animate-spin" : ""}`} />
              Tes Koneksi
            </Button>
            {status === "ok" && (
              <p className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" /> Berhasil terhubung ke Apps Script.
              </p>
            )}
            {status === "error" && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> {errorMessage}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base text-foreground">Tentang Aplikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Kas &amp; Tabungan Siswa v1.0.0</p>
            <p>Dibangun dengan Next.js 15, TypeScript, TailwindCSS, dan Google Apps Script.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
