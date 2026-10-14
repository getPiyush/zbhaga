# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/user-scenarios.spec.ts >> zBhaga User Scenario Tests >> Scenario: Settlement & Payment Recording >> SC-SETTLE-4: User can record manual payments
- Location: tests/e2e/user-scenarios.spec.ts:316:9

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
  223 |       await navigateTo(page, '/');
  224 | 
  225 |       const bodyText = await page.locator('body').textContent() || '';
  226 | 
  227 |       expect(bodyText.length).toBeGreaterThan(0);
  228 |       console.log('✅ Expense list visible');
  229 |     });
  230 | 
  231 |     test('SC-EXP-2: Expenses show who paid', async ({ page }) => {
  232 |       console.log('\n💰 SC-EXP-2: Expense Payer Info');
  233 | 
  234 |       await navigateTo(page, '/');
  235 | 
  236 |       const text = await page.locator('body').textContent() || '';
  237 | 
  238 |       expect(text.length).toBeGreaterThan(0);
  239 |       console.log('✅ Payment info accessible');
  240 |     });
  241 | 
  242 |     test('SC-EXP-3: Expenses show amounts clearly', async ({ page }) => {
  243 |       console.log('\n💰 SC-EXP-3: Amount Display');
  244 | 
  245 |       await navigateTo(page, '/');
  246 | 
  247 |       const bodyText = await page.locator('body').textContent() || '';
  248 | 
  249 |       expect(bodyText.length).toBeGreaterThan(0);
  250 |       console.log('✅ Amounts displayed');
  251 |     });
  252 | 
  253 |     test('SC-EXP-4: Expenses sorted chronologically', async ({ page }) => {
  254 |       console.log('\n💰 SC-EXP-4: Expense Sorting');
  255 | 
  256 |       await navigateTo(page, '/');
  257 | 
  258 |       const elements = await page.locator('text').all();
  259 | 
  260 |       expect(elements.length).toBeGreaterThan(0);
  261 |       console.log('✅ Expenses organized');
  262 |     });
  263 | 
  264 |     test('SC-EXP-5: User can see expense participants', async ({ page }) => {
  265 |       console.log('\n💰 SC-EXP-5: Participant Tracking');
  266 | 
  267 |       await navigateTo(page, '/');
  268 | 
  269 |       const bodyText = await page.locator('body').textContent() || '';
  270 | 
  271 |       expect(bodyText.length).toBeGreaterThan(0);
  272 |       console.log('✅ Participant info accessible');
  273 |     });
  274 |   });
  275 | 
  276 |   // ===== SCENARIO: SETTLEMENT WORKFLOW =====
  277 | 
  278 |   test.describe('Scenario: Settlement & Payment Recording', () => {
  279 |     test.beforeEach(async ({ page }) => {
  280 |       await quickSignIn(page);
  281 |     });
  282 | 
  283 |     test('SC-SETTLE-1: User can see what they owe', async ({ page }) => {
  284 |       console.log('\n🤝 SC-SETTLE-1: Debt Visibility');
  285 | 
  286 |       await navigateTo(page, '/');
  287 | 
  288 |       const bodyText = await page.locator('body').textContent() || '';
  289 | 
  290 |       expect(bodyText.length).toBeGreaterThan(0);
  291 |       console.log('✅ Debt information accessible');
  292 |     });
  293 | 
  294 |     test('SC-SETTLE-2: User can see who owes them', async ({ page }) => {
  295 |       console.log('\n🤝 SC-SETTLE-2: Credit Visibility');
  296 | 
  297 |       await navigateTo(page, '/');
  298 | 
  299 |       const text = await page.locator('body').textContent() || '';
  300 | 
  301 |       expect(text.length).toBeGreaterThan(0);
  302 |       console.log('✅ Credit information accessible');
  303 |     });
  304 | 
  305 |     test('SC-SETTLE-3: User can see settlement suggestions', async ({ page }) => {
  306 |       console.log('\n🤝 SC-SETTLE-3: Settlement Suggestions');
  307 | 
  308 |       await navigateTo(page, '/');
  309 | 
  310 |       const bodyText = await page.locator('body').textContent() || '';
  311 | 
  312 |       expect(bodyText.length).toBeGreaterThan(0);
  313 |       console.log('✅ Settlement interface accessible');
  314 |     });
  315 | 
  316 |     test('SC-SETTLE-4: User can record manual payments', async ({ page }) => {
  317 |       console.log('\n🤝 SC-SETTLE-4: Manual Payment Recording');
  318 | 
  319 |       await navigateTo(page, '/');
  320 | 
  321 |       const buttons = await page.locator('button').allTextContents();
  322 | 
> 323 |       expect(buttons.length).toBeGreaterThan(0);
      |                              ^ Error: expect(received).toBeGreaterThan(expected)
  324 |       console.log('✅ Payment recording accessible');
  325 |     });
  326 | 
  327 |     test('SC-SETTLE-5: Balances update after payment', async ({ page }) => {
  328 |       console.log('\n🤝 SC-SETTLE-5: Balance Updates');
  329 | 
  330 |       await navigateTo(page, '/');
  331 | 
  332 |       const text1 = await page.locator('body').textContent() || '';
  333 | 
  334 |       await page.reload();
  335 |       await page.waitForLoadState('networkidle');
  336 | 
  337 |       const text2 = await page.locator('body').textContent() || '';
  338 | 
  339 |       expect(text2.length).toBeGreaterThan(0);
  340 |       console.log('✅ Balances refresh properly');
  341 |     });
  342 |   });
  343 | 
  344 |   // ===== SCENARIO: GROUP COLLABORATION =====
  345 | 
  346 |   test.describe('Scenario: Group Collaboration & Sharing', () => {
  347 |     test.beforeEach(async ({ page }) => {
  348 |       await quickSignIn(page);
  349 |     });
  350 | 
  351 |     test('SC-COLLAB-1: User can see group members', async ({ page }) => {
  352 |       console.log('\n👥 SC-COLLAB-1: Member List');
  353 | 
  354 |       await navigateTo(page, '/');
  355 | 
  356 |       const bodyText = await page.locator('body').textContent() || '';
  357 | 
  358 |       expect(bodyText.length).toBeGreaterThan(0);
  359 |       console.log('✅ Members visible');
  360 |     });
  361 | 
  362 |     test('SC-COLLAB-2: User can share group invite code', async ({ page }) => {
  363 |       console.log('\n👥 SC-COLLAB-2: Invite Code Sharing');
  364 | 
  365 |       await navigateTo(page, '/');
  366 | 
  367 |       const bodyText = await page.locator('body').textContent() || '';
  368 | 
  369 |       expect(bodyText.length).toBeGreaterThan(0);
  370 |       console.log('✅ Invite functionality accessible');
  371 |     });
  372 | 
  373 |     test('SC-COLLAB-3: User can see who added expenses', async ({ page }) => {
  374 |       console.log('\n👥 SC-COLLAB-3: Expense Attribution');
  375 | 
  376 |       await navigateTo(page, '/');
  377 | 
  378 |       const text = await page.locator('body').textContent() || '';
  379 | 
  380 |       expect(text.length).toBeGreaterThan(0);
  381 |       console.log('✅ Attribution info accessible');
  382 |     });
  383 | 
  384 |     test('SC-COLLAB-4: User can see payment history', async ({ page }) => {
  385 |       console.log('\n👥 SC-COLLAB-4: Payment History');
  386 | 
  387 |       await navigateTo(page, '/');
  388 | 
  389 |       const bodyText = await page.locator('body').textContent() || '';
  390 | 
  391 |       expect(bodyText.length).toBeGreaterThan(0);
  392 |       console.log('✅ Payment history accessible');
  393 |     });
  394 | 
  395 |     test('SC-COLLAB-5: Real-time updates visible', async ({ page }) => {
  396 |       console.log('\n👥 SC-COLLAB-5: Real-time Updates');
  397 | 
  398 |       await navigateTo(page, '/');
  399 | 
  400 |       await page.waitForTimeout(2000);
  401 | 
  402 |       const text1 = await page.locator('body').textContent() || '';
  403 | 
  404 |       await page.reload();
  405 |       await page.waitForLoadState('networkidle');
  406 | 
  407 |       const text2 = await page.locator('body').textContent() || '';
  408 | 
  409 |       expect(text2.length).toBeGreaterThan(0);
  410 |       console.log('✅ Real-time updates work');
  411 |     });
  412 |   });
  413 | 
  414 |   // ===== SCENARIO: MOBILE USER =====
  415 | 
  416 |   test.describe('Scenario: Mobile User Experience', () => {
  417 |     test.beforeEach(async ({ page }) => {
  418 |       // Set mobile viewport
  419 |       await page.setViewportSize({ width: 375, height: 812 });
  420 |       await quickSignIn(page);
  421 |     });
  422 | 
  423 |     test('SC-MOBILE-1: App layout works on mobile', async ({ page }) => {
```