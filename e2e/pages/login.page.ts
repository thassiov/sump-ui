import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly tenantIdInput: Locator;
  readonly identifierInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly setupLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tenantIdInput = page.getByLabel("Tenant ID");
    this.identifierInput = page.getByLabel("Email or Username");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    // Use more specific selector to avoid Next.js route announcer
    this.errorAlert = page.locator('[data-slot="alert"]');
    this.setupLink = page.getByRole("link", { name: /create one/i });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(tenantId: string, identifier: string, password: string) {
    await this.tenantIdInput.fill(tenantId);
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // Wait for navigation away from login page (success) or error to appear (failure)
    await Promise.race([
      this.page.waitForURL((url) => url.pathname !== "/login", { timeout: 10000 }),
      this.errorAlert.waitFor({ state: "visible", timeout: 10000 }),
    ]);
  }

  async loginAndExpectDashboard(tenantId: string, identifier: string, password: string) {
    await this.login(tenantId, identifier, password);
    await this.page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 });
  }

  async expectError(message: string) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.tenantIdInput).toBeVisible();
  }

  async goToSetup() {
    await this.setupLink.click();
  }
}
