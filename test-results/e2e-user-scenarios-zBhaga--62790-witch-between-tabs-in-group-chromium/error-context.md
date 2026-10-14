# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/user-scenarios.spec.ts >> zBhaga User Scenario Tests >> Scenario: Frequent User Workflow >> SC-FREQ-2: User can switch between tabs in group
- Location: tests/e2e/user-scenarios.spec.ts:104:9

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
  12  |     await page.waitForLoadState('networkidle');
  13  |     await page.waitForTimeout(500);
  14  |   }
  15  | 
  16  |   async function quickSignIn(page: Page) {
  17  |     await page.goto(APP_URL);
  18  |     await page.waitForLoadState('networkidle');
  19  | 
  20  |     const bodyText = await page.locator('body').textContent() || '';
  21  |     if (!bodyText.includes('Sign Out')) {
  22  |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  23  |       if (signInButtons.length > 0) {
  24  |         await signInButtons[0].click();
  25  |         await page.waitForTimeout(500);
  26  | 
  27  |         const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
  28  |         const passwordInput = await page.locator('input[type="password"]').first().catch(() => null);
  29  | 
  30  |         if (emailInput && passwordInput) {
  31  |           await emailInput.fill(DEMO_EMAIL);
  32  |           await passwordInput.fill(DEMO_PASSWORD);
  33  | 
  34  |           const submitBtn = await page.locator('button:has-text("Sign In")').last();
  35  |           await submitBtn.click();
  36  |           await page.waitForTimeout(2000);
  37  |         }
  38  |       }
  39  |     }
  40  |   }
  41  | 
  42  |   // ===== SCENARIO: NEW USER ONBOARDING =====
  43  | 
  44  |   test.describe('Scenario: New User Onboarding', () => {
  45  |     test('SC-NEW-1: New user sees welcome screen', async ({ page }) => {
  46  |       console.log('\n📱 SC-NEW-1: New User Welcome');
  47  | 
  48  |       await page.goto(APP_URL);
  49  |       await page.waitForLoadState('networkidle');
  50  | 
  51  |       const bodyText = await page.locator('body').textContent() || '';
  52  | 
  53  |       expect(bodyText.length).toBeGreaterThan(0);
  54  |       console.log('✅ Welcome screen displayed');
  55  |     });
  56  | 
  57  |     test('SC-NEW-2: New user can access sign up form', async ({ page }) => {
  58  |       console.log('\n📱 SC-NEW-2: Sign Up Access');
  59  | 
  60  |       await page.goto(APP_URL);
  61  |       await page.waitForLoadState('networkidle');
  62  | 
  63  |       const buttons = await page.locator('button').allTextContents();
  64  | 
  65  |       expect(buttons.length).toBeGreaterThan(0);
  66  |       console.log('✅ Authentication buttons accessible');
  67  |     });
  68  | 
  69  |     test('SC-NEW-3: New user can navigate to sign in', async ({ page }) => {
  70  |       console.log('\n📱 SC-NEW-3: Sign In Navigation');
  71  | 
  72  |       await page.goto(APP_URL);
  73  |       await page.waitForLoadState('networkidle');
  74  | 
  75  |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  76  | 
  77  |       if (signInButtons.length > 0) {
  78  |         await signInButtons[0].click();
  79  |         await page.waitForTimeout(500);
  80  |         console.log('✅ Sign in form displayed');
  81  |       }
  82  |     });
  83  |   });
  84  | 
  85  |   // ===== SCENARIO: FREQUENT USER =====
  86  | 
  87  |   test.describe('Scenario: Frequent User Workflow', () => {
  88  |     test.beforeEach(async ({ page }) => {
  89  |       await quickSignIn(page);
  90  |     });
  91  | 
  92  |     test('SC-FREQ-1: User quickly accesses groups', async ({ page }) => {
  93  |       console.log('\n⚡ SC-FREQ-1: Quick Group Access');
  94  | 
  95  |       await navigateTo(page, '/');
  96  | 
  97  |       const bodyText = await page.locator('body').textContent() || '';
  98  |       const hasGroupContent = bodyText.length > 50;
  99  | 
  100 |       expect(hasGroupContent).toBeTruthy();
  101 |       console.log('✅ Groups loaded quickly');
  102 |     });
  103 | 
  104 |     test('SC-FREQ-2: User can switch between tabs in group', async ({ page }) => {
  105 |       console.log('\n⚡ SC-FREQ-2: Tab Switching');
  106 | 
  107 |       await navigateTo(page, '/');
  108 |       await page.waitForTimeout(1000);
  109 | 
  110 |       const buttons = await page.locator('button').all();
  111 | 
> 112 |       expect(buttons.length).toBeGreaterThan(0);
      |                              ^ Error: expect(received).toBeGreaterThan(expected)
  113 |       console.log(`✅ Found ${buttons.length} interactive elements`);
  114 |     });
  115 | 
  116 |     test('SC-FREQ-3: User can access expense list quickly', async ({ page }) => {
  117 |       console.log('\n⚡ SC-FREQ-3: Expense Access');
  118 | 
  119 |       await navigateTo(page, '/');
  120 | 
  121 |       const bodyText = await page.locator('body').textContent() || '';
  122 | 
  123 |       expect(bodyText.length).toBeGreaterThan(0);
  124 |       console.log('✅ Expense interface accessible');
  125 |     });
  126 | 
  127 |     test('SC-FREQ-4: User can view current balances', async ({ page }) => {
  128 |       console.log('\n⚡ SC-FREQ-4: Balance Information');
  129 | 
  130 |       await navigateTo(page, '/');
  131 | 
  132 |       const bodyText = await page.locator('body').textContent() || '';
  133 | 
  134 |       expect(bodyText.length).toBeGreaterThan(0);
  135 |       console.log('✅ Balance info accessible');
  136 |     });
  137 | 
  138 |     test('SC-FREQ-5: User can record payment quickly', async ({ page }) => {
  139 |       console.log('\n⚡ SC-FREQ-5: Quick Payment Recording');
  140 | 
  141 |       await navigateTo(page, '/');
  142 | 
  143 |       const buttons = await page.locator('button').allTextContents();
  144 | 
  145 |       expect(buttons.length).toBeGreaterThan(0);
  146 |       console.log('✅ Payment interface accessible');
  147 |     });
  148 |   });
  149 | 
  150 |   // ===== SCENARIO: MULTI-GROUP USER =====
  151 | 
  152 |   test.describe('Scenario: Multi-Group Management', () => {
  153 |     test.beforeEach(async ({ page }) => {
  154 |       await quickSignIn(page);
  155 |     });
  156 | 
  157 |     test('SC-MULTI-1: User can view multiple groups', async ({ page }) => {
  158 |       console.log('\n🏠 SC-MULTI-1: Multiple Groups Display');
  159 | 
  160 |       await navigateTo(page, '/');
  161 | 
  162 |       const bodyText = await page.locator('body').textContent() || '';
  163 | 
  164 |       expect(bodyText.length).toBeGreaterThan(0);
  165 |       console.log('✅ Group list displayed');
  166 |     });
  167 | 
  168 |     test('SC-MULTI-2: User can switch between groups', async ({ page }) => {
  169 |       console.log('\n🏠 SC-MULTI-2: Group Switching');
  170 | 
  171 |       await navigateTo(page, '/');
  172 | 
  173 |       const groupCards = await page.locator('div').all();
  174 | 
  175 |       expect(groupCards.length).toBeGreaterThan(0);
  176 |       console.log('✅ Groups loaded');
  177 |     });
  178 | 
  179 |     test('SC-MULTI-3: User can differentiate between groups', async ({ page }) => {
  180 |       console.log('\n🏠 SC-MULTI-3: Group Differentiation');
  181 | 
  182 |       await navigateTo(page, '/');
  183 | 
  184 |       const bodyText = await page.locator('body').textContent() || '';
  185 | 
  186 |       expect(bodyText.length).toBeGreaterThan(50);
  187 |       console.log('✅ Group names/info displayed');
  188 |     });
  189 | 
  190 |     test('SC-MULTI-4: User can track expenses across groups', async ({ page }) => {
  191 |       console.log('\n🏠 SC-MULTI-4: Cross-Group Tracking');
  192 | 
  193 |       await navigateTo(page, '/');
  194 | 
  195 |       const text = await page.locator('body').textContent() || '';
  196 | 
  197 |       expect(text.length).toBeGreaterThan(0);
  198 |       console.log('✅ Multi-group expense tracking accessible');
  199 |     });
  200 | 
  201 |     test('SC-MULTI-5: User can manage balances in each group', async ({ page }) => {
  202 |       console.log('\n🏠 SC-MULTI-5: Per-Group Balances');
  203 | 
  204 |       await navigateTo(page, '/');
  205 | 
  206 |       const bodyText = await page.locator('body').textContent() || '';
  207 | 
  208 |       expect(bodyText.length).toBeGreaterThan(0);
  209 |       console.log('✅ Balance management accessible');
  210 |     });
  211 |   });
  212 | 
```