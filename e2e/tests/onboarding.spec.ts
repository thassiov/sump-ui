import { test, expect } from "@playwright/test";
import { SetupPage } from "../pages/setup.page";
import { DashboardPage } from "../pages/dashboard.page";
import { generateTestData } from "../fixtures/test-data";
import { deleteTestTenant } from "../utils/api-helpers";

test.describe("Tenant Onboarding", () => {
  let createdTenantId: string | null = null;

  test.afterEach(async ({ page }) => {
    // Try to cleanup created tenant
    if (createdTenantId) {
      // Get session cookie from page context
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      if (sessionCookie) {
        await deleteTestTenant(createdTenantId, sessionCookie);
      }
      createdTenantId = null;
    }
  });

  test("should display setup wizard correctly", async ({ page }) => {
    const setupPage = new SetupPage(page);

    await setupPage.goto();
    await setupPage.expectOnPage();
    await setupPage.expectOnStep(1);

    await expect(setupPage.tenantNameInput).toBeVisible();
    await expect(setupPage.continueButton).toBeVisible();
  });

  test("should complete full setup wizard successfully", async ({ page }) => {
    const setupPage = new SetupPage(page);
    const dashboardPage = new DashboardPage(page);
    const testData = generateTestData("onboarding");

    await setupPage.goto();

    // Step 1: Tenant name
    await setupPage.fillStep1(testData.tenant.name);
    await setupPage.expectOnStep(2);

    // Step 2: Account details
    await setupPage.fillStep2(testData.account);
    await setupPage.expectOnStep(3);

    // Step 3: Environment name and submit
    await setupPage.fillStep3(testData.environment.name);

    // Should redirect to dashboard
    await dashboardPage.expectOnPage();

    // Store tenant ID for cleanup
    createdTenantId = await page.evaluate(() => localStorage.getItem("sump_tenant_id"));
  });

  test("should validate tenant name is required", async ({ page }) => {
    const setupPage = new SetupPage(page);

    await setupPage.goto();
    await setupPage.continueButton.click();

    await setupPage.expectError("required");
  });

  test("should validate tenant name minimum length", async ({ page }) => {
    const setupPage = new SetupPage(page);

    await setupPage.goto();
    await setupPage.tenantNameInput.fill("A");
    await setupPage.continueButton.click();

    await setupPage.expectError("at least 2");
  });

  test("should validate account fields are required", async ({ page }) => {
    const setupPage = new SetupPage(page);

    await setupPage.goto();
    await setupPage.fillStep1("Test Tenant");

    // Try to continue without filling account fields
    await setupPage.continueButton.click();

    await setupPage.expectError("required");
  });

  test("should validate password match", async ({ page }) => {
    const setupPage = new SetupPage(page);
    const testData = generateTestData("pwmatch");

    await setupPage.goto();
    await setupPage.fillStep1(testData.tenant.name);

    // Fill account with mismatched passwords
    await setupPage.accountNameInput.fill(testData.account.name);
    await setupPage.accountUsernameInput.fill(testData.account.username);
    await setupPage.accountEmailInput.fill(testData.account.email);
    await setupPage.accountPasswordInput.fill(testData.account.password);
    await setupPage.accountPasswordConfirmInput.fill("different-password");
    await setupPage.continueButton.click();

    await setupPage.expectError("do not match");
  });

  test("should validate password minimum length", async ({ page }) => {
    const setupPage = new SetupPage(page);
    const testData = generateTestData("pwlen");

    await setupPage.goto();
    await setupPage.fillStep1(testData.tenant.name);

    await setupPage.accountNameInput.fill(testData.account.name);
    await setupPage.accountUsernameInput.fill(testData.account.username);
    await setupPage.accountEmailInput.fill(testData.account.email);
    await setupPage.accountPasswordInput.fill("short");
    await setupPage.accountPasswordConfirmInput.fill("short");
    await setupPage.continueButton.click();

    await setupPage.expectError("8 characters");
  });

  test("should navigate back between steps", async ({ page }) => {
    const setupPage = new SetupPage(page);
    const testData = generateTestData("nav");

    await setupPage.goto();

    // Go to step 2
    await setupPage.fillStep1(testData.tenant.name);
    await setupPage.expectOnStep(2);

    // Go back to step 1
    await setupPage.backButton.click();
    await setupPage.expectOnStep(1);

    // Tenant name should be preserved
    await expect(setupPage.tenantNameInput).toHaveValue(testData.tenant.name);
  });

  test("should use default environment name if not specified", async ({ page }) => {
    const setupPage = new SetupPage(page);
    const dashboardPage = new DashboardPage(page);
    const testData = generateTestData("defaultenv");

    await setupPage.goto();
    await setupPage.fillStep1(testData.tenant.name);
    await setupPage.fillStep2(testData.account);

    // Leave environment name as default
    await expect(setupPage.environmentNameInput).toHaveValue("default");
    await setupPage.createButton.click();

    await dashboardPage.expectOnPage();

    createdTenantId = await page.evaluate(() => localStorage.getItem("sump_tenant_id"));
  });
});
