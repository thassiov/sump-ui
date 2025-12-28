import { Page, Locator, expect } from "@playwright/test";

export class EnvironmentsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly environmentCards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /environments/i });
    this.createButton = page.getByRole("link", { name: /new environment/i });
    this.environmentCards = page.locator('[class*="card"]');
    this.emptyState = page.getByText(/no environments/i);
  }

  async goto() {
    await this.page.goto("/environments");
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/environments$/);
    await expect(this.heading).toBeVisible();
  }

  async createNewEnvironment() {
    await this.createButton.click();
    await expect(this.page).toHaveURL(/\/environments\/new/);
  }

  async expectEnvironmentCount(count: number) {
    if (count === 0) {
      await expect(this.emptyState).toBeVisible();
    } else {
      await expect(this.environmentCards).toHaveCount(count);
    }
  }

  async clickEnvironment(name: string) {
    // Find the text containing the environment name, then look for the nearby Manage link
    // Each environment is in a row/card, so we find the environment text and its sibling link
    const envText = this.page.getByText(name, { exact: true });
    await envText.locator('..').locator('..').getByRole("link", { name: "Manage" }).click();
  }

  async expectEnvironmentVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
