import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:8081';
const API_URL = 'http://localhost:4000';
const DEMO_EMAIL = 'asha@example.com';
const DEMO_PASSWORD = 'zbhaga-demo-2026';

test.describe('Sign In Flow - Full Validation & Debugging', () => {

  test('Complete Sign In Flow with Full Validation', async ({ page, context }) => {
    console.log('\n========== COMPLETE SIGN IN FLOW ==========\n');

    // Track all requests
    const requests: { url: string; method: string; status?: number }[] = [];
    page.on('response', response => {
      requests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status()
      });
      if (response.status() >= 400) {
        console.log(`📡 API ${response.status()}: ${response.url()}`);
      }
    });

    // Track console messages
    const consoleLogs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text().substring(0, 100)}`);
      }
    });

    console.log('Step 1: Navigate to app');
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    const initialContent = await page.locator('body').textContent();
    console.log('✓ App loaded');
    console.log(`  Page content preview: ${initialContent?.substring(0, 100)}`);

    // Check if already signed in
    const isSignedIn = initialContent?.includes('Sign Out');
    console.log(`\nStep 2: Check authentication state`);
    console.log(`  Currently signed in: ${isSignedIn}`);

    if (isSignedIn) {
      console.log('\nStep 3: Sign out first (already authenticated)');
      const signOutBtn = await page.locator('button:has-text("Sign Out")').first();
      if (await signOutBtn.isVisible()) {
        await signOutBtn.click();
        console.log('✓ Clicked Sign Out');
        await page.waitForTimeout(1500);
      }
    }

    console.log('\nStep 3: Navigate to Welcome screen');
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');

    const welcomeText = await page.locator('body').textContent();
    console.log(`✓ Welcome screen loaded`);
    console.log(`  Contains "Sign In": ${welcomeText?.includes('Sign In')}`);
    console.log(`  Contains "zBhaga": ${welcomeText?.includes('zBhaga')}`);

    console.log('\nStep 4: Find and click Sign In button');
    const signInButtons = await page.locator('button').allTextContents();
    console.log(`  Available buttons: ${signInButtons.join(', ')}`);

    const signInBtn = await page.locator('button').filter({ hasText: /^Sign In$/ }).first();
    const isSignInVisible = await signInBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`  Sign In button visible: ${isSignInVisible}`);

    if (isSignInVisible) {
      await signInBtn.click();
      console.log('✓ Clicked Sign In button');
      await page.waitForTimeout(800);
    } else {
      throw new Error('Sign In button not found!');
    }

    console.log('\nStep 5: Verify on Sign In page');
    const signInPageText = await page.locator('body').textContent();
    console.log(`✓ On sign in page`);
    console.log(`  Page contains "Email": ${signInPageText?.includes('Email')}`);
    console.log(`  Page contains "Password": ${signInPageText?.includes('Password')}`);

    console.log('\nStep 6: Fill email field');
    const emailInputs = await page.locator('input[type="text"], input[type="email"]').all();
    console.log(`  Found ${emailInputs.length} text inputs`);

    if (emailInputs.length > 0) {
      await emailInputs[0].fill(DEMO_EMAIL);
      const emailValue = await emailInputs[0].inputValue();
      console.log(`✓ Email filled: ${emailValue}`);
    } else {
      throw new Error('Email input not found!');
    }

    console.log('\nStep 7: Fill password field');
    const passwordInput = await page.locator('input[type="password"]').first();
    const isPasswordVisible = await passwordInput.isVisible({ timeout: 1000 }).catch(() => false);

    if (isPasswordVisible) {
      await passwordInput.fill(DEMO_PASSWORD);
      console.log(`✓ Password filled`);
    } else {
      throw new Error('Password input not found!');
    }

    console.log('\nStep 8: Submit sign in form');
    const submitButtons = await page.locator('button').allTextContents();
    console.log(`  Available buttons: ${submitButtons.join(', ')}`);

    const signInSubmit = await page.locator('button').filter({ hasText: /^Sign In$/ }).last();
    const isSubmitVisible = await signInSubmit.isVisible({ timeout: 1000 }).catch(() => false);

    if (isSubmitVisible) {
      await signInSubmit.click();
      console.log('✓ Clicked submit button');
    } else {
      throw new Error('Submit button not found!');
    }

    console.log('\nStep 9: Wait for sign in to complete');
    console.log('  Waiting for response...');
    await page.waitForTimeout(2000);

    const finalContent = await page.locator('body').textContent();
    const signInSuccessful = finalContent?.includes('Your groups') || finalContent?.includes('Sign Out');

    if (signInSuccessful) {
      console.log('✓ Sign in successful!');
      console.log(`  Page now shows: "Sign Out" or "Your groups"`);
    } else {
      console.log('❌ Sign in may have failed');
      console.log(`  Final page content: ${finalContent?.substring(0, 200)}`);
    }

    console.log('\nStep 10: Verify no rendering errors');
    const renderErrors = consoleLogs.filter(log =>
      log.type === 'error' && log.text.includes('Unexpected text node')
    );
    console.log(`  Text node errors: ${renderErrors.length}`);
    expect(renderErrors.length).toBe(0);

    console.log('\nStep 11: Check API calls made');
    const apiCalls = requests.filter(r => r.url.includes(API_URL));
    console.log(`  Total API calls: ${apiCalls.length}`);
    apiCalls.slice(0, 5).forEach(call => {
      console.log(`    ${call.method} ${call.url.replace(API_URL, '')} - ${call.status}`);
    });

    console.log('\n✅ SIGN IN FLOW COMPLETE\n');
    expect(signInSuccessful).toBeTruthy();
  });

  test('Debug: Check for all text node errors across entire app', async ({ page }) => {
    console.log('\n========== RENDERING HEALTH CHECK ==========\n');

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const textNodeErrors = errors.filter(e => e.includes('Unexpected text node'));
    const renderingHealth = 'Text node errors' in errors ? 0 : errors.length;

    console.log(`Text node errors: ${textNodeErrors.length}`);
    console.log(`Total console errors: ${errors.length}`);

    if (textNodeErrors.length > 0) {
      console.log('❌ Text node errors found:');
      textNodeErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ No text node errors - React rendering is HEALTHY');
    }

    expect(textNodeErrors.length).toBe(0);
  });
});
