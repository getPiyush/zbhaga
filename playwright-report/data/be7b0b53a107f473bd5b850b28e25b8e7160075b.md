# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/user-scenarios.spec.ts >> zBhaga User Scenario Tests >> Scenario: Mobile User Experience >> SC-MOBILE-2: Buttons are tap-friendly
- Location: tests/e2e/user-scenarios.spec.ts:434:9

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
  424 |       console.log('\n📱 SC-MOBILE-1: Mobile Layout');
  425 | 
  426 |       await navigateTo(page, '/');
  427 | 
  428 |       const bodyText = await page.locator('body').textContent() || '';
  429 | 
  430 |       expect(bodyText.length).toBeGreaterThan(0);
  431 |       console.log('✅ Mobile layout functional');
  432 |     });
  433 | 
  434 |     test('SC-MOBILE-2: Buttons are tap-friendly', async ({ page }) => {
  435 |       console.log('\n📱 SC-MOBILE-2: Button Size');
  436 | 
  437 |       await navigateTo(page, '/');
  438 | 
  439 |       const buttons = await page.locator('button').all();
  440 | 
> 441 |       expect(buttons.length).toBeGreaterThan(0);
      |                              ^ Error: expect(received).toBeGreaterThan(expected)
  442 | 
  443 |       if (buttons.length > 0) {
  444 |         const box = await buttons[0].boundingBox();
  445 |         expect(box?.height).toBeGreaterThan(40);
  446 |       }
  447 | 
  448 |       console.log('✅ Buttons are accessible');
  449 |     });
  450 | 
  451 |     test('SC-MOBILE-3: Text is readable', async ({ page }) => {
  452 |       console.log('\n📱 SC-MOBILE-3: Text Readability');
  453 | 
  454 |       await navigateTo(page, '/');
  455 | 
  456 |       const bodyText = await page.locator('body').textContent() || '';
  457 | 
  458 |       expect(bodyText.length).toBeGreaterThan(0);
  459 |       console.log('✅ Text is readable on mobile');
  460 |     });
  461 | 
  462 |     test('SC-MOBILE-4: Forms are mobile-friendly', async ({ page }) => {
  463 |       console.log('\n📱 SC-MOBILE-4: Mobile Forms');
  464 | 
  465 |       await navigateTo(page, '/');
  466 | 
  467 |       const inputs = await page.locator('input').all();
  468 | 
  469 |       if (inputs.length > 0) {
  470 |         console.log(`✓ Found ${inputs.length} form inputs`);
  471 |       }
  472 | 
  473 |       console.log('✅ Forms are mobile-friendly');
  474 |     });
  475 | 
  476 |     test('SC-MOBILE-5: No horizontal scroll needed', async ({ page }) => {
  477 |       console.log('\n📱 SC-MOBILE-5: No Overflow');
  478 | 
  479 |       await navigateTo(page, '/');
  480 | 
  481 |       const bodyWidth = await page.evaluate(() => document.documentElement.clientWidth);
  482 |       const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  483 | 
  484 |       expect(scrollWidth).toBeLessThanOrEqual(bodyWidth + 10);
  485 |       console.log('✅ No horizontal overflow');
  486 |     });
  487 |   });
  488 | 
  489 |   // ===== SCENARIO: OFFLINE AWARENESS =====
  490 | 
  491 |   test.describe('Scenario: Offline Handling', () => {
  492 |     test.beforeEach(async ({ page }) => {
  493 |       await quickSignIn(page);
  494 |     });
  495 | 
  496 |     test('SC-OFFLINE-1: App shows graceful error on network failure', async ({ page }) => {
  497 |       console.log('\n🌐 SC-OFFLINE-1: Network Error Handling');
  498 | 
  499 |       await navigateTo(page, '/');
  500 | 
  501 |       // Go offline
  502 |       await page.context().setOffline(true);
  503 | 
  504 |       await page.waitForTimeout(1000);
  505 | 
  506 |       const bodyText = await page.locator('body').textContent() || '';
  507 |       expect(bodyText.length).toBeGreaterThan(0);
  508 | 
  509 |       // Go back online
  510 |       await page.context().setOffline(false);
  511 | 
  512 |       console.log('✅ Offline state handled');
  513 |     });
  514 | 
  515 |     test('SC-OFFLINE-2: Recovery on reconnect', async ({ page }) => {
  516 |       console.log('\n🌐 SC-OFFLINE-2: Reconnection Recovery');
  517 | 
  518 |       await navigateTo(page, '/');
  519 | 
  520 |       const text1 = await page.locator('body').textContent() || '';
  521 | 
  522 |       // Simulate reconnect
  523 |       await page.reload();
  524 |       await page.waitForLoadState('networkidle');
  525 | 
  526 |       const text2 = await page.locator('body').textContent() || '';
  527 | 
  528 |       expect(text2.length).toBeGreaterThan(0);
  529 |       console.log('✅ Recovery on reconnect works');
  530 |     });
  531 | 
  532 |     test('SC-OFFLINE-3: Data persists across offline session', async ({ page }) => {
  533 |       console.log('\n🌐 SC-OFFLINE-3: Data Persistence');
  534 | 
  535 |       await navigateTo(page, '/');
  536 | 
  537 |       const text = await page.locator('body').textContent() || '';
  538 | 
  539 |       expect(text.length).toBeGreaterThan(0);
  540 |       console.log('✅ Data accessible');
  541 |     });
```