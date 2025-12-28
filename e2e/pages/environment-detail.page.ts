import { Page, Locator, expect } from "@playwright/test";

export class EnvironmentDetailPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly environmentName: Locator;
  readonly environmentId: Locator;
  readonly usersSection: Locator;
  readonly addUserButton: Locator;
  readonly backButton: Locator;

  // Actions dropdown
  readonly actionsButton: Locator;
  readonly editOption: Locator;
  readonly deleteOption: Locator;

  // Delete confirmation dialog
  readonly deleteDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading").first();
    this.environmentName = page.locator("h1, h2").first();
    this.environmentId = page.locator("code");
    this.usersSection = page.getByText(/users/i);
    this.addUserButton = page.getByRole("link", { name: /create user/i });

    // Back button is the first icon button in the content area (before the title)
    // Actions button is the second icon button (after the title)
    // Target the nested main element to avoid matching Toggle Sidebar
    const contentButtons = page.locator('main main button').filter({ has: page.locator('svg') });
    this.backButton = contentButtons.first();
    this.actionsButton = contentButtons.nth(1);
    this.editOption = page.getByRole("menuitem", { name: /edit/i });
    this.deleteOption = page.getByRole("menuitem", { name: /delete/i });

    // Delete dialog - uses role="dialog", not alertdialog
    this.deleteDialog = page.getByRole("dialog", { name: /delete environment/i });
    this.confirmDeleteButton = page.getByRole("button", { name: /delete/i }).last();
    this.cancelDeleteButton = page.getByRole("button", { name: /cancel/i });
  }

  async goto(envId: string) {
    await this.page.goto(`/environments/${envId}`);
    // Wait for the page to load
    await this.page.waitForURL(/\/environments\/[^/]+$/);
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/environments\/[^/]+$/);
  }

  async expectEnvironmentName(name: string) {
    await expect(this.page.getByRole("heading", { name })).toBeVisible();
  }

  async openActionsMenu() {
    await this.actionsButton.click();
  }

  async editEnvironment() {
    await this.openActionsMenu();
    await this.editOption.click();
  }

  async deleteEnvironment() {
    await this.openActionsMenu();
    await this.deleteOption.click();
    await expect(this.deleteDialog).toBeVisible();
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async navigateToUsers() {
    await this.addUserButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }
}
