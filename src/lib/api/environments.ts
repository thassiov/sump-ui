import { api } from "./client";
import type {
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
} from "@/types";

export const environmentsApi = {
  /**
   * Create a new environment within a tenant
   */
  create: (
    tenantId: string,
    data: CreateEnvironmentRequest
  ): Promise<Environment> =>
    api.post(`/tenants/${tenantId}/environments`, data),

  /**
   * Get environment details
   */
  get: (tenantId: string, environmentId: string): Promise<Environment> =>
    api.get(`/tenants/${tenantId}/environments/${environmentId}`),

  /**
   * Update environment
   */
  update: (
    tenantId: string,
    environmentId: string,
    data: UpdateEnvironmentRequest
  ): Promise<Environment> =>
    api.patch(`/tenants/${tenantId}/environments/${environmentId}`, data),

  /**
   * Delete environment
   */
  delete: (tenantId: string, environmentId: string): Promise<void> =>
    api.delete(`/tenants/${tenantId}/environments/${environmentId}`),

  /**
   * Set a custom property on the environment
   * The body should contain the key-value pair directly
   */
  setCustomProperty: (
    tenantId: string,
    environmentId: string,
    key: string,
    value: unknown
  ): Promise<Environment> =>
    api.patch(`/tenants/${tenantId}/environments/${environmentId}/custom-property`, {
      [key]: value,
    }),

  /**
   * Delete a custom property from the environment
   */
  deleteCustomProperty: (
    tenantId: string,
    environmentId: string,
    key: string
  ): Promise<void> =>
    api.deleteWithBody(`/tenants/${tenantId}/environments/${environmentId}/custom-property`, {
      customProperty: key,
    }),
};
