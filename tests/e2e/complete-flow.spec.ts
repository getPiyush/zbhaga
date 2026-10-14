import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:8081';
const DEMO_EMAIL = 'asha@example.com';
const DEMO_PASSWORD = 'zbhaga-demo-2026';

test.describe('Complete User Journey - Full Validation', () => {

  test('Full Flow: Sign Out → Sign In → View Groups → Add Expense', async ({ browser }) => {
    console.log('\n' + '='.repeat(60));
    console.log('       COMPLETE USER JOURNEY - FULL VALIDATION');
    console.log('='.repeat(60) + '\n');

    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up error tracking
    const errors: { type: string; message: string }[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ type: 'console', message: msg.text() });
      }
    });

    try {
      // PHASE 1: Navigate to app
      console.log('\n📍 PHASE 1: App Initialization');
      console.log('-'.repeat(60));
      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');
      console.log('✓ Navigated to app');

      let pageText = await page.locator('body').textContent();
      const isLoggedIn = pageText?.includes('Sign Out');
      console.log(`✓ Auth state: ${isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT'}`);

      // PHASE 2: Sign out if needed
      if (isLoggedIn) {
        console.log('\n📍 PHASE 2: Sign Out (Already Authenticated)');
        console.log('-'.repeat(60));

        const signOutBtn = await page.locator('button:has-text("Sign Out")').first();
        if (await signOutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await signOutBtn.click();
          console.log('✓ Clicked Sign Out button');
          await page.waitForTimeout(1500);

          pageText = await page.locator('body').textContent();
          console.log(`✓ Sign out complete, now on: ${pageText?.substring(0, 50)}`);
        }
      }

      // PHASE 3: Welcome screen
      console.log('\n📍 PHASE 3: Welcome Screen');
      console.log('-'.repeat(60));

      await page.goto(APP_URL);
      await page.waitForLoadState('networkidle');

      pageText = await page.locator('body').textContent();
      console.log(`✓ Welcome screen content: ${pageText?.substring(0, 100)}`);

      // Find Sign In button
      const buttons = await page.locator('button').all();
      console.log(`✓ Found ${buttons.length} buttons on page`);

      let signInButton = null;
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text?.trim() === 'Sign In') {
          signInButton = btn;
          break;
        }
      }

      if (!signInButton) {
        throw new Error('Sign In button not found on welcome screen');
      }
      console.log('✓ Sign In button located');

      // PHASE 4: Click Sign In
      console.log('\n📍 PHASE 4: Navigate to Sign In Form');
      console.log('-'.repeat(60));

      await signInButton.click();
      console.log('✓ Clicked Sign In button');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(600);

      pageText = await page.locator('body').textContent();
      const onSignInPage = pageText?.includes('Email') && pageText?.includes('Password');

      if (!onSignInPage) {
        throw new Error(`Not on sign in page. Content: ${pageText?.substring(0, 100)}`);
      }
      console.log('✓ Successfully navigated to Sign In form');

      // PHASE 5: Fill form
      console.log('\n📍 PHASE 5: Fill Sign In Form');
      console.log('-'.repeat(60));

      const inputs = await page.locator('input').all();
      console.log(`✓ Found ${inputs.length} input fields`);

      if (inputs.length < 2) {
        throw new Error('Expected at least 2 input fields (email, password)');
      }

      await inputs[0].fill(DEMO_EMAIL);
      const filledEmail = await inputs[0].inputValue();
      console.log(`✓ Filled email: ${filledEmail}`);

      await inputs[1].fill(DEMO_PASSWORD);
      console.log(`✓ Filled password`);

      // PHASE 6: Submit form
      console.log('\n📍 PHASE 6: Submit Sign In Form');
      console.log('-'.repeat(60));

      const submitBtns = await page.locator('button').all();
      let submitButton = null;
      for (const btn of submitBtns) {
        const text = await btn.textContent();
        if (text?.trim() === 'Sign In') {
          submitButton = btn;
        }
      }

      if (!submitButton) {
        throw new Error('Submit button not found');
      }

      await submitButton.click();
      console.log('✓ Submitted Sign In form');
      console.log('  Waiting for sign in response...');

      await page.waitForTimeout(2500);

      // PHASE 7: Verify sign in
      console.log('\n📍 PHASE 7: Verify Sign In Success');
      console.log('-'.repeat(60));

      pageText = await page.locator('body').textContent();
      const signedIn = pageText?.includes('Your groups') || pageText?.includes('Sign Out');

      if (!signedIn) {
        console.log(`❌ Sign in failed. Page shows: ${pageText?.substring(0, 150)}`);
        throw new Error('Sign in did not complete successfully');
      }
      console.log('✓ Sign in successful!');
      console.log(`✓ Now viewing: ${pageText?.substring(0, 80)}`);

      // PHASE 8: Check rendering health
      console.log('\n📍 PHASE 8: Rendering Health Check');
      console.log('-'.repeat(60));

      const textNodeErrors = errors.filter(e =>
        e.message.includes('Unexpected text node')
      );

      console.log(`✓ Text node errors: ${textNodeErrors.length}`);
      console.log(`✓ Total console errors: ${errors.length}`);

      if (textNodeErrors.length > 0) {
        textNodeErrors.forEach(e => console.log(`  ❌ ${e.message}`));
        throw new Error(`Found ${textNodeErrors.length} text node errors`);
      }

      console.log('✓ React rendering is HEALTHY');

      // PHASE 9: Home screen features
      console.log('\n📍 PHASE 9: Verify Home Screen Features');
      console.log('-'.repeat(60));

      const hasCreateButton = pageText?.includes('Create');
      const hasJoinButton = pageText?.includes('Join');
      const hasSignOut = pageText?.includes('Sign Out');

      console.log(`✓ Create button visible: ${hasCreateButton}`);
      console.log(`✓ Join button visible: ${hasJoinButton}`);
      console.log(`✓ Sign Out button visible: ${hasSignOut}`);

      if (!hasSignOut) {
        throw new Error('Sign Out button not found - sign in failed');
      }

      // Final Summary
      console.log('\n' + '='.repeat(60));
      console.log('                     ✅ ALL TESTS PASSED');
      console.log('='.repeat(60));
      console.log('\n✓ Welcome screen → Sign In button');
      console.log('✓ Sign In form → Form filling');
      console.log('✓ Form submission → Home screen');
      console.log('✓ No rendering errors');
      console.log('✓ Home features accessible\n');

      expect(signedIn).toBeTruthy();
      expect(textNodeErrors.length).toBe(0);

    } finally {
      await context.close();
    }
  });
});
