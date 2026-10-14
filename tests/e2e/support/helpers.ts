import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface ApiRequestOptions {
  method: string;
  endpoint: string;
  body?: unknown;
  token?: string;
  baseUrl: string;
}

export interface TestDataOptions {
  email?: string;
  displayName?: string;
  password?: string;
}

/**
 * Make API calls with proper headers and error handling
 */
export async function apiCall({
  method,
  endpoint,
  body,
  token,
  baseUrl,
}: ApiRequestOptions): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Generate random test data for users
 */
export function generateTestUser(index: number): TestDataOptions {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);

  return {
    email: `testuser-${index}-${timestamp}-${randomSuffix}@test.com`,
    displayName: `Test User ${index}`,
    password: `TestPass${index}${randomSuffix}!`,
  };
}

/**
 * Safely select an element and wait for it
 */
export async function selectElement(page: Page, selector: string): Promise<any> {
  try {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return element;
  } catch (error) {
    throw new Error(`Failed to select element ${selector}: ${error}`);
  }
}

/**
 * Wait for element and scroll into view
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  try {
    await page.locator(selector).scrollIntoViewIfNeeded();
  } catch (error) {
    console.warn(`Could not scroll to element ${selector}: ${error}`);
  }
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  screenshotDir: string,
  name: string
): Promise<string> {
  try {
    // Ensure directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(screenshotDir, filename);

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot saved: ${filepath}`);

    return filepath;
  } catch (error) {
    console.warn(`Failed to take screenshot: ${error}`);
    return '';
  }
}

/**
 * Wait for element to be visible and clickable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<void> {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
  } catch (error) {
    throw new Error(`Element ${selector} did not become visible within ${timeout}ms`);
  }
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWait(
  page: Page,
  selector: string,
  waitForUrl?: string | RegExp
): Promise<void> {
  await waitForElement(page, selector);
  await page.click(selector);

  if (waitForUrl) {
    await page.waitForURL(waitForUrl, { timeout: 10000 });
  }

  await page.waitForLoadState('networkidle');
}

/**
 * Fill form field with value
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await waitForElement(page, selector);
  await page.fill(selector, value);
  // Small delay to ensure input is processed
  await page.waitForTimeout(300);
}

/**
 * Get text content from element
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  const element = await selectElement(page, selector);
  if (!element) return '';

  const text = await element.textContent();
  return text?.trim() || '';
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.$(selector);
    if (!element) return false;

    const isVisible = await element.isVisible();
    return isVisible;
  } catch {
    return false;
  }
}

/**
 * Wait for multiple elements to be visible
 */
export async function waitForElements(
  page: Page,
  selector: string,
  minCount: number = 1,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const elements = await page.$$(selector);
    if (elements.length >= minCount) {
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(
    `Expected at least ${minCount} elements with selector ${selector}, but timeout after ${timeout}ms`
  );
}

/**
 * Get count of elements
 */
export async function getElementCount(page: Page, selector: string): Promise<number> {
  const elements = await page.$$(selector);
  return elements.length;
}

/**
 * Clear and fill an input field
 */
export async function clearAndFill(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await waitForElement(page, selector);
  await page.locator(selector).clear();
  await page.fill(selector, value);
  await page.waitForTimeout(300);
}

/**
 * Get attribute value
 */
export async function getAttribute(
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  const element = await selectElement(page, selector);
  if (!element) return null;

  return element.getAttribute(attribute);
}

/**
 * Wait for URL to match pattern
 */
export async function waitForURLMatch(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<void> {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Handle browser dialogs (alerts, confirms)
 */
export async function handleDialog(
  page: Page,
  action: 'accept' | 'dismiss' = 'accept'
): Promise<string> {
  let dialogText = '';

  const dialogHandler = (dialog: any) => {
    dialogText = dialog.message();
    if (action === 'accept') {
      dialog.accept();
    } else {
      dialog.dismiss();
    }
  };

  page.once('dialog', dialogHandler);

  return dialogText;
}

/**
 * Take screenshot on error for debugging
 */
export async function takeErrorScreenshot(
  page: Page,
  screenshotDir: string,
  testName: string
): Promise<void> {
  try {
    await takeScreenshot(page, screenshotDir, `ERROR-${testName}`);
  } catch (error) {
    console.error(`Failed to take error screenshot: ${error}`);
  }
}

/**
 * Get all text content from page
 */
export async function getPageText(page: Page): Promise<string> {
  return await page.locator('body').textContent() || '';
}

/**
 * Close all pages except the primary one
 */
export async function closeExtraPages(
  pages: Map<string, Page>,
  keepEmail?: string
): Promise<void> {
  for (const [email, page] of pages.entries()) {
    if (keepEmail && email === keepEmail) {
      continue;
    }

    try {
      await page.close();
      pages.delete(email);
    } catch (error) {
      console.warn(`Failed to close page for ${email}: ${error}`);
    }
  }
}

/**
 * Delete test user via API
 */
export async function deleteTestUser(
  email: string,
  token: string,
  apiUrl: string
): Promise<void> {
  try {
    await apiCall({
      method: 'DELETE',
      endpoint: `/users/${email}`,
      token,
      baseUrl: apiUrl,
    });
    console.log(`✓ Deleted user: ${email}`);
  } catch (error) {
    console.warn(`⚠ Could not delete user ${email}: ${error}`);
  }
}

/**
 * Delete group via API
 */
export async function deleteGroup(
  groupId: string,
  token: string,
  apiUrl: string
): Promise<void> {
  try {
    await apiCall({
      method: 'DELETE',
      endpoint: `/groups/${groupId}`,
      token,
      baseUrl: apiUrl,
    });
    console.log(`✓ Deleted group: ${groupId}`);
  } catch (error) {
    console.warn(`⚠ Could not delete group ${groupId}: ${error}`);
  }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = 10000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Navigate and wait for load
 */
export async function navigateTo(
  page: Page,
  url: string,
  waitForUrl?: string | RegExp
): Promise<void> {
  await page.goto(url);
  if (waitForUrl) {
    await page.waitForURL(waitForUrl, { timeout: 10000 });
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Create test data structure
 */
export function createTestExpense(
  description: string,
  amount: number,
  date?: string
): Record<string, any> {
  return {
    description,
    amount: amount * 100, // Convert to cents
    date: date || new Date().toISOString().split('T')[0],
  };
}

/**
 * Create test payment structure
 */
export function createTestPayment(
  paidBy: string,
  paidTo: string,
  amount: number
): Record<string, any> {
  return {
    paidBy,
    paidTo,
    amount: amount * 100, // Convert to cents
  };
}

/**
 * Retry an async operation
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after all retries');
}
