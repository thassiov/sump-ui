export interface Role {
  role: "owner" | "admin" | "user";
  target: "tenant" | "environment";
  targetId: string;
}

export interface TenantAccount {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  name: string;
  username: string;
  avatarUrl?: string;
  tenantId: string;
  roles: Role[];
  disabled: boolean;
  disabledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentAccount {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  name: string;
  username: string;
  avatarUrl?: string;
  environmentId: string;
  customProperties: Record<string, unknown>;
  disabled: boolean;
  disabledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentAccountRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  customProperties?: Record<string, unknown>;
}

export interface UpdateEnvironmentAccountRequest {
  name?: string;
  avatarUrl?: string;
}

export interface CreateTenantAccountRequest {
  name: string;
  email: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  roles?: Role[];
}

export interface CreateTenantAccountResponse {
  id: string;
}

export interface UpdateTenantAccountRequest {
  name?: string;
  avatarUrl?: string;
}

export interface UserDefinedIdentificationRequest {
  email?: string;
  phone?: string;
  username?: string;
}
