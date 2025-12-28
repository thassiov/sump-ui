export interface Session {
  id: string;
  accountType: "tenant_account" | "environment_account";
  accountId: string;
  contextType: "tenant" | "environment";
  contextId: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
  username?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface LogoutAllResponse {
  revoked: number;
}

export interface LoginResponse {
  accountId: string;
  session: Session;
}
