import { api } from "./client";
import type {
  Tenant,
  CreateTenantRequest,
  CreateTenantResponse,
  UpdateTenantRequest,
  TenantAccount,
} from "@/types";

export const tenantsApi = {
  /**
   * Create a new tenant with owner account and optional environment
   */
  create: (data: CreateTenantRequest): Promise<CreateTenantResponse> =>
    api.post("/tenants", data),

  /**
   * Get tenant details
   */
  get: (tenantId: string): Promise<Tenant> =>
    api.get(`/tenants/${tenantId}`),

  /**
   * Update tenant
   */
  update: (tenantId: string, data: UpdateTenantRequest): Promise<Tenant> =>
    api.patch(`/tenants/${tenantId}`, data),

  /**
   * Delete tenant
   */
  delete: (tenantId: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}`),

  /**
   * Set a custom property on the tenant
   * The body should contain the key-value pair directly
   */
  setCustomProperty: (
    tenantId: string,
    key: string,
    value: unknown
  ): Promise<Tenant> =>
    api.patch(`/tenants/${tenantId}/custom-property`, { [key]: value }),

  /**
   * Delete a custom property from the tenant
   */
  deleteCustomProperty: (tenantId: string, key: string): Promise<void> =>
    api.deleteWithBody(`/tenants/${tenantId}/custom-property`, { customProperty: key }),

  /**
   * Get all tenant accounts
   */
  getAccounts: (tenantId: string): Promise<TenantAccount[]> =>
    api.get(`/tenants/${tenantId}/accounts`),
};
