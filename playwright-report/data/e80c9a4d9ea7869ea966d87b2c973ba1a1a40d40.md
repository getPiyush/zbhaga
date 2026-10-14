# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/complete-flow.spec.ts >> Complete User Journey - Full Validation >> Full Flow: Sign Out → Sign In → View Groups → Add Expense
- Location: tests/e2e/complete-flow.spec.ts:9:7

# Error details

```
Error: Sign In button not found on welcome screen
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_URL = 'http://localhost:8081';
  4   | const DEMO_EMAIL = 'asha@example.com';
  5   | const DEMO_PASSWORD = 'zbhaga-demo-2026';
  6   | 
  7   | test.describe('Complete User Journey - Full Validation', () => {
  8   | 
  9   |   test('Full Flow: Sign Out → Sign In → View Groups → Add Expense', async ({ browser }) => {
  10  |     console.log('\n' + '='.repeat(60));
  11  |     console.log('       COMPLETE USER JOURNEY - FULL VALIDATION');
  12  |     console.log('='.repeat(60) + '\n');
  13  | 
  14  |     const context = await browser.newContext();
  15  |     const page = await context.newPage();
  16  | 
  17  |     // Set up error tracking
  18  |     const errors: { type: string; message: string }[] = [];
  19  |     page.on('console', msg => {
  20  |       if (msg.type() === 'error') {
  21  |         errors.push({ type: 'console', message: msg.text() });
  22  |       }
  23  |     });
  24  | 
  25  |     try {
  26  |       // PHASE 1: Navigate to app
  27  |       console.log('\n📍 PHASE 1: App Initialization');
  28  |       console.log('-'.repeat(60));
  29  |       await page.goto(APP_URL);
  30  |       await page.waitForLoadState('networkidle');
  31  |       console.log('✓ Navigated to app');
  32  | 
  33  |       let pageText = await page.locator('body').textContent();
  34  |       const isLoggedIn = pageText?.includes('Sign Out');
  35  |       console.log(`✓ Auth state: ${isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT'}`);
  36  | 
  37  |       // PHASE 2: Sign out if needed
  38  |       if (isLoggedIn) {
  39  |         console.log('\n📍 PHASE 2: Sign Out (Already Authenticated)');
  40  |         console.log('-'.repeat(60));
  41  | 
  42  |         const signOutBtn = await page.locator('button:has-text("Sign Out")').first();
  43  |         if (await signOutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  44  |           await signOutBtn.click();
  45  |           console.log('✓ Clicked Sign Out button');
  46  |           await page.waitForTimeout(1500);
  47  | 
  48  |           pageText = await page.locator('body').textContent();
  49  |           console.log(`✓ Sign out complete, now on: ${pageText?.substring(0, 50)}`);
  50  |         }
  51  |       }
  52  | 
  53  |       // PHASE 3: Welcome screen
  54  |       console.log('\n📍 PHASE 3: Welcome Screen');
  55  |       console.log('-'.repeat(60));
  56  | 
  57  |       await page.goto(APP_URL);
  58  |       await page.waitForLoadState('networkidle');
  59  | 
  60  |       pageText = await page.locator('body').textContent();
  61  |       console.log(`✓ Welcome screen content: ${pageText?.substring(0, 100)}`);
  62  | 
  63  |       // Find Sign In button
  64  |       const buttons = await page.locator('button').all();
  65  |       console.log(`✓ Found ${buttons.length} buttons on page`);
  66  | 
  67  |       let signInButton = null;
  68  |       for (const btn of buttons) {
  69  |         const text = await btn.textContent();
  70  |         if (text?.trim() === 'Sign In') {
  71  |           signInButton = btn;
  72  |           break;
  73  |         }
  74  |       }
  75  | 
  76  |       if (!signInButton) {
> 77  |         throw new Error('Sign In button not found on welcome screen');
      |               ^ Error: Sign In button not found on welcome screen
  78  |       }
  79  |       console.log('✓ Sign In button located');
  80  | 
  81  |       // PHASE 4: Click Sign In
  82  |       console.log('\n📍 PHASE 4: Navigate to Sign In Form');
  83  |       console.log('-'.repeat(60));
  84  | 
  85  |       await signInButton.click();
  86  |       console.log('✓ Clicked Sign In button');
  87  |       await page.waitForLoadState('networkidle');
  88  |       await page.waitForTimeout(600);
  89  | 
  90  |       pageText = await page.locator('body').textContent();
  91  |       const onSignInPage = pageText?.includes('Email') && pageText?.includes('Password');
  92  | 
  93  |       if (!onSignInPage) {
  94  |         throw new Error(`Not on sign in page. Content: ${pageText?.substring(0, 100)}`);
  95  |       }
  96  |       console.log('✓ Successfully navigated to Sign In form');
  97  | 
  98  |       // PHASE 5: Fill form
  99  |       console.log('\n📍 PHASE 5: Fill Sign In Form');
  100 |       console.log('-'.repeat(60));
  101 | 
  102 |       const inputs = await page.locator('input').all();
  103 |       console.log(`✓ Found ${inputs.length} input fields`);
  104 | 
  105 |       if (inputs.length < 2) {
  106 |         throw new Error('Expected at least 2 input fields (email, password)');
  107 |       }
  108 | 
  109 |       await inputs[0].fill(DEMO_EMAIL);
  110 |       const filledEmail = await inputs[0].inputValue();
  111 |       console.log(`✓ Filled email: ${filledEmail}`);
  112 | 
  113 |       await inputs[1].fill(DEMO_PASSWORD);
  114 |       console.log(`✓ Filled password`);
  115 | 
  116 |       // PHASE 6: Submit form
  117 |       console.log('\n📍 PHASE 6: Submit Sign In Form');
  118 |       console.log('-'.repeat(60));
  119 | 
  120 |       const submitBtns = await page.locator('button').all();
  121 |       let submitButton = null;
  122 |       for (const btn of submitBtns) {
  123 |         const text = await btn.textContent();
  124 |         if (text?.trim() === 'Sign In') {
  125 |           submitButton = btn;
  126 |         }
  127 |       }
  128 | 
  129 |       if (!submitButton) {
  130 |         throw new Error('Submit button not found');
  131 |       }
  132 | 
  133 |       await submitButton.click();
  134 |       console.log('✓ Submitted Sign In form');
  135 |       console.log('  Waiting for sign in response...');
  136 | 
  137 |       await page.waitForTimeout(2500);
  138 | 
  139 |       // PHASE 7: Verify sign in
  140 |       console.log('\n📍 PHASE 7: Verify Sign In Success');
  141 |       console.log('-'.repeat(60));
  142 | 
  143 |       pageText = await page.locator('body').textContent();
  144 |       const signedIn = pageText?.includes('Your groups') || pageText?.includes('Sign Out');
  145 | 
  146 |       if (!signedIn) {
  147 |         console.log(`❌ Sign in failed. Page shows: ${pageText?.substring(0, 150)}`);
  148 |         throw new Error('Sign in did not complete successfully');
  149 |       }
  150 |       console.log('✓ Sign in successful!');
  151 |       console.log(`✓ Now viewing: ${pageText?.substring(0, 80)}`);
  152 | 
  153 |       // PHASE 8: Check rendering health
  154 |       console.log('\n📍 PHASE 8: Rendering Health Check');
  155 |       console.log('-'.repeat(60));
  156 | 
  157 |       const textNodeErrors = errors.filter(e =>
  158 |         e.message.includes('Unexpected text node')
  159 |       );
  160 | 
  161 |       console.log(`✓ Text node errors: ${textNodeErrors.length}`);
  162 |       console.log(`✓ Total console errors: ${errors.length}`);
  163 | 
  164 |       if (textNodeErrors.length > 0) {
  165 |         textNodeErrors.forEach(e => console.log(`  ❌ ${e.message}`));
  166 |         throw new Error(`Found ${textNodeErrors.length} text node errors`);
  167 |       }
  168 | 
  169 |       console.log('✓ React rendering is HEALTHY');
  170 | 
  171 |       // PHASE 9: Home screen features
  172 |       console.log('\n📍 PHASE 9: Verify Home Screen Features');
  173 |       console.log('-'.repeat(60));
  174 | 
  175 |       const hasCreateButton = pageText?.includes('Create');
  176 |       const hasJoinButton = pageText?.includes('Join');
  177 |       const hasSignOut = pageText?.includes('Sign Out');
```