import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "../fixtures/test-data";

test.describe("Authentication", () => {
  let testData: ReturnType<typeof generateTestData>;
  let tenantId: string;
  let sessionCookie: string;

  test.beforeAll(async () => {
    // Create a test tenant for auth tests
    testData = generateTestData("auth");
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });
    tenantId = response.tenantId;
    sessionCookie = response.sessionCookie || "";
  });

  test.afterAll(async () => {
    // Cleanup test tenant
    if (tenantId && sessionCookie) {
      await deleteTestTenant(tenantId, sessionCookie);
    }
  });

  test("should display login page correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectOnPage();

    await expect(loginPage.tenantIdInput).toBeVisible();
    await expect(loginPage.identifierInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("should login successfully with email", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Pre-set tenantId in localStorage to simulate returning user
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();

    await loginPage.login(tenantId, testData.account.email, testData.account.password);

    await dashboardPage.expectOnPage();
  });

  test("should login successfully with username", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Pre-set tenantId in localStorage to simulate returning user
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();

    await loginPage.login(tenantId, testData.account.username, testData.account.password);

    await dashboardPage.expectOnPage();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Pre-set tenantId in localStorage
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();

    await loginPage.login(tenantId, testData.account.email, "wrongpassword");

    // Should show some error - the exact message may vary
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test("should show error for invalid tenant ID", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const invalidTenantId = "00000000-0000-0000-0000-000000000000";

    // Pre-set invalid tenantId in localStorage
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), invalidTenantId);
    await page.reload();

    await loginPage.login(
      invalidTenantId,
      testData.account.email,
      testData.account.password
    );

    // Should show some error - the exact message may vary
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test("should redirect to login when accessing protected route without auth", async ({
    page,
  }) => {
    // Clear any existing session
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    // Try to access dashboard
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should logout successfully", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Pre-set tenantId and login
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();

    await loginPage.login(tenantId, testData.account.email, testData.account.password);
    await dashboardPage.expectOnPage();

    // Logout
    await dashboardPage.logout();

    // Should be on login page
    await loginPage.expectOnPage();
  });

  test("should persist session on page reload", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Pre-set tenantId and login
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();

    await loginPage.login(tenantId, testData.account.email, testData.account.password);
    await dashboardPage.expectOnPage();

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await dashboardPage.expectOnPage();
  });

  test("should navigate to setup page from login", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.goToSetup();

    await expect(page).toHaveURL(/\/setup/);
  });
});
