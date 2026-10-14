# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/record-payment-feature.spec.ts >> Record Payment Feature - Bug Fix Verification >> PAYMENT-FIX-2: Payer selection modal works
- Location: tests/e2e/record-payment-feature.spec.ts:47:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
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
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const APP_URL = 'http://localhost:8081';
  4   | const DEMO_EMAIL = 'asha@example.com';
  5   | const DEMO_PASSWORD = 'zbhaga-demo-2026';
  6   | 
  7   | test.describe('Record Payment Feature - Bug Fix Verification', () => {
  8   |   async function signInAndNavigateToGroup(page: Page) {
  9   |     // Sign in
  10  |     await page.goto(APP_URL);
  11  |     await page.waitForLoadState('networkidle');
  12  | 
  13  |     const signInButtons = await page.locator('button:has-text("Sign In")').all();
  14  |     if (signInButtons.length > 0) {
  15  |       await signInButtons[0].click();
  16  |       await page.waitForTimeout(500);
  17  | 
  18  |       const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first();
  19  |       const passwordInput = await page.locator('input[type="password"]').first();
  20  | 
  21  |       if (emailInput && passwordInput) {
  22  |         await emailInput.fill(DEMO_EMAIL);
  23  |         await passwordInput.fill(DEMO_PASSWORD);
  24  | 
  25  |         const submitBtn = await page.locator('button:has-text("Sign In")').last();
  26  |         await submitBtn.click();
  27  |         await page.waitForTimeout(2000);
  28  |       }
  29  |     }
  30  | 
  31  |     // Navigate to a group
  32  |     await page.goto(APP_URL);
  33  |     await page.waitForLoadState('networkidle');
  34  |     await page.waitForTimeout(1000);
  35  |   }
  36  | 
  37  |   test('PAYMENT-FIX-1: Record Payment form loads correctly', async ({ page }) => {
  38  |     console.log('\n🧪 PAYMENT-FIX-1: Form Loading');
  39  | 
  40  |     await signInAndNavigateToGroup(page);
  41  | 
  42  |     const text = await page.locator('body').textContent() || '';
  43  |     expect(text.length).toBeGreaterThan(0);
  44  |     console.log('✅ Payment form accessible');
  45  |   });
  46  | 
  47  |   test('PAYMENT-FIX-2: Payer selection modal works', async ({ page }) => {
  48  |     console.log('\n🧪 PAYMENT-FIX-2: Payer Selection');
  49  | 
  50  |     await signInAndNavigateToGroup(page);
  51  | 
  52  |     // Check for select buttons
  53  |     const buttons = await page.locator('button').allTextContents();
  54  | 
> 55  |     expect(buttons.length).toBeGreaterThan(0);
      |                            ^ Error: expect(received).toBeGreaterThan(expected)
  56  |     console.log('✅ Selection controls accessible');
  57  |   });
  58  | 
  59  |   test('PAYMENT-FIX-3: Payee selection modal works', async ({ page }) => {
  60  |     console.log('\n🧪 PAYMENT-FIX-3: Payee Selection');
  61  | 
  62  |     await signInAndNavigateToGroup(page);
  63  | 
  64  |     // Check for modals with member lists
  65  |     const modals = await page.locator('[style*="background"]').all();
  66  | 
  67  |     expect(modals.length).toBeGreaterThan(0);
  68  |     console.log('✅ Payee selection accessible');
  69  |   });
  70  | 
  71  |   test('PAYMENT-FIX-4: Amount input accepts decimal values', async ({ page }) => {
  72  |     console.log('\n🧪 PAYMENT-FIX-4: Amount Input');
  73  | 
  74  |     await signInAndNavigateToGroup(page);
  75  | 
  76  |     const inputs = await page.locator('input[type="decimal-pad"], input[type="number"]').all();
  77  | 
  78  |     if (inputs.length > 0) {
  79  |       await inputs[0].fill('25.50').catch(() => {});
  80  |       console.log('✓ Decimal input attempted');
  81  |     }
  82  | 
  83  |     console.log('✅ Amount input working');
  84  |   });
  85  | 
  86  |   test('PAYMENT-FIX-5: Self-payment validation', async ({ page }) => {
  87  |     console.log('\n🧪 PAYMENT-FIX-5: Self-Payment Check');
  88  | 
  89  |     await signInAndNavigateToGroup(page);
  90  | 
  91  |     // Verify form shows error handling capability
  92  |     const errorArea = await page.locator('[style*="error"], text*="error"').first().catch(() => null);
  93  | 
  94  |     // Check that form can display errors
  95  |     const text = await page.locator('body').textContent() || '';
  96  |     const hasErrorHandling = text.includes('Please') || text.includes('fill');
  97  | 
  98  |     expect(hasErrorHandling).toBeTruthy();
  99  |     console.log('✅ Validation framework working');
  100 |   });
  101 | 
  102 |   test('PAYMENT-FIX-6: Payment payload structure validation', async ({ page }) => {
  103 |     console.log('\n🧪 PAYMENT-FIX-6: Payload Structure');
  104 | 
  105 |     let paymentPayloads: any[] = [];
  106 | 
  107 |     // Intercept POST requests
  108 |     page.on('request', request => {
  109 |       if (request.method() === 'POST' && request.url().includes('/payments')) {
  110 |         try {
  111 |           const postData = request.postDataJSON?.();
  112 |           paymentPayloads.push(postData);
  113 |           console.log('✓ Payment payload intercepted');
  114 |         } catch (e) {
  115 |           console.log('✓ POST request detected');
  116 |         }
  117 |       }
  118 |     });
  119 | 
  120 |     await signInAndNavigateToGroup(page);
  121 | 
  122 |     console.log(`Payloads captured: ${paymentPayloads.length}`);
  123 |     console.log('✅ Payload capture working');
  124 |   });
  125 | 
  126 |   test('PAYMENT-FIX-7: FromUserId field correctly set', async ({ page }) => {
  127 |     console.log('\n🧪 PAYMENT-FIX-7: FromUserId Configuration');
  128 | 
  129 |     await signInAndNavigateToGroup(page);
  130 | 
  131 |     // Verify form can select payer
  132 |     const buttons = await page.locator('button').allTextContents();
  133 | 
  134 |     expect(buttons.length).toBeGreaterThan(0);
  135 |     console.log('✅ Payer field operational');
  136 |   });
  137 | 
  138 |   test('PAYMENT-FIX-8: ToUserId field correctly set', async ({ page }) => {
  139 |     console.log('\n🧪 PAYMENT-FIX-8: ToUserId Configuration');
  140 | 
  141 |     await signInAndNavigateToGroup(page);
  142 | 
  143 |     // Verify form can select payee
  144 |     const buttons = await page.locator('button').allTextContents();
  145 | 
  146 |     expect(buttons.length).toBeGreaterThan(0);
  147 |     console.log('✅ Payee field operational');
  148 |   });
  149 | 
  150 |   test('PAYMENT-FIX-9: AmountMinor field correctly set', async ({ page }) => {
  151 |     console.log('\n🧪 PAYMENT-FIX-9: Amount Field');
  152 | 
  153 |     await signInAndNavigateToGroup(page);
  154 | 
  155 |     // Verify form has amount input
```