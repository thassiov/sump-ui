import { Page, Locator, expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;

  // Tabs
  readonly tenantTab: Locator;
  readonly accountTab: Locator;

  // Tenant settings
  readonly tenantNameInput: Locator;
  readonly tenantIdDisplay: Locator;
  readonly copyTenantIdButton: Locator;
  readonly saveTenantButton: Locator;

  // Account settings
  readonly sessionInfo: Locator;
  readonly logoutButton: Locator;
  readonly logoutAllButton: Locator;

  // Feedback
  readonly errorAlert: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /settings/i });

    // Tabs
    this.tenantTab = page.getByRole("tab", { name: /tenant/i });
    this.accountTab = page.getByRole("tab", { name: /account/i });

    // Tenant settings - label is just "Name" in the form
    this.tenantNameInput = page.getByLabel("Name");
    this.tenantIdDisplay = page.locator("code");
    // Copy button is an icon button - find it next to the tenant ID code element
    this.copyTenantIdButton = page.locator('code').first().locator('..').getByRole("button");
    this.saveTenantButton = page.getByRole("button", { name: /save/i });

    // Account settings - use more specific selector
    this.sessionInfo = page.getByText("Session Information");
    this.logoutButton = page.getByRole("button", { name: /logout$/i });
    this.logoutAllButton = page.getByRole("button", { name: /logout.*all/i });

    // Feedback - use data-slot to avoid Next.js route announcer
    this.errorAlert = page.locator('[data-slot="alert"]');
    this.successToast = page.locator('[data-sonner-toast]');
  }

  async goto() {
    await this.page.goto("/settings");
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/settings/);
    await expect(this.heading).toBeVisible();
  }

  async switchToTenantTab() {
    await this.tenantTab.click();
  }

  async switchToAccountTab() {
    await this.accountTab.click();
  }

  async updateTenantName(newName: string) {
    await this.tenantNameInput.fill(newName);
    await this.saveTenantButton.click();
  }

  async copyTenantId() {
    await this.copyTenantIdButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async logoutAll() {
    await this.logoutAllButton.click();
  }

  async expectTenantName(name: string) {
    await expect(this.tenantNameInput).toHaveValue(name);
  }

  async expectError(message: string) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }
}
