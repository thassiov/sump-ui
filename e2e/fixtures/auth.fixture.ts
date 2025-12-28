import { test as base, Page } from "@playwright/test";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "./test-data";

/**
 * Extended test fixtures for authenticated tests
 */
export interface AuthFixtures {
  /** Page with authenticated session */
  authenticatedPage: Page;
  /** The tenant ID created for this test */
  testTenantId: string;
  /** The account ID created for this test */
  testAccountId: string;
  /** Session cookie for API calls */
  sessionCookie: string;
}

export interface TestDataFixtures {
  /** Unique test data for this test run */
  testData: ReturnType<typeof generateTestData>;
}

/**
 * Test fixture that creates a fresh tenant and logs in
 */
export const test = base.extend<AuthFixtures & TestDataFixtures>({
  testData: async ({}, use) => {
    const data = generateTestData();
    await use(data);
  },

  testTenantId: async ({ testData }, use) => {
    // Create tenant via API
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });

    await use(response.tenantId);

    // Cleanup: Delete tenant after test
    if (response.sessionCookie) {
      await deleteTestTenant(response.tenantId, response.sessionCookie);
    }
  },

  testAccountId: async ({ testData }, use) => {
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });
    await use(response.accountId);
  },

  sessionCookie: async ({ testData }, use) => {
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });
    await use(response.sessionCookie || "");
  },

  authenticatedPage: async ({ page, testData }, use) => {
    // Create tenant and get session
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });

    // Set the tenant ID in localStorage
    await page.goto("/");
    await page.evaluate((tenantId) => {
      localStorage.setItem("sump_tenant_id", tenantId);
    }, response.tenantId);

    // Set the session cookie if available
    if (response.sessionCookie) {
      const cookies = response.sessionCookie.split(";").map((c) => {
        const [name, value] = c.trim().split("=");
        return {
          name,
          value,
          domain: "localhost",
          path: "/",
        };
      });
      await page.context().addCookies(cookies);
    }

    // Navigate to dashboard to verify authentication
    await page.goto("/dashboard");

    await use(page);

    // Cleanup
    if (response.sessionCookie) {
      await deleteTestTenant(response.tenantId, response.sessionCookie);
    }
  },
});

export { expect } from "@playwright/test";
