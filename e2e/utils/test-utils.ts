import { Page, expect } from "@playwright/test";

/**
 * Wait for the page to be fully loaded and hydrated
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

/**
 * Wait for a toast notification to appear with specific text
 */
export async function waitForToast(page: Page, text: string): Promise<void> {
  await expect(page.getByText(text)).toBeVisible({ timeout: 5000 });
}

/**
 * Fill a form field by label
 */
export async function fillField(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  await page.getByLabel(label).fill(value);
}

/**
 * Click a button by its text content
 */
export async function clickButton(page: Page, text: string): Promise<void> {
  await page.getByRole("button", { name: text }).click();
}

/**
 * Check if an element with specific text is visible
 */
export async function isVisible(page: Page, text: string): Promise<boolean> {
  const element = page.getByText(text);
  return element.isVisible();
}

/**
 * Wait for navigation to a specific URL pattern
 */
export async function waitForUrl(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForURL(urlPattern);
}

/**
 * Get the current tenant ID from localStorage
 */
export async function getTenantIdFromStorage(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem("sump_tenant_id"));
}

/**
 * Set tenant ID in localStorage
 */
export async function setTenantIdInStorage(
  page: Page,
  tenantId: string
): Promise<void> {
  await page.evaluate((id) => {
    localStorage.setItem("sump_tenant_id", id);
  }, tenantId);
}

/**
 * Clear all local storage
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Take a screenshot with a descriptive name
 */
export async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}

/**
 * Verify that an error alert is displayed with specific message
 */
export async function expectError(page: Page, message: string): Promise<void> {
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(message);
}

/**
 * Verify that the user is on the dashboard
 */
export async function expectOnDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
}

/**
 * Verify that the user is on the login page
 */
export async function expectOnLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}
