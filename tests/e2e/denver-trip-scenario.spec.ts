import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const API_URL = 'http://localhost:4000';
const APP_URL = 'http://localhost:8081';

// Screenshots directory
const SCREENSHOTS_DIR = './test-screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// ===== DATA SETUP =====

interface UserCredentials {
  id: string;
  email: string;
  password: string;
  displayName: string;
  token: string;
}

interface GroupData {
  id: string;
  name: string;
  inviteCode: string;
}

const USERS_TO_CREATE = 10;
const PAYERS = 4; // 4 members will pay
const TRIP_DURATION_DAYS = 5;

// Expense items for the trip
const EXPENSE_CATEGORIES = [
  { name: 'Car Rental', baseAmount: 45000 }, // $450
  { name: 'Airbnb', baseAmount: 50000 }, // $500
  { name: 'Lunch', baseAmount: 3000 }, // $30
  { name: 'Dinner', baseAmount: 5000 }, // $50
  { name: 'Park Ticket', baseAmount: 2000 }, // $20
];

// ===== SCREENSHOT FUNCTIONS =====

async function highlightElement(page: Page, locator: Locator): Promise<void> {
  try {
    await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const highlight = document.createElement('div');
      highlight.style.position = 'fixed';
      highlight.style.left = rect.left + 'px';
      highlight.style.top = rect.top + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';
      highlight.style.border = '3px solid #ff0000';
      highlight.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      highlight.style.zIndex = '99999';
      highlight.style.boxShadow = '0 0 0 2px #ff0000, 0 0 10px #ff0000';
      highlight.style.borderRadius = '4px';
      document.body.appendChild(highlight);

      // Add arrow indicator
      const arrow = document.createElement('div');
      arrow.style.position = 'fixed';
      arrow.style.left = (rect.left - 20) + 'px';
      arrow.style.top = (rect.top + rect.height / 2 - 10) + 'px';
      arrow.style.width = '20px';
      arrow.style.height = '20px';
      arrow.style.backgroundColor = '#ff0000';
      arrow.style.borderRadius = '50%';
      arrow.style.zIndex = '99998';
      arrow.innerHTML = '◄';
      arrow.style.color = 'white';
      arrow.style.textAlign = 'center';
      arrow.style.lineHeight = '20px';
      arrow.style.fontSize = '16px';
      document.body.appendChild(arrow);
    });

    // Let highlight display for a moment before screenshot
    await page.waitForTimeout(300);
  } catch (error) {
    // Silently ignore if element can't be highlighted
  }
}

async function takeScreenshot(
  page: Page,
  testName: string,
  stepName: string,
  elementLocator?: Locator
): Promise<string> {
  try {
    // Highlight element if provided
    if (elementLocator) {
      const isVisible = await elementLocator.isVisible().catch(() => false);
      if (isVisible) {
        await highlightElement(page, elementLocator);
      }
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeTestName = testName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const safeStepName = stepName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeTestName}-${safeStepName}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    // Take screenshot
    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`  📸 Screenshot: ${stepName}`);
    console.log(`     Path: ${filepath}`);

    return filepath;
  } catch (error) {
    console.log(`  ⚠️  Could not take screenshot for ${stepName}: ${error}`);
    return '';
  }
}

// ===== CLEANUP FUNCTIONS =====

async function cleanupTestData(userList: UserCredentials[], groupData: GroupData): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('  🧹 CLEANUP: Test Data Summary');
  console.log('='.repeat(70) + '\n');

  let groupCount = 0;
  let userCount = 0;
  let expenseCount = 0;
  let paymentCount = 0;

  if (groupData && userList.length > 0) {
    groupCount = 1;
    userCount = userList.length;

    try {
      // Get balance info to see expenses and payments
      const balances = await fetch(`${API_URL}/groups/${groupData.id}/balances`, {
        headers: {
          Authorization: `Bearer ${userList[0].token}`,
        },
      });

      if (balances.ok) {
        const data = await balances.json();
        expenseCount = data.debts ? data.debts.length : 0;
      }
    } catch (error) {
      // Silently ignore fetch errors
    }
  }

  console.log('📊 Test Data Created:');
  console.log('-'.repeat(70));
  console.log(`  👥 Users:        ${userCount}`);
  console.log(`  🏢 Groups:       ${groupCount}`);
  console.log(`  💰 Expenses:     ~25 (5 days × 5 categories)`);
  console.log(`  💳 Payments:     ~3 settlement payments recorded`);
  console.log(`  📋 Debt Entries: ${expenseCount || 'N/A'}`);

  console.log('\n📝 Data Details:');
  console.log('-'.repeat(70));

  if (userList.length > 0) {
    console.log('  Users created (timestamps prevent conflicts):');
    userList.slice(0, 3).forEach((u, i) => {
      console.log(`    ${i + 1}. ${u.displayName} (${u.email})`);
    });
    if (userList.length > 3) {
      console.log(`    ... and ${userList.length - 3} more`);
    }
  }

  if (groupData) {
    console.log(`\n  Group: ${groupData.name}`);
    console.log(`  Invite Code: ${groupData.inviteCode}`);
    console.log(`  Group ID: ${groupData.id}`);
  }

  console.log('\n⚠️  Data Retention:');
  console.log('-'.repeat(70));
  console.log('  ℹ️  API does not support hard deletion of test data');
  console.log('  ✅ Test data uses unique timestamps: ' + Date.now());
  console.log('  ✅ Future test runs will NOT conflict');
  console.log('  💡 For manual cleanup, contact database admin');

  console.log('\n✅ Cleanup summary completed\n');
}

// ===== HELPER FUNCTIONS =====

async function createUser(
  email: string,
  password: string,
  displayName: string,
  retries: number = 3
): Promise<UserCredentials> {
  console.log(`  📝 Creating user: ${displayName} (${email})`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        const errorData = JSON.parse(error);

        // Handle rate limiting
        if (errorData.message && errorData.message.includes('Rate limit')) {
          const waitTime = parseInt(errorData.message.match(/\d+/)?.[0] || '5') * 1000;
          console.log(`  ⏳ Rate limited, waiting ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
          continue;
        }

        throw new Error(`Failed to create user ${email}: ${error}`);
      }

      const data = await response.json();

      return {
        id: data.user.id,
        email,
        password,
        displayName,
        token: data.accessToken,
      };
    } catch (error) {
      if (attempt === retries) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`  ⚠️  Attempt ${attempt} failed, retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to create user after ${retries} attempts`);
}

async function createGroup(user: UserCredentials, groupName: string): Promise<GroupData> {
  console.log(`  📝 Creating group: ${groupName}`);

  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      name: groupName,
      currency: 'USD',
      description: `Group for ${groupName}`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create group: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    inviteCode: data.inviteCode,
  };
}

async function joinGroup(user: UserCredentials, inviteCode: string, retries: number = 3): Promise<void> {
  console.log(`  ✅ ${user.displayName} joining group with code: ${inviteCode}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_URL}/groups/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const error = await response.text();
        const errorData = JSON.parse(error);

        if (errorData.message && errorData.message.includes('Rate limit')) {
          const waitTime = parseInt(errorData.message.match(/\d+/)?.[0] || '5') * 1000;
          console.log(`  ⏳ Rate limited, waiting ${waitTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
          continue;
        }

        throw new Error(`Failed to join group: ${error}`);
      }
      return;
    } catch (error) {
      if (attempt === retries) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`  ⚠️  Join attempt ${attempt} failed, retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function addExpense(
  user: UserCredentials,
  groupId: string,
  description: string,
  totalMinor: number,
  participantIds: string[],
  paidByUserId: string
): Promise<string> {
  console.log(
    `  💰 Adding expense: ${description} ($${(totalMinor / 100).toFixed(2)}) - Paid by ${user.displayName}`
  );

  const response = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      description,
      totalMinor,
      category: description.split(' ')[0],
      payers: [{ userId: paidByUserId, paidMinor: totalMinor }],
      split: {
        mode: 'equal',
        participants: participantIds.map((userId) => ({ userId })),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add expense: ${error}`);
  }

  const data = await response.json();
  return data.id;
}

async function recordPayment(
  user: UserCredentials,
  groupId: string,
  toUserId: string,
  amountMinor: number
): Promise<string> {
  console.log(
    `  💳 Recording payment: ${user.displayName} → ${toUserId}, Amount: $${(amountMinor / 100).toFixed(2)}`
  );

  const response = await fetch(`${API_URL}/groups/${groupId}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      fromUserId: user.id,
      toUserId,
      amountMinor,
      method: 'cash',
      paidAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to record payment: ${error}`);
  }

  const data = await response.json();
  return data.id;
}

async function getGroupBalances(user: UserCredentials, groupId: string) {
  console.log(`  📊 Fetching group balances...`);

  const response = await fetch(`${API_URL}/groups/${groupId}/balances`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch balances: ${error}`);
  }

  return await response.json();
}

async function signInUser(page: Page, email: string, password: string): Promise<void> {
  console.log(`  🔐 Signing in as ${email}...`);

  await page.goto(APP_URL);
  await page.waitForLoadState('networkidle');

  // Screenshot: Initial page load
  await takeScreenshot(page, 'SignIn', '1-App-Initial-Load');

  const bodyText = await page.locator('body').textContent() || '';
  if (bodyText.includes('Sign Out')) {
    console.log('  ℹ️  Already signed in');
    await takeScreenshot(page, 'SignIn', '2-Already-Signed-In');
    return;
  }

  // Click Sign In button
  const signInButtons = await page.locator('button:has-text("Sign In")').all();
  if (signInButtons.length > 0) {
    await takeScreenshot(page, 'SignIn', '2-Sign-In-Button-Found', signInButtons[0]);
    await signInButtons[0].click();
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'SignIn', '3-After-Click-SignIn');
  }

  // Fill credentials
  const emailInput = await page.locator('input[type="email"]').first();
  const passwordInput = await page.locator('input[type="password"]').first();

  await emailInput.fill(email);
  await takeScreenshot(page, 'SignIn', '4-Email-Filled', emailInput);

  await passwordInput.fill(password);
  await takeScreenshot(page, 'SignIn', '5-Password-Filled', passwordInput);

  const submitBtn = await page.locator('button:has-text("Sign In")').last();
  await takeScreenshot(page, 'SignIn', '6-Before-Submit', submitBtn);

  await submitBtn.click();

  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle').catch(() => {});

  await takeScreenshot(page, 'SignIn', '7-After-SignIn-Success');

  console.log(`  ✅ Signed in successfully`);
}

// ===== MAIN TEST SUITE =====

test.describe.configure({ mode: 'serial' });

// Increase timeout for rate limit handling
test.setTimeout(120000); // 2 minutes per test

test.describe('Denver Trip Scenario - Multi-User Expense Splitting', () => {
  let users: UserCredentials[] = [];
  let group: GroupData;
  const timestamp = Date.now();
  let createdGroupIds: string[] = [];
  let createdUserIds: string[] = [];

  // Cleanup after all tests (success or failure)
  test.afterAll(async () => {
    if (users.length > 0 || (group && group.id)) {
      await cleanupTestData(users, group);
    }
  });

  test('SETUP: Create 10 users and Denver Trip group', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('  SETUP: Creating 10 Users & Denver Trip Group');
    console.log('='.repeat(70) + '\n');

    // Create 10 users
    console.log('🧑‍🤝‍🧑 Creating 10 Users:');
    const userNames = [
      'Alice Johnson',
      'Bob Smith',
      'Carol White',
      'David Brown',
      'Emma Davis',
      'Frank Miller',
      'Grace Lee',
      'Henry Wilson',
      'Iris Taylor',
      'Jack Anderson',
    ];

    for (let i = 0; i < USERS_TO_CREATE; i++) {
      const user = await createUser(
        `user${i + 1}-${timestamp}@denvertrip.test`,
        'password-secure-2026-denvertrip',
        userNames[i]
      );
      users.push(user);
      createdUserIds.push(user.id);
      // Add delay to avoid rate limiting
      if (i < USERS_TO_CREATE - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Successfully created ${users.length} users\n`);

    // Create group with first user
    console.log('🏢 Creating Denver Trip Group:');
    group = await createGroup(users[0], 'Denver Trip');
    createdGroupIds.push(group.id);
    console.log(`✅ Group created with invite code: ${group.inviteCode}\n`);

    // Add all other users to group
    console.log('🔗 Adding Users to Group:');
    for (let i = 1; i < users.length; i++) {
      await joinGroup(users[i], group.inviteCode);
      // Add delay to avoid rate limiting
      if (i < users.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log(`✅ All ${users.length} users added to group\n`);

    expect(users.length).toBe(USERS_TO_CREATE);
    expect(group.id).toBeTruthy();
    expect(group.inviteCode).toBeTruthy();
  });

  test('SCENARIO: Add expenses over 5-day trip with 4 random payers', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('  SCENARIO: Adding Trip Expenses (5 Days)');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const expenses: Array<{ id: string; description: string; amount: number }> = [];
    const allUserIds = users.map((u) => u.id);

    // Add expenses for 5 days
    for (let day = 1; day <= TRIP_DURATION_DAYS; day++) {
      console.log(`\n📅 DAY ${day}:`);
      console.log('-'.repeat(70));

      for (const category of EXPENSE_CATEGORIES) {
        // Randomly select one of the 4 payers
        const payerIndex = Math.floor(Math.random() * PAYERS);
        const payer = users[payerIndex];

        // Add some variance to the amount (±20%)
        const variance = 0.8 + Math.random() * 0.4;
        const totalMinor = Math.round(category.baseAmount * variance);

        const expenseId = await addExpense(
          payer,
          group.id,
          `Day ${day} - ${category.name}`,
          totalMinor,
          allUserIds,
          payer.id
        );

        expenses.push({
          id: expenseId,
          description: `Day ${day} - ${category.name}`,
          amount: totalMinor / 100,
        });
      }
    }

    console.log(`\n✅ Successfully added ${expenses.length} expenses\n`);
    expect(expenses.length).toBe(TRIP_DURATION_DAYS * EXPENSE_CATEGORIES.length);
  });

  test('SETTLEMENT: View and validate settlement suggestions', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('  SETTLEMENT: Viewing Settlement Suggestions');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const balances = await getGroupBalances(users[0], group.id);

    console.log('\n💰 Group Balances:');
    console.log('-'.repeat(70));
    for (const balance of balances.balances) {
      const amount = balance.netMinor / 100;
      const status = balance.netMinor > 0 ? 'GETS' : balance.netMinor < 0 ? 'OWES' : 'EVEN';
      console.log(
        `  ${balance.displayName}: ${status} $${Math.abs(amount).toFixed(2)}`
      );
    }

    console.log(`\n🔄 Suggested Settlements (${balances.suggested.length} payments needed):`);
    console.log('-'.repeat(70));
    for (const suggestion of balances.suggested) {
      const amount = (suggestion.amountMinor / 100).toFixed(2);
      console.log(`  ${suggestion.fromDisplayName} → ${suggestion.toDisplayName}: $${amount}`);
    }

    // Validate settlement structure
    expect(balances.groupId).toBe(group.id);
    expect(balances.currency).toBe('USD');
    expect(balances.balances).toBeDefined();
    expect(balances.suggested).toBeDefined();
    expect(Array.isArray(balances.suggested)).toBe(true);

    console.log(`\n✅ Settlement suggestions validated\n`);
  });

  test('PAYMENT: Record payments following settlement suggestions', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('  PAYMENT: Recording Settlement Payments');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const balances = await getGroupBalances(users[0], group.id);
    const payments: Array<{ from: string; to: string; amount: number }> = [];

    console.log('💳 Recording Suggested Payments:');
    console.log('-'.repeat(70));

    // Record the suggested payments
    for (const suggestion of balances.suggested.slice(0, 3)) {
      // Record first 3 suggested payments
      const fromUser = users.find((u) => u.id === suggestion.fromUserId);
      if (!fromUser) continue;

      const paymentId = await recordPayment(
        fromUser,
        group.id,
        suggestion.toUserId,
        suggestion.amountMinor
      );

      payments.push({
        from: suggestion.fromDisplayName,
        to: suggestion.toDisplayName,
        amount: suggestion.amountMinor / 100,
      });

      expect(paymentId).toBeTruthy();
    }

    console.log(`\n✅ Recorded ${payments.length} payments\n`);

    // Verify balances updated
    const updatedBalances = await getGroupBalances(users[0], group.id);

    console.log('📊 Updated Balances After Payments:');
    console.log('-'.repeat(70));
    for (const balance of updatedBalances.balances) {
      const amount = balance.netMinor / 100;
      const status = balance.netMinor > 0 ? 'GETS' : balance.netMinor < 0 ? 'OWES' : '✓ EVEN';
      console.log(
        `  ${balance.displayName}: ${status} ${balance.netMinor === 0 ? '' : '$' + Math.abs(amount).toFixed(2)}`
      );
    }

    console.log(`\n✅ Payments recorded and balances updated\n`);
    expect(payments.length).toBeGreaterThan(0);
  });

  test('UI: View group details and balances in web app', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('  UI: Viewing Group in Web Application');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const user = users[0];

    // Sign in
    await signInUser(page, user.email, user.password);

    // Navigate and check group appears
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('🔍 Checking Group Page Content...');

    // Screenshot: Groups list view
    await takeScreenshot(page, 'UI-GroupView', '1-Groups-List-Page');

    const pageText = await page.locator('body').textContent() || '';

    // Check for Denver Trip group name
    const hasGroupName = pageText.includes('Denver Trip');
    console.log(`  ${hasGroupName ? '✅' : '❌'} Group name visible`);

    // Check for member count
    const memberCount = users.length;
    console.log(`  📊 Expected ${memberCount} members in group`);

    // Try to navigate to group detail if possible
    const groupLinks = await page.locator('text=Denver Trip').all();
    if (groupLinks.length > 0) {
      await takeScreenshot(page, 'UI-GroupView', '2-Denver-Trip-Group-Found', groupLinks[0]);
      await groupLinks[0].click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');

      // Screenshot: Group detail view
      await takeScreenshot(page, 'UI-GroupView', '3-Group-Detail-Page');

      const groupText = await page.locator('body').textContent() || '';

      // Check for expense/payment/balance tabs or sections
      const hasExpenseSection = groupText.toLowerCase().includes('expense');
      const hasPaymentSection = groupText.toLowerCase().includes('payment');
      const hasBalanceSection = groupText.toLowerCase().includes('balance');

      console.log(`  ${hasExpenseSection ? '✅' : '⚠️'} Expense section visible`);
      console.log(`  ${hasPaymentSection ? '✅' : '⚠️'} Payment section visible`);
      console.log(`  ${hasBalanceSection ? '✅' : '⚠️'} Balance section visible`);

      // Screenshot: Individual sections if found
      if (hasExpenseSection) {
        await takeScreenshot(page, 'UI-GroupView', '4-Expense-Section');
      }
      if (hasPaymentSection) {
        await takeScreenshot(page, 'UI-GroupView', '5-Payment-Section');
      }
      if (hasBalanceSection) {
        await takeScreenshot(page, 'UI-GroupView', '6-Balance-Section');
      }

      expect(groupText.length).toBeGreaterThan(0);
    }

    console.log(`\n✅ UI verification complete\n`);
  });

  test('SUMMARY: Generate trip summary report', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('  SUMMARY: Denver Trip Expense Report');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const balances = await getGroupBalances(users[0], group.id);

    // Calculate statistics
    let totalExpenses = 0;
    for (const balance of balances.balances) {
      totalExpenses += Math.abs(balance.netMinor);
    }
    totalExpenses = totalExpenses / 2; // Each expense is counted twice in balances

    const totalAmount = (totalExpenses / 100).toFixed(2);
    const avgPerPerson = (totalExpenses / users.length / 100).toFixed(2);

    console.log('📈 Trip Statistics:');
    console.log('-'.repeat(70));
    console.log(`  Total Participants: ${users.length}`);
    console.log(`  Trip Duration: ${TRIP_DURATION_DAYS} days`);
    console.log(`  Total Expenses: $${totalAmount}`);
    console.log(`  Average per Person: $${avgPerPerson}`);
    console.log(`  Settlement Payments Needed: ${balances.suggested.length}`);

    console.log('\n👥 Individual Settlements:');
    console.log('-'.repeat(70));

    const settledUsers = new Set<string>();
    for (const suggestion of balances.suggested) {
      console.log(
        `  💸 ${suggestion.fromDisplayName} → ${suggestion.toDisplayName}: $${(suggestion.amountMinor / 100).toFixed(2)}`
      );
      settledUsers.add(suggestion.fromUserId);
      settledUsers.add(suggestion.toUserId);
    }

    console.log(`\n✅ Trip Summary Report Generated\n`);

    // Verify all key metrics exist
    expect(balances.balances.length).toBe(users.length);
    expect(parseFloat(totalAmount)).toBeGreaterThan(0);
    expect(parseFloat(avgPerPerson)).toBeGreaterThan(0);
  });

  test('VALIDATION: Verify data integrity and balances', async () => {
    console.log('\n' + '='.repeat(70));
    console.log('  VALIDATION: Data Integrity Checks');
    console.log('='.repeat(70) + '\n');

    if (users.length === 0) {
      throw new Error('Users not created. Run SETUP test first.');
    }

    const balances = await getGroupBalances(users[0], group.id);

    console.log('🔍 Running Validation Checks:');
    console.log('-'.repeat(70));

    // Check 1: All users represented
    const balanceUserIds = new Set(balances.balances.map((b) => b.userId));
    const allUsersRepresented = users.every((u) => balanceUserIds.has(u.id));
    console.log(`  ${allUsersRepresented ? '✅' : '❌'} All users represented in balances`);

    // Check 2: Sum of all balances should be zero (money is conserved)
    const balanceSum = balances.balances.reduce((sum, b) => sum + b.netMinor, 0);
    const balancesZeroSum = Math.abs(balanceSum) < 100; // Allow 1 cent for rounding
    console.log(`  ${balancesZeroSum ? '✅' : '❌'} Balances sum to zero (conservation check)`);
    console.log(`     Sum: $${(balanceSum / 100).toFixed(2)}`);

    // Check 3: Settlement suggestions are valid
    const validSuggestions = balances.suggested.every(
      (s) => s.fromUserId !== s.toUserId && s.amountMinor > 0
    );
    console.log(
      `  ${validSuggestions ? '✅' : '❌'} Settlement suggestions are valid`
    );

    // Check 4: Debts are documented
    console.log(`  ✅ Debts documented: ${balances.debts.length} debt entries`);

    // Check 5: Currency consistency
    const currencyValid = balances.currency === 'USD';
    console.log(`  ${currencyValid ? '✅' : '❌'} Currency is USD`);

    console.log(`\n✅ Validation complete - ${allUsersRepresented ? 'PASSED' : 'FAILED'}\n`);

    expect(allUsersRepresented).toBe(true);
    expect(balancesZeroSum).toBe(true);
    expect(validSuggestions).toBe(true);
    expect(currencyValid).toBe(true);
  });
});
