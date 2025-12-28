export interface Environment {
  id: string;
  name: string;
  tenantId: string;
  customProperties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentRequest {
  name: string;
  customProperties?: Record<string, unknown>;
}

export interface UpdateEnvironmentRequest {
  name?: string;
}
