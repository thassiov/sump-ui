import { api } from "./client";
import type {
  TenantAccount,
  CreateTenantAccountRequest,
  CreateTenantAccountResponse,
  UpdateTenantAccountRequest,
  UserDefinedIdentificationRequest,
} from "@/types";

export const tenantAccountsApi = {
  /**
   * Create a new account for a tenant
   */
  create: (
    tenantId: string,
    data: CreateTenantAccountRequest
  ): Promise<CreateTenantAccountResponse> =>
    api.post(`/tenants/${tenantId}/accounts`, data),

  /**
   * Get all accounts for a tenant
   */
  getAll: (tenantId: string): Promise<TenantAccount[]> =>
    api.get(`/tenants/${tenantId}/accounts`),

  /**
   * Get account by ID
   */
  get: (tenantId: string, accountId: string): Promise<TenantAccount> =>
    api.get(`/tenants/${tenantId}/accounts/${accountId}`),

  /**
   * Get account by user-defined identification (email, phone, or username)
   */
  getByIdentification: (
    tenantId: string,
    identification: UserDefinedIdentificationRequest
  ): Promise<TenantAccount> =>
    api.get(`/tenants/${tenantId}/accounts/user-defined-identification`, {
      body: identification,
    }),

  /**
   * Update account non-sensitive properties
   */
  update: (
    tenantId: string,
    accountId: string,
    data: UpdateTenantAccountRequest
  ): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}`, data),

  /**
   * Update account email
   */
  updateEmail: (
    tenantId: string,
    accountId: string,
    email: string
  ): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}/email`, { email }),

  /**
   * Update account phone
   */
  updatePhone: (
    tenantId: string,
    accountId: string,
    phone: string
  ): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}/phone`, { phone }),

  /**
   * Update account username
   */
  updateUsername: (
    tenantId: string,
    accountId: string,
    username: string
  ): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}/username`, { username }),

  /**
   * Disable an account
   */
  disable: (tenantId: string, accountId: string): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}/disable`),

  /**
   * Enable a disabled account
   */
  enable: (tenantId: string, accountId: string): Promise<TenantAccount> =>
    api.patch(`/tenants/${tenantId}/accounts/${accountId}/enable`),

  /**
   * Delete account
   */
  delete: (tenantId: string, accountId: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/accounts/${accountId}`),
};
