import { Page, Locator, expect } from "@playwright/test";

export class SetupPage {
  readonly page: Page;

  // Step 1: Tenant
  readonly tenantNameInput: Locator;

  // Step 2: Account
  readonly accountNameInput: Locator;
  readonly accountUsernameInput: Locator;
  readonly accountEmailInput: Locator;
  readonly accountPhoneInput: Locator;
  readonly accountPasswordInput: Locator;
  readonly accountPasswordConfirmInput: Locator;

  // Step 3: Environment
  readonly environmentNameInput: Locator;

  // Navigation
  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly createButton: Locator;

  // Feedback
  readonly errorAlert: Locator;
  readonly stepIndicators: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.tenantNameInput = page.getByLabel("Tenant Name");

    // Step 2
    this.accountNameInput = page.getByLabel("Full Name");
    this.accountUsernameInput = page.getByLabel("Username");
    this.accountEmailInput = page.getByLabel("Email");
    this.accountPhoneInput = page.getByLabel(/Phone/);
    this.accountPasswordInput = page.getByLabel("Password", { exact: true });
    this.accountPasswordConfirmInput = page.getByLabel("Confirm Password");

    // Step 3
    this.environmentNameInput = page.getByLabel("Environment Name");

    // Navigation
    this.continueButton = page.getByRole("button", { name: /continue/i });
    this.backButton = page.getByRole("button", { name: /back/i });
    this.createButton = page.getByRole("button", { name: /create tenant/i });

    // Feedback - use data-slot to avoid Next.js route announcer
    this.errorAlert = page.locator('[data-slot="alert"]');
    this.stepIndicators = page.locator('[class*="rounded-full"]');
  }

  async goto() {
    await this.page.goto("/setup");
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/\/setup/);
  }

  // Step 1: Fill tenant name
  async fillStep1(tenantName: string) {
    await this.tenantNameInput.fill(tenantName);
    await this.continueButton.click();
  }

  // Step 2: Fill account details
  async fillStep2(account: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    await this.accountNameInput.fill(account.name);
    await this.accountUsernameInput.fill(account.username);
    await this.accountEmailInput.fill(account.email);
    if (account.phone) {
      await this.accountPhoneInput.fill(account.phone);
    }
    await this.accountPasswordInput.fill(account.password);
    await this.accountPasswordConfirmInput.fill(account.password);
    await this.continueButton.click();
  }

  // Step 3: Fill environment and submit
  async fillStep3(environmentName?: string) {
    if (environmentName) {
      await this.environmentNameInput.fill(environmentName);
    }
    await this.createButton.click();
  }

  // Complete full setup flow
  async completeSetup(data: {
    tenantName: string;
    account: {
      name: string;
      username: string;
      email: string;
      password: string;
      phone?: string;
    };
    environmentName?: string;
  }) {
    await this.fillStep1(data.tenantName);
    await this.fillStep2(data.account);
    await this.fillStep3(data.environmentName);
  }

  async expectError(message: string) {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(message);
  }

  async expectOnStep(stepNumber: 1 | 2 | 3) {
    const stepTitles = {
      1: "Create your tenant",
      2: "Create your account",
      3: "Create your first environment",
    };
    // CardTitle may not have heading role, so use text selector
    await expect(this.page.getByText(stepTitles[stepNumber])).toBeVisible();
  }
}
