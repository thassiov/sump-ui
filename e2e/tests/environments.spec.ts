import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { EnvironmentsPage } from "../pages/environments.page";
import { EnvironmentDetailPage } from "../pages/environment-detail.page";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "../fixtures/test-data";

test.describe("Environments", () => {
  let testData: ReturnType<typeof generateTestData>;
  let tenantId: string;
  let environmentId: string;
  let sessionCookie: string;

  test.beforeAll(async () => {
    testData = generateTestData("environments");
    const response = await createTestTenant({
      tenant: { name: testData.tenant.name },
      account: testData.account,
      environment: { name: testData.environment.name },
    });
    tenantId = response.tenantId;
    environmentId = response.environmentId;
    sessionCookie = response.sessionCookie || "";
  });

  test.afterAll(async () => {
    if (tenantId && sessionCookie) {
      await deleteTestTenant(tenantId, sessionCookie);
    }
  });

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    // Pre-set tenantId in localStorage (matches auth test pattern)
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();
    await loginPage.login(tenantId, testData.account.email, testData.account.password);
  });

  test("should display environments list", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);

    await environmentsPage.goto();
    await environmentsPage.expectOnPage();
    await environmentsPage.expectEnvironmentVisible(testData.environment.name);
  });

  test("should navigate to create new environment", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);

    await environmentsPage.goto();
    await environmentsPage.createNewEnvironment();

    await expect(page).toHaveURL(/\/environments\/new/);
  });

  test("should create a new environment", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);
    const newEnvName = `new-env-${Date.now()}`;

    await environmentsPage.goto();
    await environmentsPage.createNewEnvironment();

    // Fill the form
    await page.getByLabel("Environment Name").fill(newEnvName);
    await page.getByRole("button", { name: /create/i }).click();

    // Should redirect to environment detail
    await expect(page).toHaveURL(/\/environments\/[^/]+$/);
    await expect(page.getByRole("heading", { name: newEnvName })).toBeVisible();
  });

  test("should view environment details", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);
    const detailPage = new EnvironmentDetailPage(page);

    await environmentsPage.goto();
    await environmentsPage.clickEnvironment(testData.environment.name);

    await detailPage.expectOnPage();
    await detailPage.expectEnvironmentName(testData.environment.name);
  });

  test("should show environment ID on detail page", async ({ page }) => {
    const detailPage = new EnvironmentDetailPage(page);

    await detailPage.goto(environmentId);
    await expect(detailPage.environmentId).toBeVisible();
  });

  test("should delete environment with confirmation", async ({ page }) => {
    // Create a new environment to delete
    const environmentsPage = new EnvironmentsPage(page);
    const detailPage = new EnvironmentDetailPage(page);
    const deleteEnvName = `delete-env-${Date.now()}`;

    await environmentsPage.goto();
    await environmentsPage.createNewEnvironment();
    await page.getByLabel("Environment Name").fill(deleteEnvName);
    await page.getByRole("button", { name: /create/i }).click();

    // Wait for redirect to detail page
    await detailPage.expectOnPage();

    // Delete the environment
    await detailPage.deleteEnvironment();

    // Should redirect to environments list
    await environmentsPage.expectOnPage();

    // Deleted environment should not be visible
    await expect(page.getByText(deleteEnvName)).not.toBeVisible();
  });

  test("should cancel delete confirmation", async ({ page }) => {
    const detailPage = new EnvironmentDetailPage(page);

    await detailPage.goto(environmentId);
    await detailPage.openActionsMenu();
    await detailPage.deleteOption.click();

    // Dialog should be visible
    await expect(detailPage.deleteDialog).toBeVisible();

    // Cancel
    await detailPage.cancelDelete();

    // Should still be on detail page
    await detailPage.expectOnPage();
  });

  test("should validate environment name is required", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);

    await environmentsPage.goto();
    await environmentsPage.createNewEnvironment();

    // Clear the input and try to submit
    await page.getByLabel("Environment Name").clear();
    await page.getByRole("button", { name: /create/i }).click();

    // Should show error (use data-slot to avoid Next.js route announcer)
    await expect(page.locator('[data-slot="alert"]')).toBeVisible();
  });

  test("should navigate back from environment detail", async ({ page }) => {
    const environmentsPage = new EnvironmentsPage(page);
    const detailPage = new EnvironmentDetailPage(page);

    await environmentsPage.goto();
    await environmentsPage.clickEnvironment(testData.environment.name);
    await detailPage.expectOnPage();

    await detailPage.goBack();

    await environmentsPage.expectOnPage();
  });
});
