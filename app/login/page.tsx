"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers";

export default function LoginPage() {
  const router = useRouter();
  const { role, hydrated, loginAsAdmin, loginAsGuest } = useAuth();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!hydrated) return;
    if (role) {
      router.replace("/dashboard");
    }
  }, [hydrated, role, router]);

  const handleAdminLogin = () => {
    const ok = loginAsAdmin(password);
    if (!ok) {
      setError("Password admin tidak valid.");
      return;
    }
    setError("");
    router.replace("/dashboard");
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    router.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="font-display text-2xl">Aplikasi Kas Kelas</CardTitle>
          <CardDescription>
            Masuk sebagai admin dengan password, atau lanjutkan sebagai tamu dengan akses terbatas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password Admin</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password admin"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={handleAdminLogin}>
            MASUK SEBAGAI ADMIN
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGuestLogin}>
            MASUK SEBAGAI TAMU
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
