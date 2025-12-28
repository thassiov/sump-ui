/**
 * API helper functions for E2E test setup and teardown
 */

const API_URL = process.env.SUMP_API_URL || "http://localhost:8080/api/v1";

export interface CreateTenantData {
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
  sessionCookie?: string;
}

/**
 * Create a test tenant with owner account and environment
 */
export async function createTestTenant(
  data: CreateTenantData
): Promise<CreateTenantResponse> {
  const response = await fetch(`${API_URL}/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create test tenant: ${response.status} ${error}`);
  }

  const result = await response.json();

  // Extract session cookie from response headers
  const setCookie = response.headers.get("set-cookie");

  return {
    tenantId: result.tenantId,
    accountId: result.accountId,
    environmentId: result.environmentId,
    sessionCookie: setCookie || undefined,
  };
}

/**
 * Delete a test tenant and all associated data
 */
export async function deleteTestTenant(
  tenantId: string,
  sessionCookie: string
): Promise<void> {
  const response = await fetch(`${API_URL}/tenants/${tenantId}`, {
    method: "DELETE",
    headers: {
      Cookie: sessionCookie,
    },
  });

  if (!response.ok && response.status !== 404) {
    console.warn(`Failed to delete test tenant ${tenantId}: ${response.status}`);
  }
}

/**
 * Create an environment for a tenant
 */
export async function createEnvironment(
  tenantId: string,
  name: string,
  sessionCookie: string
): Promise<{ id: string }> {
  const response = await fetch(`${API_URL}/tenants/${tenantId}/environments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create environment: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Delete an environment
 */
export async function deleteEnvironment(
  tenantId: string,
  environmentId: string,
  sessionCookie: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tenants/${tenantId}/environments/${environmentId}`,
    {
      method: "DELETE",
      headers: {
        Cookie: sessionCookie,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    console.warn(`Failed to delete environment ${environmentId}: ${response.status}`);
  }
}

/**
 * Login and get session cookie
 */
export async function login(
  tenantId: string,
  identifier: string,
  password: string
): Promise<{ accountId: string; sessionCookie: string }> {
  // Determine if identifier is email, phone, or username
  const isEmail = identifier.includes("@");
  const isPhone = identifier.startsWith("+") || /^\d{10,}$/.test(identifier);

  const credentials = isEmail
    ? { email: identifier, password }
    : isPhone
      ? { phone: identifier, password }
      : { username: identifier, password };

  const response = await fetch(`${API_URL}/auth/tenants/${tenantId}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to login: ${response.status} ${error}`);
  }

  const result = await response.json();
  const setCookie = response.headers.get("set-cookie");

  return {
    accountId: result.accountId,
    sessionCookie: setCookie || "",
  };
}
