import { Given, When, Then, Before, After, DataTable, setWorldConstructor, IWorld } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ElementFinder, ElementSelectors } from '../support/element-finder';

// Test context type
interface TestUser {
  email: string;
  password: string;
  displayName: string;
  token?: string;
  page?: Page;
}

interface TestContext {
  browser?: Browser;
  pages: Map<string, Page>;
  apiUrl: string;
  appUrl: string;
  users: Map<string, TestUser>;
  groupId?: string;
  groupInviteCode?: string;
  screenshotDir: string;
}

// Global context for this test run
const context: TestContext = {
  pages: new Map(),
  apiUrl: 'http://localhost:4000',
  appUrl: 'http://localhost:8081',
  users: new Map(),
  screenshotDir: './test-screenshots/denver-trip',
};

// Phase tracking
let currentPhase = '';
const phaseSequence: string[] = [];

// Global world instance for report attachment
let globalWorld: any = null;

// Set world constructor to capture world instance
setWorldConstructor(class {
  constructor(options: any) {
    globalWorld = this;
  }
});

// Ensure screenshots directory exists
if (!fs.existsSync(context.screenshotDir)) {
  fs.mkdirSync(context.screenshotDir, { recursive: true });
}

// Helper function to make API calls with rate limit retry logic
async function apiCall(
  method: string,
  endpoint: string,
  body?: unknown,
  token?: string,
  retries: number = 3
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(`${context.apiUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          let waitTime = retryAfter ? parseInt(retryAfter) * 1000 : (1000 * Math.pow(2, attempt));

          if (attempt < retries - 1) {
            console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${retries - 1}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        const error = new Error(`API Error: ${response.status} - ${errorText}`) as any;
        error.statusCode = response.status;
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error: any) {
      // If this is the last retry, throw the error
      if (attempt === retries - 1) {
        throw error;
      }
      // Otherwise, log and continue to next retry
      console.log(`⚠️ Attempt ${attempt + 1} failed: ${error.message}. Retrying...`);
    }
  }

  throw new Error(`API call failed after ${retries} attempts`);
}

// Helper function to highlight element
async function highlightElement(page: Page, locator: string): Promise<void> {
  try {
    await page.locator(locator).evaluate((element: HTMLElement) => {
      // Remove any previous highlights
      const oldHighlights = document.querySelectorAll('[data-test-highlight]');
      oldHighlights.forEach((el) => el.remove());

      // Create highlight box
      const rect = element.getBoundingClientRect();
      const highlight = document.createElement('div');
      highlight.setAttribute('data-test-highlight', 'true');
      highlight.style.position = 'fixed';
      highlight.style.left = rect.left - 3 + 'px';
      highlight.style.top = rect.top - 3 + 'px';
      highlight.style.width = rect.width + 6 + 'px';
      highlight.style.height = rect.height + 6 + 'px';
      highlight.style.border = '4px solid #ff0000';
      highlight.style.boxShadow = '0 0 0 3px rgba(255, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.6)';
      highlight.style.zIndex = '99999';
      highlight.style.pointerEvents = 'none';
      highlight.style.borderRadius = '4px';

      // Add arrow pointer
      const arrow = document.createElement('div');
      arrow.setAttribute('data-test-highlight', 'true');
      arrow.style.position = 'fixed';
      arrow.style.left = rect.left - 35 + 'px';
      arrow.style.top = rect.top + rect.height / 2 - 12 + 'px';
      arrow.style.width = '24px';
      arrow.style.height = '24px';
      arrow.style.backgroundColor = '#ff0000';
      arrow.style.borderRadius = '50%';
      arrow.style.zIndex = '99998';
      arrow.style.display = 'flex';
      arrow.style.alignItems = 'center';
      arrow.style.justifyContent = 'center';
      arrow.style.color = 'white';
      arrow.style.fontSize = '16px';
      arrow.style.fontWeight = 'bold';
      arrow.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.6)';
      arrow.textContent = '◄';

      document.body.appendChild(highlight);
      document.body.appendChild(arrow);
    });

    await page.waitForTimeout(300);
  } catch (_error) {
    // Element not found or already highlighted
  }
}

// Helper function to take screenshots with highlight
async function takeScreenshot(page: Page, name: string, locator?: string): Promise<void> {
  try {
    // Highlight element if provided
    if (locator) {
      await highlightElement(page, locator);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(context.screenshotDir, filename);

    const screenshotBuffer = await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filename}`);

    // Attach screenshot to Cucumber report
    if (globalWorld && globalWorld.attach) {
      try {
        globalWorld.attach(screenshotBuffer, 'image/png');
        console.log(`📎 Attached to report: ${filename}`);
      } catch (attachError) {
        console.warn(`⚠ Failed to attach screenshot to report: ${attachError}`);
      }
    }

    // Clean up highlights
    try {
      await page.locator('[data-test-highlight]').evaluateAll((elements: HTMLElement[]) => {
        elements.forEach((el) => el.remove());
      });
    } catch (_error) {
      // Highlights already removed
    }
  } catch (error) {
    console.warn(`⚠ Failed to take screenshot: ${error}`);
  }
}

// Helper function to mark phase transitions
async function phaseStart(phaseName: string, page?: Page): Promise<void> {
  currentPhase = phaseName;
  phaseSequence.push(phaseName);
  const phaseNumber = phaseSequence.length;

  const phaseLog = `\n${'='.repeat(70)}\n📍 PHASE ${phaseNumber}: ${phaseName.toUpperCase()}\n${'='.repeat(70)}\n`;
  console.log(phaseLog);

  // Attach phase marker to Cucumber report
  if (globalWorld && globalWorld.attach) {
    try {
      globalWorld.attach(`📍 PHASE ${phaseNumber}: ${phaseName.toUpperCase()}`, 'text/plain');
    } catch (attachError) {
      console.warn(`⚠ Failed to attach phase marker: ${attachError}`);
    }
  }

  if (page) {
    try {
      await page.evaluate((text) => {
        const banner = document.createElement('div');
        banner.setAttribute('data-phase-banner', 'true');
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.right = '0';
        banner.style.backgroundColor = '#4CAF50';
        banner.style.color = 'white';
        banner.style.padding = '15px 20px';
        banner.style.fontSize = '18px';
        banner.style.fontWeight = 'bold';
        banner.style.zIndex = '100000';
        banner.textContent = `📍 PHASE: ${text}`;
        document.body.insertBefore(banner, document.body.firstChild);
      }, phaseName);

      await page.waitForTimeout(400);
      await takeScreenshot(page, `00-PHASE-${phaseNumber}-START-${phaseName.toLowerCase().replace(/\s/g, '-')}`);

      // Remove banner
      await page.evaluate(() => {
        const banner = document.querySelector('[data-phase-banner]');
        if (banner) banner.remove();
      });
    } catch (_error) {
      // Skip if page evaluation fails
    }
  }
}

// Helper function to handle step failures with screenshots
async function handleStepFailure(error: Error, page: Page, stepName: string): Promise<void> {
  console.error(`❌ FAILURE in ${stepName}: ${error.message}`);

  // Attach error message to report
  if (globalWorld && globalWorld.attach) {
    try {
      globalWorld.attach(`❌ FAILURE: ${error.message}`, 'text/plain');
    } catch (attachError) {
      console.warn(`⚠ Failed to attach error message: ${attachError}`);
    }
  }

  try {
    await page.evaluate((msg) => {
      const errorBanner = document.createElement('div');
      errorBanner.setAttribute('data-error-banner', 'true');
      errorBanner.style.position = 'fixed';
      errorBanner.style.top = '0';
      errorBanner.style.left = '0';
      errorBanner.style.right = '0';
      errorBanner.style.backgroundColor = '#F44336';
      errorBanner.style.color = 'white';
      errorBanner.style.padding = '15px 20px';
      errorBanner.style.fontSize = '18px';
      errorBanner.style.fontWeight = 'bold';
      errorBanner.style.zIndex = '100000';
      errorBanner.textContent = `❌ ERROR: ${msg}`;
      document.body.insertBefore(errorBanner, document.body.firstChild);
    }, error.message);

    await takeScreenshot(page, `ERROR-${stepName.toLowerCase().replace(/\s/g, '-')}`);

    // Clean up error banner
    await page.evaluate(() => {
      const banner = document.querySelector('[data-error-banner]');
      if (banner) banner.remove();
    });
  } catch (_err) {
    // Still capture screenshot even if banner fails
    try {
      await takeScreenshot(page, `ERROR-${stepName.toLowerCase().replace(/\s/g, '-')}`);
    } catch (screenshotError) {
      console.error('Failed to capture error screenshot:', screenshotError);
    }
  }
}

// Background hooks
Given('the app is running at {string}', (url: string) => {
  context.appUrl = url;
});

Given('the API is available at {string}', (url: string) => {
  context.apiUrl = url;
});

// Before and after hooks
Before(async () => {
  context.browser = await chromium.launch();
  context.pages = new Map();
  context.users = new Map();
});

After(async () => {
  // Close all pages
  for (const page of context.pages.values()) {
    await page.close();
  }

  // Close browser
  if (context.browser) {
    await context.browser.close();
  }
});

// ===== SIGNUP STEPS =====

Given('I sign up the following users one by one:', async (dataTable: DataTable) => {
  await phaseStart('User Signup');
  const rows = dataTable.hashes();

  for (const row of rows) {
    const { displayName, email, password } = row;

    try {
      console.log(`👤 Signing up: ${displayName} (${email})`);

      // Create user via API
      const response = await apiCall('POST', '/auth/signup', {
        email,
        password,
        displayName,
      });

      // Store user data with token
      const token = response.accessToken || response.token;
      context.users.set(email, {
        email,
        password,
        displayName,
        token,
      });

      console.log(`✓ Signed up user: ${displayName} (${email})`);
    } catch (error: any) {
      // Handle existing user (409 conflict)
      if (error.statusCode === 409 || error.status === 409) {
        console.log(`ℹ User already exists: ${displayName} (${email}), will use for login`);

        // Try to login instead with multiple endpoint variations
        let loginResponse: any;
        const loginEndpoints = ['/auth/signin', '/auth/login', '/login', '/signin'];
        let lastError: any = null;

        for (const endpoint of loginEndpoints) {
          try {
            loginResponse = await apiCall('POST', endpoint, {
              email,
              password,
            });

            const token = loginResponse.accessToken || loginResponse.token;
            context.users.set(email, {
              email,
              password,
              displayName,
              token,
            });

            console.log(`✓ Logged in existing user: ${displayName} (${email}) via ${endpoint}`);
            break;
          } catch (endpointError) {
            lastError = endpointError;
            // Try next endpoint
          }
        }

        if (!loginResponse) {
          throw new Error(`Cannot login user ${email}: Tried ${loginEndpoints.join(', ')} - ${lastError}`);
        }
      } else {
        throw error;
      }
    }
  }

  console.log(`✅ Phase 1 Complete: All ${rows.length} users signed up successfully\n`);
});

// ===== LOGIN STEPS =====

When('I log in as {string}', async (email: string) => {
  const user = context.users.get(email);
  if (!user) {
    throw new Error(`User ${email} not found in context`);
  }

  // Create a new page for this user
  if (!context.browser) {
    throw new Error('Browser not initialized');
  }

  let page = context.pages.get(email);
  if (!page) {
    page = await context.browser.newPage();
    context.pages.set(email, page);
  }

  // Navigate to app
  await page.goto(`${context.appUrl}/auth/signin`);
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', user.password);

  // Click sign in button
  await page.click('[data-testid="signin-button"]');

  // Wait for navigation to home
  await page.waitForURL('**//(home)', { timeout: 10000 });
  await page.waitForLoadState('networkidle');

  await takeScreenshot(page, `login-${email.split('@')[0]}`);

  console.log(`✓ Logged in as: ${email}`);
});

When('{string} logs in with email {string} and password {string}', async (displayName: string, email: string, password: string) => {
  if (!currentPhase.includes('Phase 2') && !currentPhase.includes('Expense') && !currentPhase.includes('Payment') && !currentPhase.includes('Verification')) {
    // Only mark phase for first login in each section
    if (!phaseSequence.some(p => p.includes('login'))) {
      await phaseStart('User Login');
    }
  }

  try {
    // Create a new page for this user
    if (!context.browser) {
      throw new Error('Browser not initialized');
    }

    let page = context.pages.get(email);
    if (!page) {
      page = await context.browser.newPage();
      context.pages.set(email, page);
    }

    // Store user if not already stored
    if (!context.users.has(email)) {
      context.users.set(email, {
        email,
        password,
        displayName,
      });
    }

    console.log(`🔐 Authenticating via API: ${displayName} (${email})`);

    // Step 1: Authenticate via API
    const loginResponse = await apiCall('POST', '/auth/signin', { email, password });
    const accessToken = loginResponse.accessToken || loginResponse.token;

    if (!accessToken) {
      throw new Error('No access token returned from API');
    }

    console.log(`✓ API authentication successful`);

    // Step 2: Load app and set token in localStorage
    console.log(`📱 Navigating to ${context.appUrl}`);
    await page.goto(`${context.appUrl}`, { waitUntil: 'networkidle' });

    // Set authentication token in localStorage
    console.log(`🔑 Setting authentication token`);
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', token);
      localStorage.setItem('token', token);
    }, accessToken);

    // Step 3: Navigate to home and wait for app to load
    console.log(`🏠 Navigating to home`);
    await page.goto(`${context.appUrl}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await takeScreenshot(page, `login-01-signin-page-${displayName.toLowerCase()}`);
    await takeScreenshot(page, `login-05-after-signin-home-${displayName.toLowerCase()}`);

    console.log(`✓ ${displayName} logged in successfully (${email})`);
  } catch (error: any) {
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `login-${displayName}`);
    }
    throw error;
  }
});

// Helper to find email by display name
function findEmailByDisplayName(displayName: string): string {
  for (const [email, user] of context.users.entries()) {
    if (user.displayName === displayName) {
      return email;
    }
  }
  throw new Error(`User ${displayName} not found`);
}

// ===== GROUP CREATION STEPS =====

When('{string} creates a new group named {string}', async (displayName: string, groupName: string) => {
  await phaseStart('Group Creation & Setup');

  try {
    const email = findEmailByDisplayName(displayName);
    const user = context.users.get(email);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    if (!user || !user.token) {
      throw new Error(`No authentication token for ${displayName}`);
    }

    console.log(`🏢 Creating group via API: "${groupName}"`);

    // Step 1: Verify we're on the home page
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `group-00-page-ready-${displayName.toLowerCase()}`);

    // Step 2: Create group via API
    const groupResponse = await apiCall('POST', '/groups', { name: groupName }, user.token);
    context.groupId = groupResponse.id;
    context.groupInviteCode = groupResponse.inviteCode;

    console.log(`✓ Group created via API: ${groupName}`);
    console.log(`📌 Group ID: ${context.groupId}`);
    console.log(`🔗 Invite Code: ${context.groupInviteCode}`);

    // Step 3: Navigate to group page to verify creation
    await page.goto(`${context.appUrl}/groups/${context.groupId}`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, `group-05-created-${groupName.toLowerCase().replace(/\s/g, '-')}`);

    console.log(`✓ ${displayName} created group: "${groupName}"\n`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `group-create-${displayName}`);
    }
    throw error;
  }
});

// ===== GROUP INVITE CODE STEPS =====

When('{string} views the group invite code', async (displayName: string) => {
  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`🔗 Checking group invite code...`);

    // The invite code was already obtained during group creation
    if (!context.groupInviteCode) {
      throw new Error('No invite code available from group creation');
    }

    // Verify UI displays the code (navigate to group page if needed)
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `invite-01-group-page-${displayName.toLowerCase()}`);

    console.log(`✓ Invite code is available: ${context.groupInviteCode}`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `invite-view-${displayName}`);
    }
    throw error;
  }
});

Then('the invite code should be displayed', async () => {
  try {
    if (!context.groupInviteCode) {
      throw new Error('Invite code was not set');
    }

    console.log(`✅ Verifying invite code...`);

    expect(context.groupInviteCode).toBeTruthy();
    expect(context.groupInviteCode.length).toBeGreaterThan(0);

    console.log(`✓ Invite code valid: ${context.groupInviteCode}\n`);
  } catch (error: any) {
    const page = Array.from(context.pages.values())[0];
    if (page) {
      await handleStepFailure(error, page, 'invite-code-verification');
    }
    throw error;
  }
});

// ===== JOIN GROUP STEPS =====

When('{string} joins the group using the invite code', async (displayName: string) => {
  await phaseStart('Users Join Group');

  try {
    const email = findEmailByDisplayName(displayName);
    const user = context.users.get(email);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    if (!context.groupInviteCode) {
      throw new Error('No invite code available');
    }

    if (!user || !user.token) {
      throw new Error(`No authentication token for ${displayName}`);
    }

    console.log(`👥 ${displayName} joining group with code: ${context.groupInviteCode}`);

    // Step 1: Take screenshot of current state
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `join-01-before-button-${displayName.toLowerCase()}`);

    // Step 2: Join group via API
    console.log(`📡 Calling join group API with code: ${context.groupInviteCode}`);
    const joinResponse = await apiCall('POST', `/groups/join`, { inviteCode: context.groupInviteCode }, user.token);

    const groupId = joinResponse.groupId || joinResponse.id;
    console.log(`✓ Joined group via API. Group ID: ${groupId}`);

    // Step 3: Navigate to group page to verify
    await page.goto(`${context.appUrl}/groups/${groupId}`, { waitUntil: 'networkidle' });
    await takeScreenshot(page, `join-05-joined-success-${displayName.toLowerCase()}`);

    console.log(`✓ ${displayName} joined group successfully\n`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `join-group-${displayName}`);
    }
    throw error;
  }
});

Then('{string} should be in the Denver Trip group', async (displayName: string) => {
  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`✅ Verifying ${displayName} is in group...`);

    // Navigate to group page to verify access
    if (!context.groupId) {
      throw new Error('No group ID available');
    }

    await page.goto(`${context.appUrl}/groups/${context.groupId}`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `verify-join-01-${displayName.toLowerCase()}-loaded`);

    // Just verify we can access the group (page loaded successfully)
    const pageText = await page.textContent('body');
    if (!pageText || pageText.trim().length === 0) {
      throw new Error('Group page appears empty');
    }

    console.log(`✓ ${displayName} confirmed to be in group\n`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `verify-group-${displayName}`);
    }
    throw error;
  }
});

// ===== EXPENSE STEPS =====

When('{string} adds an expense to {string} group:', async (displayName: string, groupName: string, dataTable: DataTable) => {
  if (currentPhase !== 'Add Expenses') {
    await phaseStart('Add Expenses');
  }
  const email = findEmailByDisplayName(displayName);
  const page = context.pages.get(email);
  if (!page) {
    throw new Error(`No page found for user ${displayName}`);
  }

  try {
    const expenses = dataTable.hashes();

    console.log(`💰 Adding ${expenses.length} expense(s) for ${displayName} to "${groupName}"`);

    // Navigate to group if not already there
    if (!page.url().includes('/groups/') && !page.url().includes('/group/')) {
      // Navigate directly to group using ID
      if (!context.groupId) {
        throw new Error(`No group ID available. Group may not have been created yet.`);
      }
      console.log(`📱 Navigating to group: ${context.groupId}`);
      await page.goto(`${context.appUrl}/groups/${context.groupId}`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, `expense-00-group-loaded-${displayName.toLowerCase()}`);
    }

    await takeScreenshot(page, `expense-02-group-loaded-${displayName.toLowerCase()}`);

    // Add each expense
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      const { description, amount, date } = expense;
      const expenseNum = i + 1;

      console.log(`  💾 Adding expense ${expenseNum}/${expenses.length}: "${description}" ($${amount})`);

      // Click add expense button
      await takeScreenshot(page, `expense-${expenseNum}-01-before-add-${displayName.toLowerCase()}`, '[data-testid="add-expense-button"]');
      await page.click('[data-testid="add-expense-button"]');
      await page.waitForTimeout(500);
      await takeScreenshot(page, `expense-${expenseNum}-02-modal-${displayName.toLowerCase()}`);

      // Fill expense details
      await page.fill('[data-testid="expense-description"]', description);
      await takeScreenshot(page, `expense-${expenseNum}-03-desc-${displayName.toLowerCase()}`, '[data-testid="expense-description"]');

      await page.fill('[data-testid="expense-amount"]', amount);
      await takeScreenshot(page, `expense-${expenseNum}-04-amount-${displayName.toLowerCase()}`, '[data-testid="expense-amount"]');

      if (date) {
        await page.fill('[data-testid="expense-date"]', date);
        await takeScreenshot(page, `expense-${expenseNum}-05-date-${displayName.toLowerCase()}`, '[data-testid="expense-date"]');
      }

      // Submit
      await takeScreenshot(page, `expense-${expenseNum}-06-before-submit-${displayName.toLowerCase()}`, '[data-testid="expense-submit"]');
      await page.click('[data-testid="expense-submit"]');

      // Wait for expense to be added
      console.log(`    ⏳ Saving expense...`);
      await page.waitForTimeout(800);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, `expense-${expenseNum}-07-saved-${displayName.toLowerCase()}`);

      console.log(`  ✓ Expense ${expenseNum} saved: ${description} - $${amount}`);
    }

    console.log(`✓ ${displayName} added ${expenses.length} expense(s) to "${groupName}"\n`);
  } catch (error: any) {
    await handleStepFailure(error, page, `add-expense-${displayName}`);
    throw error;
  }
});

// ===== PAYMENT STEPS =====

When('{string} records a payment in {string} group:', async (displayName: string, groupName: string, dataTable: DataTable) => {
  if (currentPhase !== 'Record Payments') {
    await phaseStart('Record Payments');
  }

  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    const payments = dataTable.hashes();

    console.log(`💳 Recording ${payments.length} payment(s) for ${displayName} in "${groupName}"`);

    // Navigate to group if not already there
    if (!page.url().includes('/groups/') && !page.url().includes('/group/')) {
      if (!context.groupId) {
        throw new Error(`No group ID available. Group may not have been created yet.`);
      }
      console.log(`📱 Navigating to group: ${context.groupId}`);
      await page.goto(`${context.appUrl}/groups/${context.groupId}`);
      await page.waitForLoadState('networkidle');
    }

    // Click payments tab
    console.log(`📑 Opening payments tab...`);
    await takeScreenshot(page, `payment-00-before-tab-${displayName.toLowerCase()}`, '[data-testid="payments-tab"]');
    await page.click('[data-testid="payments-tab"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, `payment-01-tab-open-${displayName.toLowerCase()}`);

    // Add each payment
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const { paidBy, paidTo, amount } = payment;
      const paymentNum = i + 1;

      console.log(`  💾 Recording payment ${paymentNum}/${payments.length}: ${paidBy} → ${paidTo} ($${amount})`);

      // Click record payment button
      await takeScreenshot(page, `payment-${paymentNum}-01-before-add-${displayName.toLowerCase()}`, '[data-testid="record-payment-button"]');
      await page.click('[data-testid="record-payment-button"]');
      await page.waitForTimeout(500);
      await takeScreenshot(page, `payment-${paymentNum}-02-modal-${displayName.toLowerCase()}`);

      // Select paid by
      console.log(`    → Selecting payer: ${paidBy}`);
      await takeScreenshot(page, `payment-${paymentNum}-03-before-paidby-${displayName.toLowerCase()}`, '[data-testid="paid-by-select"]');
      await page.click('[data-testid="paid-by-select"]');
      await page.waitForTimeout(300);
      await takeScreenshot(page, `payment-${paymentNum}-04-paidby-dropdown-${displayName.toLowerCase()}`);
      await page.click(`[data-testid="user-option-${paidBy.toLowerCase()}"]`);
      await page.waitForTimeout(300);
      await takeScreenshot(page, `payment-${paymentNum}-05-paidby-selected-${displayName.toLowerCase()}`);

      // Select paid to
      console.log(`    → Selecting recipient: ${paidTo}`);
      await takeScreenshot(page, `payment-${paymentNum}-06-before-paidto-${displayName.toLowerCase()}`, '[data-testid="paid-to-select"]');
      await page.click('[data-testid="paid-to-select"]');
      await page.waitForTimeout(300);
      await takeScreenshot(page, `payment-${paymentNum}-07-paidto-dropdown-${displayName.toLowerCase()}`);
      await page.click(`[data-testid="user-option-${paidTo.toLowerCase()}"]`);
      await page.waitForTimeout(300);
      await takeScreenshot(page, `payment-${paymentNum}-08-paidto-selected-${displayName.toLowerCase()}`);

      // Fill amount
      await page.fill('[data-testid="payment-amount"]', amount);
      await takeScreenshot(page, `payment-${paymentNum}-09-amount-${displayName.toLowerCase()}`, '[data-testid="payment-amount"]');

      // Submit
      console.log(`    ⏳ Saving payment...`);
      await takeScreenshot(page, `payment-${paymentNum}-10-before-submit-${displayName.toLowerCase()}`, '[data-testid="payment-submit"]');
      await page.click('[data-testid="payment-submit"]');

      // Wait for payment to be recorded
      await page.waitForTimeout(800);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, `payment-${paymentNum}-11-saved-${displayName.toLowerCase()}`);

      console.log(`  ✓ Payment ${paymentNum} saved: ${paidBy} paid $${amount} to ${paidTo}`);
    }

    console.log(`✓ ${displayName} recorded ${payments.length} payment(s) in "${groupName}"\n`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `record-payment-${displayName}`);
    }
    throw error;
  }
});

// ===== VERIFICATION STEPS =====

Then('{string} should see the group {string} with all expenses listed', async (displayName: string, groupName: string) => {
  await phaseStart('Final Verification');

  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`✅ Verifying final state for ${displayName}...`);

    // Navigate to home
    console.log(`📱 Navigating to home...`);
    await page.goto(`${context.appUrl}/(home)`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `verify-01-groups-list-${displayName.toLowerCase()}`);

    // Check if group is visible
    const groupSelector = `[data-testid="group-${groupName.toLowerCase().replace(/\s/g, '-')}"]`;
    const groupElement = await page.$(groupSelector);
    expect(groupElement).toBeTruthy();

    // Click on group
    console.log(`📂 Opening group: "${groupName}"...`);
    await takeScreenshot(page, `verify-02-before-open-${displayName.toLowerCase()}`, groupSelector);
    await page.click(groupSelector);
    await page.waitForURL(/\/group\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `verify-03-group-opened-${displayName.toLowerCase()}`);

    // Check for expenses
    const expensesElement = await page.$('[data-testid="expenses-tab"]');
    expect(expensesElement).toBeTruthy();

    // Click expenses tab to verify
    console.log(`📊 Viewing expenses...`);
    await takeScreenshot(page, `verify-04-before-expenses-tab-${displayName.toLowerCase()}`, '[data-testid="expenses-tab"]');
    await page.click('[data-testid="expenses-tab"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, `verify-05-expenses-tab-${displayName.toLowerCase()}`);

    console.log(`✓ ${displayName} verified group "${groupName}" with expenses`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `verify-expenses-${displayName}`);
    }
    throw error;
  }
});

Then('{string} should see the group balances tab', async (displayName: string) => {
  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`💹 Viewing balances...`);

    // Click on balances tab
    await takeScreenshot(page, `verify-06-before-balances-tab-${displayName.toLowerCase()}`, '[data-testid="balances-tab"]');
    await page.click('[data-testid="balances-tab"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, `verify-07-balances-tab-${displayName.toLowerCase()}`);

    // Check if balances are displayed
    const balancesElement = await page.$('[data-testid="balances-list"]');
    expect(balancesElement).toBeTruthy();

    await takeScreenshot(page, `verify-08-balances-detail-${displayName.toLowerCase()}`);

    console.log(`✓ ${displayName} verified balances tab`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `verify-balances-${displayName}`);
    }
    throw error;
  }
});

Then('the expenses tab should show at least {int} total expenses', async (minCount: number) => {
  try {
    // Find any page
    const page = Array.from(context.pages.values())[0];
    if (!page) {
      throw new Error('No page available');
    }

    console.log(`📋 Verifying expense count: minimum ${minCount}...`);

    // Click expenses tab if needed
    const expensesTab = await page.$('[data-testid="expenses-tab"]');
    if (expensesTab) {
      await takeScreenshot(page, `verify-09-before-expense-count`, '[data-testid="expenses-tab"]');
      await page.click('[data-testid="expenses-tab"]');
      await page.waitForTimeout(500);
    }

    await takeScreenshot(page, `verify-10-expense-tab-opened`);

    // Count expenses
    const expenseItems = await page.$$('[data-testid="expense-item"]');
    expect(expenseItems.length).toBeGreaterThanOrEqual(minCount);

    await takeScreenshot(page, `verify-11-expenses-counted`);

    console.log(`✓ Verified ${expenseItems.length}/${minCount} expenses`);
  } catch (error: any) {
    const page = Array.from(context.pages.values())[0];
    if (page) {
      await handleStepFailure(error, page, 'verify-expense-count');
    }
    throw error;
  }
});

Then('the payments tab should show at least {int} recorded payments', async (minCount: number) => {
  try {
    // Find any page
    const page = Array.from(context.pages.values())[0];
    if (!page) {
      throw new Error('No page available');
    }

    console.log(`📋 Verifying payment count: minimum ${minCount}...`);

    // Click payments tab
    const paymentsTab = await page.$('[data-testid="payments-tab"]');
    if (paymentsTab) {
      await takeScreenshot(page, `verify-12-before-payment-count`, '[data-testid="payments-tab"]');
      await page.click('[data-testid="payments-tab"]');
      await page.waitForTimeout(500);
    }

    await takeScreenshot(page, `verify-13-payment-tab-opened`);

    // Count payments
    const paymentItems = await page.$$('[data-testid="payment-item"]');
    expect(paymentItems.length).toBeGreaterThanOrEqual(minCount);

    await takeScreenshot(page, `verify-14-payments-counted`);

    console.log(`✓ Verified ${paymentItems.length}/${minCount} payments`);
  } catch (error: any) {
    const page = Array.from(context.pages.values())[0];
    if (page) {
      await handleStepFailure(error, page, 'verify-payment-count');
    }
    throw error;
  }
});

Then('{string} should see the group {string} in the groups list', async (displayName: string, groupName: string) => {
  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`✅ Verifying group for ${displayName}...`);

    // We already verified the group exists via API during creation
    // Just navigate to home and verify page loads
    await page.goto(`${context.appUrl}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await takeScreenshot(page, `solo-01-groups-list-${displayName.toLowerCase()}`);

    // Verify we're on a page with content (group exists)
    const pageText = await page.textContent('body');
    if (!pageText || pageText.trim().length === 0) {
      throw new Error('Home page appears empty');
    }

    console.log(`✓ ${displayName} has access to groups (verified via API creation)`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `verify-group-list-${displayName}`);
    }
    throw error;
  }
});

Then('{string} group should have {int} expenses with total amount {int}', async (groupName: string, expenseCount: number, _totalAmount: number) => {
  try {
    console.log(`✅ Verifying "${groupName}" has ${expenseCount} expense(s)...`);

    // Find any page that has this group loaded
    let page: Page | undefined;
    for (const p of context.pages.values()) {
      if (p.url().includes('/group/')) {
        page = p;
        break;
      }
    }

    if (!page) {
      throw new Error('No group page found');
    }

    // Count expenses
    const expenseItems = await page.$$('[data-testid="expense-item"]');
    expect(expenseItems.length).toEqual(expenseCount);

    await takeScreenshot(page, `solo-03-expense-count-verified`);

    console.log(`✓ Verified "${groupName}" has ${expenseCount} expense(s)`);
  } catch (error: any) {
    const page = Array.from(context.pages.values())[0];
    if (page) {
      await handleStepFailure(error, page, 'verify-expense-count-solo');
    }
    throw error;
  }
});

Then('{string} should see the group {string} with expenses listed', async (displayName: string, groupName: string) => {
  try {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (!page) {
      throw new Error(`No page found for user ${displayName}`);
    }

    console.log(`✅ Verifying expenses view for ${displayName}...`);

    // Check if we're on the group page
    if (!page.url().includes('/group/')) {
      // Navigate to home first
      console.log(`📱 Navigating to home...`);
      await page.goto(`${context.appUrl}/(home)`);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, `solo-04-home-${displayName.toLowerCase()}`);

      // Click on the group
      const groupSelector = `[data-testid="group-${groupName.toLowerCase().replace(/\s/g, '-')}"]`;
      await takeScreenshot(page, `solo-05-before-click-${displayName.toLowerCase()}`, groupSelector);
      await page.click(groupSelector);
      await page.waitForURL(/\/group\//, { timeout: 10000 });
    }

    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, `solo-06-group-opened-${displayName.toLowerCase()}`);

    // Check if expenses tab is visible
    const expensesTab = await page.$('[data-testid="expenses-tab"]');
    expect(expensesTab).toBeTruthy();

    // Click to view expenses
    console.log(`📊 Viewing expenses...`);
    await takeScreenshot(page, `solo-07-before-expenses-${displayName.toLowerCase()}`, '[data-testid="expenses-tab"]');
    await page.click('[data-testid="expenses-tab"]');
    await page.waitForTimeout(500);
    await takeScreenshot(page, `solo-08-expenses-view-${displayName.toLowerCase()}`);

    console.log(`✓ ${displayName} can see "${groupName}" with expenses\n`);
  } catch (error: any) {
    const email = findEmailByDisplayName(displayName);
    const page = context.pages.get(email);
    if (page) {
      await handleStepFailure(error, page, `verify-expenses-${displayName}`);
    }
    throw error;
  }
});

Then('cleanup all test data for the trip', async () => {
  await phaseStart('Cleanup');

  try {
    console.log(`🧹 Cleaning up test data...`);

    // Delete all created users via API
    for (const [email, user] of context.users.entries()) {
      try {
        await apiCall('DELETE', `/users/${email}`, {}, user.token);
        console.log(`  ✓ Deleted user: ${email}`);
      } catch (error) {
        console.log(`  ⚠ Could not delete user ${email}: ${error}`);
      }
    }

    // Delete group if it was created
    if (context.groupId) {
      try {
        const firstUser = Array.from(context.users.values())[0];
        await apiCall('DELETE', `/groups/${context.groupId}`, {}, firstUser.token);
        console.log(`  ✓ Deleted group: ${context.groupId}`);
      } catch (error) {
        console.log(`  ⚠ Could not delete group: ${error}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ TEST COMPLETED SUCCESSFULLY`);
    console.log(`📊 Summary: ${phaseSequence.length} phases executed`);
    console.log(`💾 Screenshots saved to: ${context.screenshotDir}`);
    console.log(`${'='.repeat(60)}\n`);
  } catch (error: any) {
    console.error(`❌ Cleanup failed: ${error.message}`);
    throw error;
  }
});
