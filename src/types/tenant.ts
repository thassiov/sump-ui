export interface TenantEnvironmentSummary {
  id: string;
  name: string;
}

export interface Tenant {
  id: string;
  name: string;
  customProperties: Record<string, unknown>;
  environments?: TenantEnvironmentSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  tenant: {
    name: string;
    customProperties?: Record<string, unknown>;
  };
  account: {
    name: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
  };
  environment?: {
    name: string;
    customProperties?: Record<string, unknown>;
  };
}

export interface CreateTenantResponse {
  tenantId: string;
  accountId: string;
  environmentId: string;
  session: Session;
}

export interface UpdateTenantRequest {
  name?: string;
}

// Re-export session here for convenience
import type { Session } from "./session";
