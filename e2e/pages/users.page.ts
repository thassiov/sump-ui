import { Page, Locator, expect } from "@playwright/test";

export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createButton: Locator;
  readonly backButton: Locator;

  // User form fields
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly avatarUrlInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Feedback
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /user/i });
    this.createButton = page.getByRole("link", { name: /create user/i });
    this.backButton = page.getByRole("button", { name: /cancel/i });

    // Form fields
    this.nameInput = page.getByLabel("Full Name");
    this.usernameInput = page.getByLabel("Username");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.phoneInput = page.getByLabel(/Phone/);
    this.avatarUrlInput = page.getByLabel(/Avatar/);
    this.submitButton = page.getByRole("button", { name: /create user/i });
    this.cancelButton = page.getByRole("button", { name: /cancel/i });

    // Feedback - use data-slot to avoid Next.js route announcer
    this.errorAlert = page.locator('[data-slot="alert"]');
  }

  async gotoNew(envId: string) {
    await this.page.goto(`/environments/${envId}/users/new`);
  }

  async expectOnNewUserPage() {
    await expect(this.page).toHaveURL(/\/environments\/[^/]+\/users\/new/);
  }

  async fillUserForm(user: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
  }) {
    await this.nameInput.fill(user.name);
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    if (user.phone) {
      await this.phoneInput.fill(user.phone);
    }
    if (user.avatarUrl) {
      await this.avatarUrlInput.fill(user.avatarUrl);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async createUser(user: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    await this.fillUserForm(user);
    await this.submitForm();
  }

  async expectError(message: string) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
