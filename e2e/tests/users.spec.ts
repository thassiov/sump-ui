import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { UsersPage } from "../pages/users.page";
import { EnvironmentDetailPage } from "../pages/environment-detail.page";
import { createTestTenant, deleteTestTenant } from "../utils/api-helpers";
import { generateTestData } from "../fixtures/test-data";

test.describe("User Management", () => {
  let testData: ReturnType<typeof generateTestData>;
  let tenantId: string;
  let environmentId: string;
  let sessionCookie: string;

  test.beforeAll(async () => {
    testData = generateTestData("users");
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

  test("should display create user form", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);
    await usersPage.expectOnNewUserPage();

    await expect(usersPage.nameInput).toBeVisible();
    await expect(usersPage.emailInput).toBeVisible();
    await expect(usersPage.usernameInput).toBeVisible();
    await expect(usersPage.passwordInput).toBeVisible();
    await expect(usersPage.submitButton).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);
    await usersPage.submitForm();

    await usersPage.expectError("required");
  });

  test("should validate name is required", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);

    // Fill everything except name
    await usersPage.emailInput.fill("test@example.com");
    await usersPage.usernameInput.fill("testuser");
    await usersPage.passwordInput.fill("password123");
    await usersPage.submitForm();

    await usersPage.expectError("Name");
  });

  test("should validate email is required", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);

    await usersPage.nameInput.fill("Test User");
    await usersPage.usernameInput.fill("testuser");
    await usersPage.passwordInput.fill("password123");
    await usersPage.submitForm();

    await usersPage.expectError("Email");
  });

  test("should validate password minimum length", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);

    await usersPage.nameInput.fill("Test User");
    await usersPage.emailInput.fill("test@example.com");
    await usersPage.usernameInput.fill("testuser");
    await usersPage.passwordInput.fill("short");
    await usersPage.submitForm();

    await usersPage.expectError("8 characters");
  });

  test("should cancel user creation and go back", async ({ page }) => {
    const usersPage = new UsersPage(page);
    const detailPage = new EnvironmentDetailPage(page);

    // Navigate to environment detail first
    await detailPage.goto(environmentId);
    await detailPage.navigateToUsers();

    await usersPage.expectOnNewUserPage();
    await usersPage.cancel();

    // Should go back to environment detail
    await expect(page).toHaveURL(/\/environments\/[^/]+$/);
  });

  test("should show phone field as optional", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);

    // Phone field should be visible but labeled as optional
    await expect(usersPage.phoneInput).toBeVisible();
    await expect(page.getByText(/phone.*optional/i)).toBeVisible();
  });

  test("should show avatar URL field as optional", async ({ page }) => {
    const usersPage = new UsersPage(page);

    await usersPage.gotoNew(environmentId);

    await expect(usersPage.avatarUrlInput).toBeVisible();
    await expect(page.getByText(/avatar.*optional/i)).toBeVisible();
  });

  // Note: Actual user creation test would need the API to support it
  // This is marked as a known limitation in the roadmap
  test.skip("should create a new user successfully", async ({ page }) => {
    const usersPage = new UsersPage(page);
    const newUser = {
      name: "New Test User",
      email: `newuser-${Date.now()}@example.com`,
      username: `newuser${Date.now()}`,
      password: "password123",
    };

    await usersPage.gotoNew(environmentId);
    await usersPage.createUser(newUser);

    // Should redirect to environment detail
    await expect(page).toHaveURL(/\/environments\/[^/]+$/);
  });
});
