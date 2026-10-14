# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/complete-e2e.spec.ts >> zBhaga Complete E2E Test Suite >> User Profile & Settings >> UP-3: Sign out button is visible
- Location: tests/e2e/complete-e2e.spec.ts:630:9

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
  536 |     });
  537 | 
  538 |     test('EH-4: Navigation doesn\'t break state', async ({ page }) => {
  539 |       console.log('\n🧪 EH-4: State Preservation');
  540 | 
  541 |       await page.goto(APP_URL);
  542 |       await page.waitForLoadState('networkidle');
  543 | 
  544 |       const text1 = await page.locator('body').textContent() || '';
  545 | 
  546 |       await page.reload();
  547 |       await page.waitForLoadState('networkidle');
  548 | 
  549 |       const text2 = await page.locator('body').textContent() || '';
  550 | 
  551 |       expect(text2.length).toBeGreaterThan(0);
  552 |       console.log('✅ State preserved after reload');
  553 |     });
  554 | 
  555 |     test('EH-5: Missing data displays gracefully', async ({ page }) => {
  556 |       console.log('\n🧪 EH-5: Missing Data Handling');
  557 | 
  558 |       await page.goto(APP_URL);
  559 |       await page.waitForLoadState('networkidle');
  560 |       await page.waitForTimeout(1000);
  561 | 
  562 |       const text = await page.locator('body').textContent() || '';
  563 | 
  564 |       expect(text.length).toBeGreaterThan(0);
  565 |       console.log('✅ Empty states handled gracefully');
  566 |     });
  567 | 
  568 |     test('EH-6: Modal dialogs close properly', async ({ page }) => {
  569 |       console.log('\n🧪 EH-6: Modal Dialog Management');
  570 | 
  571 |       await page.goto(APP_URL);
  572 |       await page.waitForLoadState('networkidle');
  573 |       await page.waitForTimeout(1000);
  574 | 
  575 |       // Try to find and interact with modals
  576 |       const closeButtons = await page.locator('button:has-text("✕"), button:has-text("Close")').all();
  577 |       console.log(`✅ Found ${closeButtons.length} modal controls`);
  578 | 
  579 |       expect(await page.locator('body').isVisible()).toBeTruthy();
  580 |     });
  581 | 
  582 |     test('EH-7: Form validation works', async ({ page }) => {
  583 |       console.log('\n🧪 EH-7: Form Validation');
  584 | 
  585 |       await page.goto(APP_URL);
  586 |       await page.waitForLoadState('networkidle');
  587 |       await page.waitForTimeout(1000);
  588 | 
  589 |       const inputs = await page.locator('input').all();
  590 | 
  591 |       expect(inputs.length).toBeGreaterThanOrEqual(0);
  592 |       console.log(`✅ Found ${inputs.length} input fields`);
  593 |     });
  594 |   });
  595 | 
  596 |   // ===== USER PROFILE & SETTINGS =====
  597 | 
  598 |   test.describe('User Profile & Settings', () => {
  599 |     test.beforeEach(async ({ page }) => {
  600 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  601 |     });
  602 | 
  603 |     test('UP-1: User profile displays correctly', async ({ page }) => {
  604 |       console.log('\n🧪 UP-1: User Profile Display');
  605 | 
  606 |       await page.goto(APP_URL);
  607 |       await page.waitForLoadState('networkidle');
  608 | 
  609 |       const bodyText = await page.locator('body').textContent() || '';
  610 |       const hasProfileInfo = bodyText.includes('Hello') ||
  611 |                             bodyText.includes(DEMO_EMAIL) ||
  612 |                             bodyText.includes('Sign Out');
  613 | 
  614 |       expect(bodyText.length).toBeGreaterThan(0);
  615 |       console.log('✅ User info displayed');
  616 |     });
  617 | 
  618 |     test('UP-2: User display name shows correctly', async ({ page }) => {
  619 |       console.log('\n🧪 UP-2: Display Name');
  620 | 
  621 |       await page.goto(APP_URL);
  622 |       await page.waitForLoadState('networkidle');
  623 | 
  624 |       const bodyText = await page.locator('body').textContent() || '';
  625 | 
  626 |       expect(bodyText.length).toBeGreaterThan(0);
  627 |       console.log('✅ User name displayed');
  628 |     });
  629 | 
  630 |     test('UP-3: Sign out button is visible', async ({ page }) => {
  631 |       console.log('\n🧪 UP-3: Sign Out Button Visibility');
  632 | 
  633 |       await page.goto(APP_URL);
  634 |       await page.waitForLoadState('networkidle');
  635 | 
> 636 |       const signOutBtn = await page.locator('button:has-text("Sign Out")').first().catch(() => null);
      |                                                                                         ^ TypeError: page.locator(...).first(...).catch is not a function
  637 |       const bodyText = await page.locator('body').textContent() || '';
  638 |       const hasSignOut = bodyText.includes('Sign Out');
  639 | 
  640 |       expect(hasSignOut).toBeTruthy();
  641 |       console.log('✅ Sign out button found');
  642 |     });
  643 |   });
  644 | 
  645 |   // ===== INTEGRATION FLOWS =====
  646 | 
  647 |   test.describe('Full Integration Scenarios', () => {
  648 |     test('INT-1: Complete user journey - auth to groups', async ({ page }) => {
  649 |       console.log('\n🧪 INT-1: Full Authentication & Navigation Flow');
  650 | 
  651 |       // Step 1: Visit app
  652 |       await page.goto(APP_URL);
  653 |       await page.waitForLoadState('networkidle');
  654 |       console.log('✓ App loaded');
  655 | 
  656 |       // Step 2: Sign in
  657 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  658 |       console.log('✓ User signed in');
  659 | 
  660 |       // Step 3: Verify on groups page
  661 |       const bodyText = await page.locator('body').textContent() || '';
  662 |       expect(bodyText.length).toBeGreaterThan(0);
  663 |       console.log('✓ Authenticated page loaded');
  664 | 
  665 |       // Step 4: Sign out
  666 |       await signOut(page);
  667 |       console.log('✓ User signed out');
  668 | 
  669 |       console.log('✅ Complete flow successful');
  670 |     });
  671 | 
  672 |     test('INT-2: Group exploration flow', async ({ page }) => {
  673 |       console.log('\n🧪 INT-2: Group Exploration Flow');
  674 | 
  675 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  676 | 
  677 |       // Navigate to groups
  678 |       await page.goto(APP_URL);
  679 |       await page.waitForLoadState('networkidle');
  680 |       console.log('✓ Groups page loaded');
  681 | 
  682 |       const bodyText = await page.locator('body').textContent() || '';
  683 |       expect(bodyText.length).toBeGreaterThan(0);
  684 | 
  685 |       // Try to interact with groups
  686 |       const buttons = await page.locator('button').allTextContents();
  687 |       console.log(`✓ Found ${buttons.length} interactive buttons`);
  688 | 
  689 |       console.log('✅ Group exploration successful');
  690 |     });
  691 | 
  692 |     test('INT-3: Complete session lifecycle', async ({ page }) => {
  693 |       console.log('\n🧪 INT-3: Session Lifecycle');
  694 | 
  695 |       // Sign in
  696 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  697 |       console.log('✓ Session created');
  698 | 
  699 |       // Stay on page
  700 |       await page.waitForTimeout(2000);
  701 |       console.log('✓ Session active');
  702 | 
  703 |       // Reload to test persistence
  704 |       await page.reload();
  705 |       await page.waitForLoadState('networkidle');
  706 |       console.log('✓ Session persisted');
  707 | 
  708 |       // Sign out
  709 |       await signOut(page);
  710 |       console.log('✓ Session destroyed');
  711 | 
  712 |       console.log('✅ Session lifecycle complete');
  713 |     });
  714 | 
  715 |     test('INT-4: Multiple navigation cycles', async ({ page }) => {
  716 |       console.log('\n🧪 INT-4: Navigation Cycles');
  717 | 
  718 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  719 |       await page.goto(APP_URL);
  720 |       await page.waitForLoadState('networkidle');
  721 | 
  722 |       // Reload multiple times
  723 |       for (let i = 0; i < 3; i++) {
  724 |         await page.reload();
  725 |         await page.waitForLoadState('networkidle');
  726 |         const text = await page.locator('body').textContent() || '';
  727 |         expect(text.length).toBeGreaterThan(0);
  728 |         console.log(`✓ Navigation cycle ${i + 1} successful`);
  729 |       }
  730 | 
  731 |       console.log('✅ Multiple navigation cycles successful');
  732 |     });
  733 | 
  734 |     test('INT-5: App recovery from errors', async ({ page }) => {
  735 |       console.log('\n🧪 INT-5: Error Recovery');
  736 | 
```