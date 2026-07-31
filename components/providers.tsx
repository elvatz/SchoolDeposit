"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { AuthRole } from "@/types";

const AUTH_ROLE_KEY = "schooldeposit-auth-role";
const AUTH_PASSWORD_KEY = "schooldeposit-auth-password";
const DEFAULT_ADMIN_PASSWORD = "5akhinaraM!";

interface AuthContextValue {
  role: AuthRole | null;
  hydrated: boolean;
  adminPassword: string;
  loginAsAdmin: (password: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
  setAdminPassword: (password: string) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <Providers>");
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [role, setRole] = React.useState<AuthRole | null>(null);
  const [adminPassword, setAdminPasswordState] = React.useState(DEFAULT_ADMIN_PASSWORD);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const savedRole = window.localStorage.getItem(AUTH_ROLE_KEY) as AuthRole | null;
    const savedPassword = window.localStorage.getItem(AUTH_PASSWORD_KEY);

    const loadDefaultPassword = async () => {
      try {
        const response = await fetch("/auth-config.json", { cache: "no-store" });
        const payload = (await response.json()) as { defaultAdminPassword?: string };
        const fallbackPassword = payload.defaultAdminPassword ?? DEFAULT_ADMIN_PASSWORD;
        const currentPassword = savedPassword ?? fallbackPassword;
        setAdminPasswordState(currentPassword);
        window.localStorage.setItem(AUTH_PASSWORD_KEY, currentPassword);
        if (savedRole === "admin" || savedRole === "guest") {
          setRole(savedRole);
        }
      } catch {
        const currentPassword = savedPassword ?? DEFAULT_ADMIN_PASSWORD;
        setAdminPasswordState(currentPassword);
        window.localStorage.setItem(AUTH_PASSWORD_KEY, currentPassword);
        if (savedRole === "admin" || savedRole === "guest") {
          setRole(savedRole);
        }
      } finally {
        setHydrated(true);
      }
    };

    void loadDefaultPassword();
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (role) {
      window.localStorage.setItem(AUTH_ROLE_KEY, role);
    } else {
      window.localStorage.removeItem(AUTH_ROLE_KEY);
    }
  }, [role, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(AUTH_PASSWORD_KEY, adminPassword);
  }, [adminPassword, hydrated]);

  const loginAsAdmin = (password: string) => {
    if (password === adminPassword) {
      setRole("admin");
      return true;
    }
    return false;
  };

  const loginAsGuest = () => {
    setRole("guest");
  };

  const logout = () => {
    setRole(null);
  };

  const setAdminPassword = (password: string) => {
    setAdminPasswordState(password.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        hydrated,
        adminPassword,
        loginAsAdmin,
        loginAsGuest,
        logout,
        setAdminPassword,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
