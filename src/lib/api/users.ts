import { api } from "./client";
import type {
  EnvironmentAccount,
  CreateEnvironmentAccountRequest,
  UpdateEnvironmentAccountRequest,
} from "@/types";

export const usersApi = {
  /**
   * Create a new user in an environment
   */
  create: (
    environmentId: string,
    data: CreateEnvironmentAccountRequest
  ): Promise<EnvironmentAccount> =>
    api.post(`/environments/${environmentId}/accounts`, data),

  /**
   * Get user details
   */
  get: (environmentId: string, accountId: string): Promise<EnvironmentAccount> =>
    api.get(`/environments/${environmentId}/accounts/${accountId}`),

  /**
   * Update user (non-sensitive fields only)
   */
  update: (
    environmentId: string,
    accountId: string,
    data: UpdateEnvironmentAccountRequest
  ): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}`, data),

  /**
   * Update user email
   */
  updateEmail: (
    environmentId: string,
    accountId: string,
    email: string
  ): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/email`, { email }),

  /**
   * Update user phone
   */
  updatePhone: (
    environmentId: string,
    accountId: string,
    phone: string
  ): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/phone`, { phone }),

  /**
   * Update user username
   */
  updateUsername: (
    environmentId: string,
    accountId: string,
    username: string
  ): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/username`, {
      username,
    }),

  /**
   * Disable user
   */
  disable: (environmentId: string, accountId: string): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/disable`),

  /**
   * Enable user
   */
  enable: (environmentId: string, accountId: string): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/enable`),

  /**
   * Delete user
   */
  delete: (environmentId: string, accountId: string): Promise<void> =>
    api.delete(`/environments/${environmentId}/accounts/${accountId}`),

  /**
   * Set a custom property on the user
   * The body should contain the key-value pair directly
   */
  setCustomProperty: (
    environmentId: string,
    accountId: string,
    key: string,
    value: unknown
  ): Promise<EnvironmentAccount> =>
    api.patch(`/environments/${environmentId}/accounts/${accountId}/custom-property`, {
      [key]: value,
    }),

  /**
   * Delete a custom property from the user
   */
  deleteCustomProperty: (
    environmentId: string,
    accountId: string,
    key: string
  ): Promise<void> =>
    api.deleteWithBody(`/environments/${environmentId}/accounts/${accountId}/custom-property`, {
      customProperty: key,
    }),
};
