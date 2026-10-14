# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/signin-debug.spec.ts >> Sign In Flow - Full Validation & Debugging >> Complete Sign In Flow with Full Validation
- Location: tests/e2e/signin-debug.spec.ts:10:7

# Error details

```
Error: Sign In button not found!
```

# Page snapshot

```yaml
- generic [ref=f1e6]:
  - generic [ref=f1e11]:
    - generic [ref=f1e14]:
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - generic [ref=f1e17]: Hello,
          - generic [ref=f1e18]: Your groups
        - generic [ref=f1e19] [cursor=pointer]: Sign Out
      - generic [ref=f1e21]:
        - generic [ref=f1e22]: No groups yet
        - generic [ref=f1e23]: Create or join a group to get started
      - generic [ref=f1e24]:
        - generic [ref=f1e25] [cursor=pointer]: + Create
        - generic [ref=f1e27] [cursor=pointer]: Join
    - heading "zBhaga" [level=1] [ref=f1e31]
  - heading "(home)" [level=1] [ref=f1e34]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const APP_URL = 'http://localhost:8081';
  4   | const API_URL = 'http://localhost:4000';
  5   | const DEMO_EMAIL = 'asha@example.com';
  6   | const DEMO_PASSWORD = 'zbhaga-demo-2026';
  7   | 
  8   | test.describe('Sign In Flow - Full Validation & Debugging', () => {
  9   | 
  10  |   test('Complete Sign In Flow with Full Validation', async ({ page, context }) => {
  11  |     console.log('\n========== COMPLETE SIGN IN FLOW ==========\n');
  12  | 
  13  |     // Track all requests
  14  |     const requests: { url: string; method: string; status?: number }[] = [];
  15  |     page.on('response', response => {
  16  |       requests.push({
  17  |         url: response.url(),
  18  |         method: response.request().method(),
  19  |         status: response.status()
  20  |       });
  21  |       if (response.status() >= 400) {
  22  |         console.log(`📡 API ${response.status()}: ${response.url()}`);
  23  |       }
  24  |     });
  25  | 
  26  |     // Track console messages
  27  |     const consoleLogs: { type: string; text: string }[] = [];
  28  |     page.on('console', msg => {
  29  |       consoleLogs.push({ type: msg.type(), text: msg.text() });
  30  |       if (msg.type() === 'error') {
  31  |         console.log(`❌ Console Error: ${msg.text().substring(0, 100)}`);
  32  |       }
  33  |     });
  34  | 
  35  |     console.log('Step 1: Navigate to app');
  36  |     await page.goto(APP_URL);
  37  |     await page.waitForLoadState('networkidle');
  38  | 
  39  |     const initialContent = await page.locator('body').textContent();
  40  |     console.log('✓ App loaded');
  41  |     console.log(`  Page content preview: ${initialContent?.substring(0, 100)}`);
  42  | 
  43  |     // Check if already signed in
  44  |     const isSignedIn = initialContent?.includes('Sign Out');
  45  |     console.log(`\nStep 2: Check authentication state`);
  46  |     console.log(`  Currently signed in: ${isSignedIn}`);
  47  | 
  48  |     if (isSignedIn) {
  49  |       console.log('\nStep 3: Sign out first (already authenticated)');
  50  |       const signOutBtn = await page.locator('button:has-text("Sign Out")').first();
  51  |       if (await signOutBtn.isVisible()) {
  52  |         await signOutBtn.click();
  53  |         console.log('✓ Clicked Sign Out');
  54  |         await page.waitForTimeout(1500);
  55  |       }
  56  |     }
  57  | 
  58  |     console.log('\nStep 3: Navigate to Welcome screen');
  59  |     await page.goto(APP_URL);
  60  |     await page.waitForLoadState('networkidle');
  61  | 
  62  |     const welcomeText = await page.locator('body').textContent();
  63  |     console.log(`✓ Welcome screen loaded`);
  64  |     console.log(`  Contains "Sign In": ${welcomeText?.includes('Sign In')}`);
  65  |     console.log(`  Contains "zBhaga": ${welcomeText?.includes('zBhaga')}`);
  66  | 
  67  |     console.log('\nStep 4: Find and click Sign In button');
  68  |     const signInButtons = await page.locator('button').allTextContents();
  69  |     console.log(`  Available buttons: ${signInButtons.join(', ')}`);
  70  | 
  71  |     const signInBtn = await page.locator('button').filter({ hasText: /^Sign In$/ }).first();
  72  |     const isSignInVisible = await signInBtn.isVisible({ timeout: 2000 }).catch(() => false);
  73  |     console.log(`  Sign In button visible: ${isSignInVisible}`);
  74  | 
  75  |     if (isSignInVisible) {
  76  |       await signInBtn.click();
  77  |       console.log('✓ Clicked Sign In button');
  78  |       await page.waitForTimeout(800);
  79  |     } else {
> 80  |       throw new Error('Sign In button not found!');
      |             ^ Error: Sign In button not found!
  81  |     }
  82  | 
  83  |     console.log('\nStep 5: Verify on Sign In page');
  84  |     const signInPageText = await page.locator('body').textContent();
  85  |     console.log(`✓ On sign in page`);
  86  |     console.log(`  Page contains "Email": ${signInPageText?.includes('Email')}`);
  87  |     console.log(`  Page contains "Password": ${signInPageText?.includes('Password')}`);
  88  | 
  89  |     console.log('\nStep 6: Fill email field');
  90  |     const emailInputs = await page.locator('input[type="text"], input[type="email"]').all();
  91  |     console.log(`  Found ${emailInputs.length} text inputs`);
  92  | 
  93  |     if (emailInputs.length > 0) {
  94  |       await emailInputs[0].fill(DEMO_EMAIL);
  95  |       const emailValue = await emailInputs[0].inputValue();
  96  |       console.log(`✓ Email filled: ${emailValue}`);
  97  |     } else {
  98  |       throw new Error('Email input not found!');
  99  |     }
  100 | 
  101 |     console.log('\nStep 7: Fill password field');
  102 |     const passwordInput = await page.locator('input[type="password"]').first();
  103 |     const isPasswordVisible = await passwordInput.isVisible({ timeout: 1000 }).catch(() => false);
  104 | 
  105 |     if (isPasswordVisible) {
  106 |       await passwordInput.fill(DEMO_PASSWORD);
  107 |       console.log(`✓ Password filled`);
  108 |     } else {
  109 |       throw new Error('Password input not found!');
  110 |     }
  111 | 
  112 |     console.log('\nStep 8: Submit sign in form');
  113 |     const submitButtons = await page.locator('button').allTextContents();
  114 |     console.log(`  Available buttons: ${submitButtons.join(', ')}`);
  115 | 
  116 |     const signInSubmit = await page.locator('button').filter({ hasText: /^Sign In$/ }).last();
  117 |     const isSubmitVisible = await signInSubmit.isVisible({ timeout: 1000 }).catch(() => false);
  118 | 
  119 |     if (isSubmitVisible) {
  120 |       await signInSubmit.click();
  121 |       console.log('✓ Clicked submit button');
  122 |     } else {
  123 |       throw new Error('Submit button not found!');
  124 |     }
  125 | 
  126 |     console.log('\nStep 9: Wait for sign in to complete');
  127 |     console.log('  Waiting for response...');
  128 |     await page.waitForTimeout(2000);
  129 | 
  130 |     const finalContent = await page.locator('body').textContent();
  131 |     const signInSuccessful = finalContent?.includes('Your groups') || finalContent?.includes('Sign Out');
  132 | 
  133 |     if (signInSuccessful) {
  134 |       console.log('✓ Sign in successful!');
  135 |       console.log(`  Page now shows: "Sign Out" or "Your groups"`);
  136 |     } else {
  137 |       console.log('❌ Sign in may have failed');
  138 |       console.log(`  Final page content: ${finalContent?.substring(0, 200)}`);
  139 |     }
  140 | 
  141 |     console.log('\nStep 10: Verify no rendering errors');
  142 |     const renderErrors = consoleLogs.filter(log =>
  143 |       log.type === 'error' && log.text.includes('Unexpected text node')
  144 |     );
  145 |     console.log(`  Text node errors: ${renderErrors.length}`);
  146 |     expect(renderErrors.length).toBe(0);
  147 | 
  148 |     console.log('\nStep 11: Check API calls made');
  149 |     const apiCalls = requests.filter(r => r.url.includes(API_URL));
  150 |     console.log(`  Total API calls: ${apiCalls.length}`);
  151 |     apiCalls.slice(0, 5).forEach(call => {
  152 |       console.log(`    ${call.method} ${call.url.replace(API_URL, '')} - ${call.status}`);
  153 |     });
  154 | 
  155 |     console.log('\n✅ SIGN IN FLOW COMPLETE\n');
  156 |     expect(signInSuccessful).toBeTruthy();
  157 |   });
  158 | 
  159 |   test('Debug: Check for all text node errors across entire app', async ({ page }) => {
  160 |     console.log('\n========== RENDERING HEALTH CHECK ==========\n');
  161 | 
  162 |     const errors: string[] = [];
  163 |     page.on('console', msg => {
  164 |       if (msg.type() === 'error') {
  165 |         errors.push(msg.text());
  166 |       }
  167 |     });
  168 | 
  169 |     await page.goto(APP_URL);
  170 |     await page.waitForLoadState('networkidle');
  171 |     await page.waitForTimeout(2000);
  172 | 
  173 |     const textNodeErrors = errors.filter(e => e.includes('Unexpected text node'));
  174 |     const renderingHealth = 'Text node errors' in errors ? 0 : errors.length;
  175 | 
  176 |     console.log(`Text node errors: ${textNodeErrors.length}`);
  177 |     console.log(`Total console errors: ${errors.length}`);
  178 | 
  179 |     if (textNodeErrors.length > 0) {
  180 |       console.log('❌ Text node errors found:');
```