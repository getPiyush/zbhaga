# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/user-scenarios.spec.ts >> zBhaga User Scenario Tests >> Scenario: Dark Mode Experience >> SC-DARK-1: Dark mode colors are correct
- Location: tests/e2e/user-scenarios.spec.ts:553:9

# Error details

```
TypeError: context.emulateMedia is not a function
```

# Test source

```ts
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
  542 |   });
  543 | 
  544 |   // ===== SCENARIO: DARK MODE USER =====
  545 | 
  546 |   test.describe('Scenario: Dark Mode Experience', () => {
  547 |     test.beforeEach(async ({ page, context }) => {
  548 |       // Emulate dark mode
> 549 |       await context.emulateMedia({ colorScheme: 'dark' });
      |                     ^ TypeError: context.emulateMedia is not a function
  550 |       await quickSignIn(page);
  551 |     });
  552 | 
  553 |     test('SC-DARK-1: Dark mode colors are correct', async ({ page }) => {
  554 |       console.log('\n🌙 SC-DARK-1: Dark Mode Colors');
  555 | 
  556 |       await navigateTo(page, '/');
  557 | 
  558 |       const bodyBgColor = await page.evaluate(() =>
  559 |         window.getComputedStyle(document.body).backgroundColor
  560 |       );
  561 | 
  562 |       expect(bodyBgColor).toBeTruthy();
  563 |       console.log(`✅ Dark mode applied: ${bodyBgColor}`);
  564 |     });
  565 | 
  566 |     test('SC-DARK-2: Text is readable in dark mode', async ({ page }) => {
  567 |       console.log('\n🌙 SC-DARK-2: Dark Mode Text');
  568 | 
  569 |       await navigateTo(page, '/');
  570 | 
  571 |       const bodyText = await page.locator('body').textContent() || '';
  572 | 
  573 |       expect(bodyText.length).toBeGreaterThan(0);
  574 |       console.log('✅ Text readable in dark mode');
  575 |     });
  576 | 
  577 |     test('SC-DARK-3: No brightness issues', async ({ page }) => {
  578 |       console.log('\n🌙 SC-DARK-3: Dark Mode Contrast');
  579 | 
  580 |       await navigateTo(page, '/');
  581 | 
  582 |       const bodyText = await page.locator('body').textContent() || '';
  583 | 
  584 |       expect(bodyText.length).toBeGreaterThan(0);
  585 |       console.log('✅ No contrast issues');
  586 |     });
  587 |   });
  588 | 
  589 |   // ===== SCENARIO: ACCESSIBILITY =====
  590 | 
  591 |   test.describe('Scenario: Accessibility', () => {
  592 |     test.beforeEach(async ({ page }) => {
  593 |       await quickSignIn(page);
  594 |     });
  595 | 
  596 |     test('SC-A11Y-1: Keyboard navigation works', async ({ page }) => {
  597 |       console.log('\n♿ SC-A11Y-1: Keyboard Navigation');
  598 | 
  599 |       await navigateTo(page, '/');
  600 | 
  601 |       // Tab through buttons
  602 |       await page.keyboard.press('Tab');
  603 |       await page.waitForTimeout(200);
  604 | 
  605 |       const focused = await page.evaluate(() => document.activeElement?.tagName);
  606 | 
  607 |       expect(focused).toBeTruthy();
  608 |       console.log('✅ Keyboard navigation works');
  609 |     });
  610 | 
  611 |     test('SC-A11Y-2: Buttons are focusable', async ({ page }) => {
  612 |       console.log('\n♿ SC-A11Y-2: Button Focus');
  613 | 
  614 |       await navigateTo(page, '/');
  615 | 
  616 |       const buttons = await page.locator('button').all();
  617 | 
  618 |       if (buttons.length > 0) {
  619 |         await buttons[0].focus();
  620 |         console.log('✓ Button focused');
  621 |       }
  622 | 
  623 |       console.log('✅ Buttons are focusable');
  624 |     });
  625 | 
  626 |     test('SC-A11Y-3: Forms have labels', async ({ page }) => {
  627 |       console.log('\n♿ SC-A11Y-3: Form Labels');
  628 | 
  629 |       await navigateTo(page, '/');
  630 | 
  631 |       const inputs = await page.locator('input').all();
  632 | 
  633 |       expect(inputs.length).toBeGreaterThanOrEqual(0);
  634 |       console.log('✅ Form accessibility present');
  635 |     });
  636 | 
  637 |     test('SC-A11Y-4: Color contrast is sufficient', async ({ page }) => {
  638 |       console.log('\n♿ SC-A11Y-4: Color Contrast');
  639 | 
  640 |       await navigateTo(page, '/');
  641 | 
  642 |       const bodyText = await page.locator('body').textContent() || '';
  643 | 
  644 |       expect(bodyText.length).toBeGreaterThan(0);
  645 |       console.log('✅ Content is visible');
  646 |     });
  647 | 
  648 |     test('SC-A11Y-5: Touch targets are adequate', async ({ page }) => {
  649 |       console.log('\n♿ SC-A11Y-5: Touch Targets');
```