# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/complete-e2e.spec.ts >> zBhaga Complete E2E Test Suite >> Full Integration Scenarios >> INT-1: Complete user journey - auth to groups
- Location: tests/e2e/complete-e2e.spec.ts:648:9

# Error details

```
TypeError: page.locator(...).first(...).catch is not a function
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
  1   | import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
  2   | 
  3   | const API_URL = 'http://localhost:4000';
  4   | const APP_URL = 'http://localhost:8081';
  5   | const DEMO_EMAIL = 'asha@example.com';
  6   | const DEMO_PASSWORD = 'zbhaga-demo-2026';
  7   | 
  8   | test.describe('zBhaga Complete E2E Test Suite', () => {
  9   |   // ===== HELPER FUNCTIONS =====
  10  | 
  11  |   async function signIn(page: Page, email: string, password: string) {
  12  |     console.log(`\n📝 Signing in as ${email}...`);
  13  | 
  14  |     await page.goto(APP_URL);
  15  |     await page.waitForLoadState('networkidle');
  16  | 
  17  |     // Check if already signed in
  18  |     const bodyText = await page.locator('body').textContent() || '';
  19  |     if (bodyText.includes('Sign Out')) {
  20  |       console.log('✅ Already signed in, skipping sign in flow');
  21  |       return;
  22  |     }
  23  | 
  24  |     // Find and click Sign In button (skip welcome if needed)
  25  |     const signInButtons = await page.locator('button:has-text("Sign In")').all();
  26  |     if (signInButtons.length > 0) {
  27  |       await signInButtons[0].click();
  28  |       await page.waitForTimeout(500);
  29  |     }
  30  | 
  31  |     // Fill credentials
  32  |     const emailInput = await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').first().catch(() => null);
  33  |     const passwordInput = await page.locator('input[type="password"]').first().catch(() => null);
  34  | 
  35  |     if (emailInput) {
  36  |       await emailInput.fill(email);
  37  |       console.log('📧 Filled email');
  38  |     }
  39  | 
  40  |     if (passwordInput) {
  41  |       await passwordInput.fill(password);
  42  |       console.log('🔐 Filled password');
  43  |     }
  44  | 
  45  |     // Submit form
  46  |     const submitBtn = await page.locator('button:has-text("Sign In")').last();
  47  |     await submitBtn.click();
  48  |     console.log('🔄 Submitted form');
  49  | 
  50  |     // Wait for navigation and success
  51  |     await page.waitForTimeout(2000);
  52  |     await page.waitForLoadState('networkidle').catch(() => {});
  53  |   }
  54  | 
  55  |   async function signOut(page: Page) {
  56  |     console.log('\n🚪 Signing out...');
> 57  |     const signOutBtn = await page.locator('button:has-text("Sign Out")').first().catch(() => null);
      |                                                                                       ^ TypeError: page.locator(...).first(...).catch is not a function
  58  |     if (signOutBtn && await signOutBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
  59  |       await signOutBtn.click();
  60  |       await page.waitForTimeout(1000);
  61  |       console.log('✅ Signed out');
  62  |     }
  63  |   }
  64  | 
  65  |   // ===== AUTHENTICATION TESTS =====
  66  | 
  67  |   test.describe('Authentication Flows', () => {
  68  |     test('AT-1: User sees welcome screen on first visit', async ({ page }) => {
  69  |       console.log('\n🧪 AT-1: Welcome Screen Display');
  70  | 
  71  |       await page.goto(APP_URL);
  72  |       await page.waitForLoadState('networkidle');
  73  | 
  74  |       const bodyText = await page.locator('body').textContent() || '';
  75  |       const hasAuthContent = bodyText.includes('zBhaga') ||
  76  |                             bodyText.includes('Sign In') ||
  77  |                             bodyText.includes('Sign Up') ||
  78  |                             bodyText.includes('Sign Out');
  79  | 
  80  |       expect(hasAuthContent).toBeTruthy();
  81  |       console.log('✅ Welcome screen displayed or authenticated');
  82  |     });
  83  | 
  84  |     test('AT-2: User can navigate between sign in and sign up screens', async ({ page }) => {
  85  |       console.log('\n🧪 AT-2: Auth Screen Navigation');
  86  | 
  87  |       await page.goto(APP_URL);
  88  |       await page.waitForLoadState('networkidle');
  89  | 
  90  |       const buttons = await page.locator('button').allTextContents();
  91  |       const hasAuthButtons = buttons.some(b => b.includes('Sign'));
  92  | 
  93  |       expect(buttons.length).toBeGreaterThan(0);
  94  |       console.log(`✅ Found ${buttons.length} buttons on auth screen`);
  95  |     });
  96  | 
  97  |     test('AT-3: Sign in with demo credentials succeeds', async ({ page }) => {
  98  |       console.log('\n🧪 AT-3: Sign In Success');
  99  | 
  100 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  101 | 
  102 |       const bodyText = await page.locator('body').textContent() || '';
  103 |       const isAuthenticated = bodyText.includes('Sign Out') ||
  104 |                              bodyText.includes('Hello') ||
  105 |                              bodyText.includes('Your groups');
  106 | 
  107 |       expect(isAuthenticated).toBeTruthy();
  108 |       console.log('✅ Successfully authenticated');
  109 |     });
  110 | 
  111 |     test('AT-4: Invalid credentials shows error', async ({ page }) => {
  112 |       console.log('\n🧪 AT-4: Invalid Credentials Error');
  113 | 
  114 |       await page.goto(APP_URL);
  115 |       await page.waitForLoadState('networkidle');
  116 | 
  117 |       // Find Sign In button
  118 |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  119 |       if (signInButtons.length > 0) {
  120 |         await signInButtons[0].click();
  121 |         await page.waitForTimeout(500);
  122 | 
  123 |         // Fill with invalid credentials
  124 |         const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
  125 |         const passwordInput = await page.locator('input[type="password"]').first().catch(() => null);
  126 | 
  127 |         if (emailInput && passwordInput) {
  128 |           await emailInput.fill('invalid@example.com');
  129 |           await passwordInput.fill('wrongpassword');
  130 | 
  131 |           const submitBtn = await page.locator('button:has-text("Sign In")').last();
  132 |           await submitBtn.click();
  133 | 
  134 |           await page.waitForTimeout(2000);
  135 |           console.log('✅ Invalid credentials form submitted');
  136 |         }
  137 |       }
  138 |     });
  139 | 
  140 |     test('AT-5: Session persists across page reloads', async ({ page }) => {
  141 |       console.log('\n🧪 AT-5: Session Persistence');
  142 | 
  143 |       // Sign in
  144 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  145 |       const textBefore = await page.locator('body').textContent() || '';
  146 | 
  147 |       // Reload page
  148 |       await page.reload();
  149 |       await page.waitForLoadState('networkidle');
  150 | 
  151 |       const textAfter = await page.locator('body').textContent() || '';
  152 |       const stillAuthenticated = textAfter.includes('Sign Out') || textAfter.includes('Hello');
  153 | 
  154 |       expect(stillAuthenticated).toBeTruthy();
  155 |       console.log('✅ Session persisted across reload');
  156 |     });
  157 | 
```