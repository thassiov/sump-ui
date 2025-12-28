"use client";

/* eslint-disable react-hooks/set-state-in-effect */
// This rule is disabled because the hydration pattern here is intentional
// and the setState in useEffect is the standard way to sync with localStorage

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_ID_KEY = "sump_tenant_id";

// Helper to safely read from localStorage (SSR-safe)
function getStoredTenantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TENANT_ID_KEY);
}

export function TenantProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage using lazy initial state
  const [tenantId, setTenantIdState] = useState<string | null>(getStoredTenantId);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark hydrated after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const setTenantId = useCallback((id: string | null) => {
    setTenantIdState(id);
    if (id) {
      localStorage.setItem(TENANT_ID_KEY, id);
    } else {
      localStorage.removeItem(TENANT_ID_KEY);
    }
  }, []);

  const clearTenant = useCallback(() => {
    setTenantIdState(null);
    localStorage.removeItem(TENANT_ID_KEY);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isHydrated) {
    return null;
  }

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, clearTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
