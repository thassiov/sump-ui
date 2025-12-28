import { api } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  Session,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutAllResponse,
} from "@/types";

export const authApi = {
  /**
   * Login to a tenant account
   */
  login: (tenantId: string, credentials: LoginRequest): Promise<LoginResponse> =>
    api.post(`/auth/tenants/${tenantId}/login`, credentials),

  /**
   * Logout from the current session
   */
  logout: (tenantId: string): Promise<void> =>
    api.post(`/auth/tenants/${tenantId}/logout`),

  /**
   * Logout from all sessions
   */
  logoutAll: (tenantId: string): Promise<LogoutAllResponse> =>
    api.post(`/auth/tenants/${tenantId}/logout-all`),

  /**
   * Get the current session
   */
  getSession: (tenantId: string): Promise<Session> =>
    api.get(`/auth/tenants/${tenantId}/session`),

  /**
   * Get all active sessions
   */
  getSessions: (tenantId: string): Promise<Session[]> =>
    api.get(`/auth/tenants/${tenantId}/sessions`),

  /**
   * Request a password reset
   */
  forgotPassword: (
    tenantId: string,
    request: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> =>
    api.post(`/auth/tenants/${tenantId}/forgot-password`, request),

  /**
   * Reset password with token
   */
  resetPassword: (
    tenantId: string,
    request: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> =>
    api.post(`/auth/tenants/${tenantId}/reset-password`, request),
};
