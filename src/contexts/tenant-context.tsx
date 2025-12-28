"use client";

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

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TENANT_ID_KEY);
    if (stored) {
      setTenantIdState(stored);
    }
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
