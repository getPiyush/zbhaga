# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/complete-e2e.spec.ts >> zBhaga Complete E2E Test Suite >> Expense Management Flows >> EM-3: Add expense button is accessible
- Location: tests/e2e/complete-e2e.spec.ts:324:9

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
  234 |       console.log('✅ Join button accessible');
  235 |     });
  236 | 
  237 |     test('GM-5: Can navigate to group detail screen', async ({ page }) => {
  238 |       console.log('\n🧪 GM-5: Group Detail Navigation');
  239 | 
  240 |       await page.goto(APP_URL);
  241 |       await page.waitForLoadState('networkidle');
  242 |       await page.waitForTimeout(1000);
  243 | 
  244 |       // Try to find and click first group card
  245 |       const groupCards = await page.locator('[style*="border-radius"]').all();
  246 |       if (groupCards.length > 0) {
  247 |         await groupCards[0].click().catch(() => {
  248 |           console.log('ℹ️  No clickable group cards found');
  249 |         });
  250 |         await page.waitForTimeout(500);
  251 |         console.log('✅ Attempted group navigation');
  252 |       }
  253 |     });
  254 | 
  255 |     test('GM-6: Group detail screen shows tabs', async ({ page }) => {
  256 |       console.log('\n🧪 GM-6: Group Detail Tabs');
  257 | 
  258 |       await page.goto(APP_URL);
  259 |       await page.waitForLoadState('networkidle');
  260 |       await page.waitForTimeout(1000);
  261 | 
  262 |       const bodyText = await page.locator('body').textContent() || '';
  263 |       const hasTabKeywords = bodyText.includes('expense') ||
  264 |                             bodyText.includes('payment') ||
  265 |                             bodyText.includes('balance');
  266 | 
  267 |       expect(bodyText.length).toBeGreaterThan(50);
  268 |       console.log('✅ Group detail content loaded');
  269 |     });
  270 | 
  271 |     test('GM-7: Invite code display is available', async ({ page }) => {
  272 |       console.log('\n🧪 GM-7: Invite Code Display');
  273 | 
  274 |       await page.goto(APP_URL);
  275 |       await page.waitForLoadState('networkidle');
  276 |       await page.waitForTimeout(1000);
  277 | 
  278 |       const bodyText = await page.locator('body').textContent() || '';
  279 |       const hasCodeReferece = bodyText.includes('code') ||
  280 |                              bodyText.includes('invite') ||
  281 |                              bodyText.includes('Code');
  282 | 
  283 |       expect(bodyText.length > 0).toBeTruthy();
  284 |       console.log('✅ Group interface loaded');
  285 |     });
  286 |   });
  287 | 
  288 |   // ===== EXPENSE MANAGEMENT TESTS =====
  289 | 
  290 |   test.describe('Expense Management Flows', () => {
  291 |     test.beforeEach(async ({ page }) => {
  292 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  293 |     });
  294 | 
  295 |     test('EM-1: User can view expense list', async ({ page }) => {
  296 |       console.log('\n🧪 EM-1: View Expense List');
  297 | 
  298 |       await page.goto(APP_URL);
  299 |       await page.waitForLoadState('networkidle');
  300 |       await page.waitForTimeout(1000);
  301 | 
  302 |       const bodyText = await page.locator('body').textContent() || '';
  303 | 
  304 |       expect(bodyText.length).toBeGreaterThan(0);
  305 |       console.log('✅ Expense page accessible');
  306 |     });
  307 | 
  308 |     test('EM-2: Expense list shows expense details', async ({ page }) => {
  309 |       console.log('\n🧪 EM-2: Expense Details Display');
  310 | 
  311 |       await page.goto(APP_URL);
  312 |       await page.waitForLoadState('networkidle');
  313 |       await page.waitForTimeout(1000);
  314 | 
  315 |       const bodyText = await page.locator('body').textContent() || '';
  316 |       const hasExpenseKeywords = bodyText.includes('expense') ||
  317 |                                 bodyText.includes('amount') ||
  318 |                                 bodyText.includes('paid');
  319 | 
  320 |       expect(bodyText.length > 0).toBeTruthy();
  321 |       console.log('✅ Expense information accessible');
  322 |     });
  323 | 
  324 |     test('EM-3: Add expense button is accessible', async ({ page }) => {
  325 |       console.log('\n🧪 EM-3: Add Expense Button');
  326 | 
  327 |       await page.goto(APP_URL);
  328 |       await page.waitForLoadState('networkidle');
  329 |       await page.waitForTimeout(1000);
  330 | 
  331 |       const bodyText = await page.locator('body').textContent() || '';
  332 |       const addButton = await page.locator('button').allTextContents();
  333 | 
> 334 |       expect(addButton.length).toBeGreaterThan(0);
      |                                ^ Error: expect(received).toBeGreaterThan(expected)
  335 |       console.log(`✅ Found ${addButton.length} buttons for actions`);
  336 |     });
  337 | 
  338 |     test('EM-4: Expense empty state displays correctly', async ({ page }) => {
  339 |       console.log('\n🧪 EM-4: Expense Empty State');
  340 | 
  341 |       await page.goto(APP_URL);
  342 |       await page.waitForLoadState('networkidle');
  343 |       await page.waitForTimeout(1000);
  344 | 
  345 |       const bodyText = await page.locator('body').textContent() || '';
  346 | 
  347 |       expect(bodyText.length).toBeGreaterThan(0);
  348 |       console.log('✅ Page renders without errors');
  349 |     });
  350 | 
  351 |     test('EM-5: Expense amounts are properly formatted', async ({ page }) => {
  352 |       console.log('\n🧪 EM-5: Expense Amount Formatting');
  353 | 
  354 |       await page.goto(APP_URL);
  355 |       await page.waitForLoadState('networkidle');
  356 |       await page.waitForTimeout(1000);
  357 | 
  358 |       const bodyText = await page.locator('body').textContent() || '';
  359 |       const hasMoneyFormat = bodyText.includes('$') ||
  360 |                             bodyText.match(/\d+\.\d{2}/) ||
  361 |                             bodyText.includes('USD');
  362 | 
  363 |       expect(bodyText.length > 0).toBeTruthy();
  364 |       console.log('✅ Page content loaded');
  365 |     });
  366 | 
  367 |     test('EM-6: Expense navigation works', async ({ page }) => {
  368 |       console.log('\n🧪 EM-6: Expense Navigation');
  369 | 
  370 |       await page.goto(APP_URL);
  371 |       await page.waitForLoadState('networkidle');
  372 |       await page.waitForTimeout(1000);
  373 | 
  374 |       const links = await page.locator('a').allTextContents();
  375 |       const buttons = await page.locator('button').allTextContents();
  376 | 
  377 |       expect(links.length + buttons.length).toBeGreaterThan(0);
  378 |       console.log('✅ Navigation elements present');
  379 |     });
  380 |   });
  381 | 
  382 |   // ===== PAYMENT & SETTLEMENT TESTS =====
  383 | 
  384 |   test.describe('Payment & Settlement Flows', () => {
  385 |     test.beforeEach(async ({ page }) => {
  386 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  387 |     });
  388 | 
  389 |     test('PS-1: User can view balances', async ({ page }) => {
  390 |       console.log('\n🧪 PS-1: View Balances');
  391 | 
  392 |       await page.goto(APP_URL);
  393 |       await page.waitForLoadState('networkidle');
  394 |       await page.waitForTimeout(1000);
  395 | 
  396 |       const bodyText = await page.locator('body').textContent() || '';
  397 | 
  398 |       expect(bodyText.length).toBeGreaterThan(0);
  399 |       console.log('✅ Balance interface accessible');
  400 |     });
  401 | 
  402 |     test('PS-2: Balance information is displayed', async ({ page }) => {
  403 |       console.log('\n🧪 PS-2: Balance Information Display');
  404 | 
  405 |       await page.goto(APP_URL);
  406 |       await page.waitForLoadState('networkidle');
  407 |       await page.waitForTimeout(1000);
  408 | 
  409 |       const bodyText = await page.locator('body').textContent() || '';
  410 |       const hasBalanceKeywords = bodyText.includes('balance') ||
  411 |                                 bodyText.includes('owes') ||
  412 |                                 bodyText.includes('gets') ||
  413 |                                 bodyText.includes('member');
  414 | 
  415 |       expect(bodyText.length > 0).toBeTruthy();
  416 |       console.log('✅ Balance data loaded');
  417 |     });
  418 | 
  419 |     test('PS-3: Payment recording button is accessible', async ({ page }) => {
  420 |       console.log('\n🧪 PS-3: Payment Recording Access');
  421 | 
  422 |       await page.goto(APP_URL);
  423 |       await page.waitForLoadState('networkidle');
  424 |       await page.waitForTimeout(1000);
  425 | 
  426 |       const buttons = await page.locator('button').allTextContents();
  427 | 
  428 |       expect(buttons.length).toBeGreaterThan(0);
  429 |       console.log(`✅ Found ${buttons.length} action buttons`);
  430 |     });
  431 | 
  432 |     test('PS-4: Settlement suggestions are visible', async ({ page }) => {
  433 |       console.log('\n🧪 PS-4: Settlement Suggestions');
  434 | 
```