"use client";

import { TenantProvider } from "@/contexts/tenant-context";
import { AuthProvider } from "@/contexts/auth-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>{children}</AuthProvider>
    </TenantProvider>
  );
}
