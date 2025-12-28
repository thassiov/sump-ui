"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi, ApiError } from "@/lib/api";
import { useTenant } from "./tenant-context";
import type { Session, TenantAccount } from "@/types";

interface AuthContextType {
  session: Session | null;
  account: TenantAccount | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, overrideTenantId?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { tenantId, clearTenant } = useTenant();
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<TenantAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async (): Promise<boolean> => {
    if (!tenantId) {
      setSession(null);
      setAccount(null);
      setIsLoading(false);
      return false;
    }

    try {
      const sessionData = await authApi.getSession(tenantId);
      setSession(sessionData);
      // TODO: Fetch account details if needed
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        setSession(null);
        setAccount(null);
        return false;
      }
      console.error("Failed to check session:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Check session on mount and when tenantId changes
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(
    async (identifier: string, password: string, overrideTenantId?: string) => {
      // Use override if provided (fixes race condition when setting tenant and logging in)
      const effectiveTenantId = overrideTenantId || tenantId;

      if (!effectiveTenantId) {
        throw new Error("No tenant selected");
      }

      // Determine identifier type and build the correct request
      const isEmail = identifier.includes("@");
      const isPhone = identifier.startsWith("+") || /^\d{10,}$/.test(identifier);

      const credentials = isEmail
        ? { email: identifier, password }
        : isPhone
          ? { phone: identifier, password }
          : { username: identifier, password };

      const response = await authApi.login(effectiveTenantId, credentials);
      setSession(response.session);
      // Account details would be fetched separately if needed
    },
    [tenantId]
  );

  const logout = useCallback(async () => {
    if (!tenantId) return;

    try {
      await authApi.logout(tenantId);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setSession(null);
      setAccount(null);
    }
  }, [tenantId]);

  return (
    <AuthContext.Provider
      value={{
        session,
        account,
        isLoading,
        isAuthenticated: !!session,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
