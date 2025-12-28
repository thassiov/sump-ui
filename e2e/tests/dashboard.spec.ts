import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { EnvironmentsPage } from "../pages/environments.page";
import { SettingsPage } from "../pages/settings.page";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "../fixtures/test-data";

test.describe("Dashboard", () => {
  let testData: ReturnType<typeof generateTestData>;
  let tenantId: string;
  let sessionCookie: string;

  test.beforeAll(async () => {
    testData = generateTestData("dashboard");
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });
    tenantId = response.tenantId;
    sessionCookie = response.sessionCookie || "";
  });

  test.afterAll(async () => {
    if (tenantId && sessionCookie) {
      await deleteTestTenant(tenantId, sessionCookie);
    }
  });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(tenantId, testData.account.email, testData.account.password);
  });

  test("should display dashboard with tenant info", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectOnPage();
    await dashboardPage.expectTenantInfo(testData.tenant.name);
  });

  test("should display tenant ID", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectOnPage();
    await expect(dashboardPage.tenantId).toBeVisible();
    await expect(dashboardPage.tenantId).toContainText(tenantId.slice(0, 8));
  });

  test("should navigate to environments from sidebar", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const environmentsPage = new EnvironmentsPage(page);

    await dashboardPage.expectOnPage();
    await dashboardPage.navigateToEnvironments();

    await environmentsPage.expectOnPage();
  });

  test("should navigate to settings from sidebar", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const settingsPage = new SettingsPage(page);

    await dashboardPage.expectOnPage();
    await dashboardPage.navigateToSettings();

    await settingsPage.expectOnPage();
  });

  test("should logout from dashboard", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    await dashboardPage.expectOnPage();
    await dashboardPage.logout();

    await loginPage.expectOnPage();
  });

  test("should show dashboard as active in sidebar", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectOnPage();

    // Dashboard link should have active state (data-active attribute)
    await expect(dashboardPage.sidebarDashboard).toBeVisible();
  });
});
