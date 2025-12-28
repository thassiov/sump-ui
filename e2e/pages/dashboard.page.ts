import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly tenantInfoCard: Locator;
  readonly tenantId: Locator;

  // Sidebar navigation
  readonly sidebarDashboard: Locator;
  readonly sidebarEnvironments: Locator;
  readonly sidebarSettings: Locator;

  // User menu (in sidebar footer)
  readonly userMenuTrigger: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /dashboard/i });
    this.tenantInfoCard = page.locator('[class*="card"]').first();
    this.tenantId = page.locator("code");

    // Sidebar menu items - use data-sidebar attribute to avoid matching other links
    this.sidebarDashboard = page.locator('a[href="/dashboard"][data-sidebar="menu-button"]');
    this.sidebarEnvironments = page.locator('a[href="/environments"][data-sidebar="menu-button"]');
    this.sidebarSettings = page.locator('a[href="/settings"][data-sidebar="menu-button"]');

    // User menu in sidebar footer
    this.userMenuTrigger = page.locator('[data-sidebar="menu-button"]').last();
    this.signOutButton = page.getByRole("menuitem", { name: /sign out/i });
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.heading).toBeVisible();
  }

  async expectTenantInfo(tenantName: string) {
    await expect(this.page.getByText(tenantName)).toBeVisible();
  }

  async navigateToEnvironments() {
    await this.sidebarEnvironments.click();
    await expect(this.page).toHaveURL(/\/environments/);
  }

  async navigateToSettings() {
    await this.sidebarSettings.click();
    await expect(this.page).toHaveURL(/\/settings/);
  }

  async logout() {
    // Open user menu dropdown first
    await this.userMenuTrigger.click();
    await this.signOutButton.click();
  }

  async copyTenantId() {
    // Find and click the copy button near the tenant ID
    const copyButton = this.page.getByRole("button", { name: /copy/i });
    await copyButton.click();
  }
}
