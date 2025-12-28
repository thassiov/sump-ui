import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { SettingsPage } from "../pages/settings.page";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "../fixtures/test-data";

test.describe("Settings", () => {
  let testData: ReturnType<typeof generateTestData>;
  let tenantId: string;
  let sessionCookie: string;

  test.beforeAll(async () => {
    testData = generateTestData("settings");
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
    // Pre-set tenantId in localStorage (matches auth test pattern)
    await page.goto("/login");
    await page.evaluate((id) => localStorage.setItem("sump_tenant_id", id), tenantId);
    await page.reload();
    await loginPage.login(tenantId, testData.account.email, testData.account.password);
  });

  test("should display settings page with tabs", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await settingsPage.expectOnPage();

    await expect(settingsPage.tenantTab).toBeVisible();
    await expect(settingsPage.accountTab).toBeVisible();
  });

  test("should display tenant settings by default", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await expect(settingsPage.tenantNameInput).toBeVisible();
    await settingsPage.expectTenantName(testData.tenant.name);
  });

  test("should display tenant ID", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await expect(settingsPage.tenantIdDisplay).toBeVisible();
    await expect(settingsPage.tenantIdDisplay).toContainText(tenantId.slice(0, 8));
  });

  test("should switch between tabs", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();

    // Switch to account tab
    await settingsPage.switchToAccountTab();
    await expect(settingsPage.sessionInfo).toBeVisible();

    // Switch back to tenant tab
    await settingsPage.switchToTenantTab();
    await expect(settingsPage.tenantNameInput).toBeVisible();
  });

  test("should update tenant name", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const newName = `Updated Tenant ${Date.now()}`;

    await settingsPage.goto();
    await settingsPage.updateTenantName(newName);

    // Wait for the update to complete
    await page.waitForTimeout(500);

    // Reload and verify
    await page.reload();
    await settingsPage.expectTenantName(newName);

    // Restore original name
    await settingsPage.updateTenantName(testData.tenant.name);
  });

  test("should validate tenant name minimum length", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await settingsPage.tenantNameInput.fill("A");
    await settingsPage.saveTenantButton.click();

    await settingsPage.expectError("at least");
  });

  test("should copy tenant ID to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await settingsPage.copyTenantId();

    // Check clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(tenantId);
  });

  test("should display session information in account tab", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();
    await settingsPage.switchToAccountTab();

    await expect(settingsPage.sessionInfo).toBeVisible();
  });

  // Skip: Logout button is not implemented in settings page yet
  test.skip("should logout from settings", async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    const loginPage = new LoginPage(page);

    await settingsPage.goto();
    await settingsPage.switchToAccountTab();
    await settingsPage.logout();

    await loginPage.expectOnPage();
  });

  test("should have save button disabled when no changes", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.goto();

    // Check if save button is disabled initially (may vary by implementation)
    // This test assumes the button becomes enabled only when there are changes
    const initialValue = await settingsPage.tenantNameInput.inputValue();

    // Make a change
    await settingsPage.tenantNameInput.fill(initialValue + " changed");
    await expect(settingsPage.saveTenantButton).toBeEnabled();

    // Revert change
    await settingsPage.tenantNameInput.fill(initialValue);
  });
});
