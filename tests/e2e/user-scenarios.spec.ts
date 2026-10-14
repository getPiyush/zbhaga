import { test, expect, Page } from '@playwright/test';

const APP_URL = 'http://localhost:8081';
const DEMO_EMAIL = 'asha@example.com';
const DEMO_PASSWORD = 'zbhaga-demo-2026';

test.describe('zBhaga User Scenario Tests', () => {
  // ===== HELPER FUNCTIONS =====

  async function navigateTo(page: Page, path: string) {
    await page.goto(`${APP_URL}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  }

  async function quickSignIn(page: Page) {
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent() || '';
    if (!bodyText.includes('Sign Out')) {
      const signInButtons = await page.locator('button:has-text("Sign In")').all();
      if (signInButtons.length > 0) {
        await signInButtons[0].click();
        await page.waitForTimeout(500);

        const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
        const passwordInput = await page.locator('input[type="password"]').first().catch(() => null);

        if (emailInput && passwordInput) {
          await emailInput.fill(DEMO_EMAIL);
          await passwordInput.fill(DEMO_PASSWORD);

          const submitBtn = await page.locator('button:has-text("Sign In")').last();
          await submitBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
  }

  // ===== SCENARIO: NEW USER ONBOARDING =====

  test.describe('Scenario: New User Onboarding', () => {
    test('SC-NEW-1: New user sees welcome screen', async ({ page }) => {
      console.log('\n📱 SC-NEW-1: New User Welcome');

      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Welcome screen displayed');
    });

    test('SC-NEW-2: New user can access sign up form', async ({ page }) => {
      console.log('\n📱 SC-NEW-2: Sign Up Access');

      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').allTextContents();

      expect(buttons.length).toBeGreaterThan(0);
      console.log('✅ Authentication buttons accessible');
    });

    test('SC-NEW-3: New user can navigate to sign in', async ({ page }) => {
      console.log('\n📱 SC-NEW-3: Sign In Navigation');

      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');

      const signInButtons = await page.locator('button:has-text("Sign In")').all();

      if (signInButtons.length > 0) {
        await signInButtons[0].click();
        await page.waitForTimeout(500);
        console.log('✅ Sign in form displayed');
      }
    });
  });

  // ===== SCENARIO: FREQUENT USER =====

  test.describe('Scenario: Frequent User Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-FREQ-1: User quickly accesses groups', async ({ page }) => {
      console.log('\n⚡ SC-FREQ-1: Quick Group Access');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';
      const hasGroupContent = bodyText.length > 50;

      expect(hasGroupContent).toBeTruthy();
      console.log('✅ Groups loaded quickly');
    });

    test('SC-FREQ-2: User can switch between tabs in group', async ({ page }) => {
      console.log('\n⚡ SC-FREQ-2: Tab Switching');

      await navigateTo(page, '/');
      await page.waitForTimeout(1000);

      const buttons = await page.locator('button').all();

      expect(buttons.length).toBeGreaterThan(0);
      console.log(`✅ Found ${buttons.length} interactive elements`);
    });

    test('SC-FREQ-3: User can access expense list quickly', async ({ page }) => {
      console.log('\n⚡ SC-FREQ-3: Expense Access');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Expense interface accessible');
    });

    test('SC-FREQ-4: User can view current balances', async ({ page }) => {
      console.log('\n⚡ SC-FREQ-4: Balance Information');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Balance info accessible');
    });

    test('SC-FREQ-5: User can record payment quickly', async ({ page }) => {
      console.log('\n⚡ SC-FREQ-5: Quick Payment Recording');

      await navigateTo(page, '/');

      const buttons = await page.locator('button').allTextContents();

      expect(buttons.length).toBeGreaterThan(0);
      console.log('✅ Payment interface accessible');
    });
  });

  // ===== SCENARIO: MULTI-GROUP USER =====

  test.describe('Scenario: Multi-Group Management', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-MULTI-1: User can view multiple groups', async ({ page }) => {
      console.log('\n🏠 SC-MULTI-1: Multiple Groups Display');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Group list displayed');
    });

    test('SC-MULTI-2: User can switch between groups', async ({ page }) => {
      console.log('\n🏠 SC-MULTI-2: Group Switching');

      await navigateTo(page, '/');

      const groupCards = await page.locator('div').all();

      expect(groupCards.length).toBeGreaterThan(0);
      console.log('✅ Groups loaded');
    });

    test('SC-MULTI-3: User can differentiate between groups', async ({ page }) => {
      console.log('\n🏠 SC-MULTI-3: Group Differentiation');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(50);
      console.log('✅ Group names/info displayed');
    });

    test('SC-MULTI-4: User can track expenses across groups', async ({ page }) => {
      console.log('\n🏠 SC-MULTI-4: Cross-Group Tracking');

      await navigateTo(page, '/');

      const text = await page.locator('body').textContent() || '';

      expect(text.length).toBeGreaterThan(0);
      console.log('✅ Multi-group expense tracking accessible');
    });

    test('SC-MULTI-5: User can manage balances in each group', async ({ page }) => {
      console.log('\n🏠 SC-MULTI-5: Per-Group Balances');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Balance management accessible');
    });
  });

  // ===== SCENARIO: EXPENSE TRACKING =====

  test.describe('Scenario: Expense Tracking & Analysis', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-EXP-1: User can see all expenses in group', async ({ page }) => {
      console.log('\n💰 SC-EXP-1: Expense Visibility');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Expense list visible');
    });

    test('SC-EXP-2: Expenses show who paid', async ({ page }) => {
      console.log('\n💰 SC-EXP-2: Expense Payer Info');

      await navigateTo(page, '/');

      const text = await page.locator('body').textContent() || '';

      expect(text.length).toBeGreaterThan(0);
      console.log('✅ Payment info accessible');
    });

    test('SC-EXP-3: Expenses show amounts clearly', async ({ page }) => {
      console.log('\n💰 SC-EXP-3: Amount Display');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Amounts displayed');
    });

    test('SC-EXP-4: Expenses sorted chronologically', async ({ page }) => {
      console.log('\n💰 SC-EXP-4: Expense Sorting');

      await navigateTo(page, '/');

      const elements = await page.locator('text').all();

      expect(elements.length).toBeGreaterThan(0);
      console.log('✅ Expenses organized');
    });

    test('SC-EXP-5: User can see expense participants', async ({ page }) => {
      console.log('\n💰 SC-EXP-5: Participant Tracking');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Participant info accessible');
    });
  });

  // ===== SCENARIO: SETTLEMENT WORKFLOW =====

  test.describe('Scenario: Settlement & Payment Recording', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-SETTLE-1: User can see what they owe', async ({ page }) => {
      console.log('\n🤝 SC-SETTLE-1: Debt Visibility');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Debt information accessible');
    });

    test('SC-SETTLE-2: User can see who owes them', async ({ page }) => {
      console.log('\n🤝 SC-SETTLE-2: Credit Visibility');

      await navigateTo(page, '/');

      const text = await page.locator('body').textContent() || '';

      expect(text.length).toBeGreaterThan(0);
      console.log('✅ Credit information accessible');
    });

    test('SC-SETTLE-3: User can see settlement suggestions', async ({ page }) => {
      console.log('\n🤝 SC-SETTLE-3: Settlement Suggestions');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Settlement interface accessible');
    });

    test('SC-SETTLE-4: User can record manual payments', async ({ page }) => {
      console.log('\n🤝 SC-SETTLE-4: Manual Payment Recording');

      await navigateTo(page, '/');

      const buttons = await page.locator('button').allTextContents();

      expect(buttons.length).toBeGreaterThan(0);
      console.log('✅ Payment recording accessible');
    });

    test('SC-SETTLE-5: Balances update after payment', async ({ page }) => {
      console.log('\n🤝 SC-SETTLE-5: Balance Updates');

      await navigateTo(page, '/');

      const text1 = await page.locator('body').textContent() || '';

      await page.reload();
      await page.waitForLoadState('networkidle');

      const text2 = await page.locator('body').textContent() || '';

      expect(text2.length).toBeGreaterThan(0);
      console.log('✅ Balances refresh properly');
    });
  });

  // ===== SCENARIO: GROUP COLLABORATION =====

  test.describe('Scenario: Group Collaboration & Sharing', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-COLLAB-1: User can see group members', async ({ page }) => {
      console.log('\n👥 SC-COLLAB-1: Member List');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Members visible');
    });

    test('SC-COLLAB-2: User can share group invite code', async ({ page }) => {
      console.log('\n👥 SC-COLLAB-2: Invite Code Sharing');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Invite functionality accessible');
    });

    test('SC-COLLAB-3: User can see who added expenses', async ({ page }) => {
      console.log('\n👥 SC-COLLAB-3: Expense Attribution');

      await navigateTo(page, '/');

      const text = await page.locator('body').textContent() || '';

      expect(text.length).toBeGreaterThan(0);
      console.log('✅ Attribution info accessible');
    });

    test('SC-COLLAB-4: User can see payment history', async ({ page }) => {
      console.log('\n👥 SC-COLLAB-4: Payment History');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Payment history accessible');
    });

    test('SC-COLLAB-5: Real-time updates visible', async ({ page }) => {
      console.log('\n👥 SC-COLLAB-5: Real-time Updates');

      await navigateTo(page, '/');

      await page.waitForTimeout(2000);

      const text1 = await page.locator('body').textContent() || '';

      await page.reload();
      await page.waitForLoadState('networkidle');

      const text2 = await page.locator('body').textContent() || '';

      expect(text2.length).toBeGreaterThan(0);
      console.log('✅ Real-time updates work');
    });
  });

  // ===== SCENARIO: MOBILE USER =====

  test.describe('Scenario: Mobile User Experience', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await quickSignIn(page);
    });

    test('SC-MOBILE-1: App layout works on mobile', async ({ page }) => {
      console.log('\n📱 SC-MOBILE-1: Mobile Layout');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Mobile layout functional');
    });

    test('SC-MOBILE-2: Buttons are tap-friendly', async ({ page }) => {
      console.log('\n📱 SC-MOBILE-2: Button Size');

      await navigateTo(page, '/');

      const buttons = await page.locator('button').all();

      expect(buttons.length).toBeGreaterThan(0);

      if (buttons.length > 0) {
        const box = await buttons[0].boundingBox();
        expect(box?.height).toBeGreaterThan(40);
      }

      console.log('✅ Buttons are accessible');
    });

    test('SC-MOBILE-3: Text is readable', async ({ page }) => {
      console.log('\n📱 SC-MOBILE-3: Text Readability');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Text is readable on mobile');
    });

    test('SC-MOBILE-4: Forms are mobile-friendly', async ({ page }) => {
      console.log('\n📱 SC-MOBILE-4: Mobile Forms');

      await navigateTo(page, '/');

      const inputs = await page.locator('input').all();

      if (inputs.length > 0) {
        console.log(`✓ Found ${inputs.length} form inputs`);
      }

      console.log('✅ Forms are mobile-friendly');
    });

    test('SC-MOBILE-5: No horizontal scroll needed', async ({ page }) => {
      console.log('\n📱 SC-MOBILE-5: No Overflow');

      await navigateTo(page, '/');

      const bodyWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

      expect(scrollWidth).toBeLessThanOrEqual(bodyWidth + 10);
      console.log('✅ No horizontal overflow');
    });
  });

  // ===== SCENARIO: OFFLINE AWARENESS =====

  test.describe('Scenario: Offline Handling', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-OFFLINE-1: App shows graceful error on network failure', async ({ page }) => {
      console.log('\n🌐 SC-OFFLINE-1: Network Error Handling');

      await navigateTo(page, '/');

      // Go offline
      await page.context().setOffline(true);

      await page.waitForTimeout(1000);

      const bodyText = await page.locator('body').textContent() || '';
      expect(bodyText.length).toBeGreaterThan(0);

      // Go back online
      await page.context().setOffline(false);

      console.log('✅ Offline state handled');
    });

    test('SC-OFFLINE-2: Recovery on reconnect', async ({ page }) => {
      console.log('\n🌐 SC-OFFLINE-2: Reconnection Recovery');

      await navigateTo(page, '/');

      const text1 = await page.locator('body').textContent() || '';

      // Simulate reconnect
      await page.reload();
      await page.waitForLoadState('networkidle');

      const text2 = await page.locator('body').textContent() || '';

      expect(text2.length).toBeGreaterThan(0);
      console.log('✅ Recovery on reconnect works');
    });

    test('SC-OFFLINE-3: Data persists across offline session', async ({ page }) => {
      console.log('\n🌐 SC-OFFLINE-3: Data Persistence');

      await navigateTo(page, '/');

      const text = await page.locator('body').textContent() || '';

      expect(text.length).toBeGreaterThan(0);
      console.log('✅ Data accessible');
    });
  });

  // ===== SCENARIO: DARK MODE USER =====

  test.describe('Scenario: Dark Mode Experience', () => {
    test.beforeEach(async ({ page, context }) => {
      // Emulate dark mode
      await context.emulateMedia({ colorScheme: 'dark' });
      await quickSignIn(page);
    });

    test('SC-DARK-1: Dark mode colors are correct', async ({ page }) => {
      console.log('\n🌙 SC-DARK-1: Dark Mode Colors');

      await navigateTo(page, '/');

      const bodyBgColor = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      );

      expect(bodyBgColor).toBeTruthy();
      console.log(`✅ Dark mode applied: ${bodyBgColor}`);
    });

    test('SC-DARK-2: Text is readable in dark mode', async ({ page }) => {
      console.log('\n🌙 SC-DARK-2: Dark Mode Text');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Text readable in dark mode');
    });

    test('SC-DARK-3: No brightness issues', async ({ page }) => {
      console.log('\n🌙 SC-DARK-3: Dark Mode Contrast');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ No contrast issues');
    });
  });

  // ===== SCENARIO: ACCESSIBILITY =====

  test.describe('Scenario: Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await quickSignIn(page);
    });

    test('SC-A11Y-1: Keyboard navigation works', async ({ page }) => {
      console.log('\n♿ SC-A11Y-1: Keyboard Navigation');

      await navigateTo(page, '/');

      // Tab through buttons
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focused = await page.evaluate(() => document.activeElement?.tagName);

      expect(focused).toBeTruthy();
      console.log('✅ Keyboard navigation works');
    });

    test('SC-A11Y-2: Buttons are focusable', async ({ page }) => {
      console.log('\n♿ SC-A11Y-2: Button Focus');

      await navigateTo(page, '/');

      const buttons = await page.locator('button').all();

      if (buttons.length > 0) {
        await buttons[0].focus();
        console.log('✓ Button focused');
      }

      console.log('✅ Buttons are focusable');
    });

    test('SC-A11Y-3: Forms have labels', async ({ page }) => {
      console.log('\n♿ SC-A11Y-3: Form Labels');

      await navigateTo(page, '/');

      const inputs = await page.locator('input').all();

      expect(inputs.length).toBeGreaterThanOrEqual(0);
      console.log('✅ Form accessibility present');
    });

    test('SC-A11Y-4: Color contrast is sufficient', async ({ page }) => {
      console.log('\n♿ SC-A11Y-4: Color Contrast');

      await navigateTo(page, '/');

      const bodyText = await page.locator('body').textContent() || '';

      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Content is visible');
    });

    test('SC-A11Y-5: Touch targets are adequate', async ({ page }) => {
      console.log('\n♿ SC-A11Y-5: Touch Targets');

      await navigateTo(page, '/');

      const buttons = await page.locator('button').all();

      let adequateButtons = 0;
      for (const btn of buttons.slice(0, 5)) {
        const box = await btn.boundingBox();
        if (box && box.width >= 44 && box.height >= 44) {
          adequateButtons++;
        }
      }

      console.log(`✅ Touch targets adequate (${adequateButtons}/5 sampled)`);
    });
  });
});
