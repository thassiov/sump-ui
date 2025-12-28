/**
 * Test data constants for E2E tests
 */

export const TEST_TENANT = {
  name: "E2E Test Tenant",
  prefix: "e2e-test-",
};

export const TEST_ACCOUNT = {
  password: "TestPassword123!",
};

export const TEST_ENVIRONMENT = {
  name: "test-environment",
};

/**
 * Generate a short random string for unique test data
 */
function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Generate unique test data to avoid conflicts between parallel tests
 */
export function generateTestData(prefix?: string) {
  const uniqueId = randomId();

  return {
    tenant: {
      name: `e2e-${prefix || "test"}-${uniqueId}`,
    },
    account: {
      name: `Test ${uniqueId}`,
      email: `e2e-${uniqueId}@test.com`,
      username: `u${uniqueId}`, // Keep username short (max 20 chars)
      password: TEST_ACCOUNT.password,
    },
    environment: {
      name: `env-${uniqueId}`,
    },
  };
}
