# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/integration-scenarios.spec.ts >> zBhaga Integration & Edge Case Tests >> Boundary & Limit Testing >> LIMIT-4: Many members in group
- Location: tests/e2e/integration-scenarios.spec.ts:520:9

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
  428 |       const finalText = await page.locator('body').textContent() || '';
  429 |       expect(finalText.length).toBeGreaterThan(0);
  430 |       console.log('✅ Rapid interactions handled');
  431 |     });
  432 | 
  433 |     test('CI-2: Parallel modal interactions', async ({ page }) => {
  434 |       console.log('\n⚡ CI-2: Parallel Modals');
  435 | 
  436 |       await quickSignIn(page);
  437 |       await page.goto(APP_URL);
  438 |       await page.waitForLoadState('networkidle');
  439 | 
  440 |       const buttons = await page.locator('button').allTextContents();
  441 | 
  442 |       expect(buttons.length).toBeGreaterThan(0);
  443 |       console.log('✅ Multiple interactions possible');
  444 |     });
  445 | 
  446 |     test('CI-3: Back-to-back navigation', async ({ page }) => {
  447 |       console.log('\n⚡ CI-3: Back-to-Back Navigation');
  448 | 
  449 |       await quickSignIn(page);
  450 | 
  451 |       // Rapid navigation
  452 |       for (let i = 0; i < 3; i++) {
  453 |         await page.goto(APP_URL);
  454 |         await page.waitForLoadState('networkidle').catch(() => {});
  455 |       }
  456 | 
  457 |       const finalText = await page.locator('body').textContent() || '';
  458 |       expect(finalText.length).toBeGreaterThan(0);
  459 |       console.log('✅ Rapid navigation handled');
  460 |     });
  461 | 
  462 |     test('CI-4: Rapid form submissions', async ({ page }) => {
  463 |       console.log('\n⚡ CI-4: Rapid Form Submissions');
  464 | 
  465 |       await page.goto(APP_URL);
  466 |       await page.waitForLoadState('networkidle');
  467 | 
  468 |       const submitButtons = await page.locator('button:has-text("Sign In"), button:has-text("Create"), button:has-text("Join")').all();
  469 | 
  470 |       if (submitButtons.length > 0) {
  471 |         console.log(`✓ Found ${submitButtons.length} submit buttons`);
  472 |       }
  473 | 
  474 |       console.log('✅ Form submission handling ready');
  475 |     });
  476 |   });
  477 | 
  478 |   // ===== BOUNDARY & LIMIT TESTS =====
  479 | 
  480 |   test.describe('Boundary & Limit Testing', () => {
  481 |     test.beforeEach(async ({ page }) => {
  482 |       await quickSignIn(page);
  483 |     });
  484 | 
  485 |     test('LIMIT-1: Large group handling', async ({ page }) => {
  486 |       console.log('\n📊 LIMIT-1: Large Group');
  487 | 
  488 |       await page.goto(APP_URL);
  489 |       await page.waitForLoadState('networkidle');
  490 | 
  491 |       const elements = await page.locator('div').all();
  492 | 
  493 |       expect(elements.length).toBeGreaterThan(0);
  494 |       console.log(`✅ Handled ${elements.length} DOM elements`);
  495 |     });
  496 | 
  497 |     test('LIMIT-2: Many expenses in list', async ({ page }) => {
  498 |       console.log('\n📊 LIMIT-2: Many Expenses');
  499 | 
  500 |       await page.goto(APP_URL);
  501 |       await page.waitForLoadState('networkidle');
  502 | 
  503 |       const items = await page.locator('[style*="border"], div').all();
  504 | 
  505 |       console.log(`✅ Loaded ${items.length} list items`);
  506 |     });
  507 | 
  508 |     test('LIMIT-3: Large currency amounts', async ({ page }) => {
  509 |       console.log('\n📊 LIMIT-3: Large Amounts');
  510 | 
  511 |       await page.goto(APP_URL);
  512 |       await page.waitForLoadState('networkidle');
  513 | 
  514 |       const bodyText = await page.locator('body').textContent() || '';
  515 |       const hasLargeNumbers = bodyText.includes('000') || bodyText.includes('999');
  516 | 
  517 |       console.log('✅ Large amount display tested');
  518 |     });
  519 | 
  520 |     test('LIMIT-4: Many members in group', async ({ page }) => {
  521 |       console.log('\n📊 LIMIT-4: Many Members');
  522 | 
  523 |       await page.goto(APP_URL);
  524 |       await page.waitForLoadState('networkidle');
  525 | 
  526 |       const textElements = await page.locator('text').all();
  527 | 
> 528 |       expect(textElements.length).toBeGreaterThan(0);
      |                                   ^ Error: expect(received).toBeGreaterThan(expected)
  529 |       console.log(`✅ Rendered ${textElements.length} text elements`);
  530 |     });
  531 | 
  532 |     test('LIMIT-5: Deep navigation stack', async ({ page }) => {
  533 |       console.log('\n📊 LIMIT-5: Deep Navigation');
  534 | 
  535 |       for (let i = 0; i < 5; i++) {
  536 |         await page.goto(APP_URL);
  537 |         await page.waitForLoadState('networkidle').catch(() => {});
  538 |       }
  539 | 
  540 |       const finalText = await page.locator('body').textContent() || '';
  541 |       expect(finalText.length).toBeGreaterThan(0);
  542 |       console.log('✅ Deep navigation handled');
  543 |     });
  544 |   });
  545 | 
  546 |   // ===== SECURITY TESTS =====
  547 | 
  548 |   test.describe('Security & XSS Prevention', () => {
  549 |     test('SEC-1: XSS in input field rejected', async ({ page }) => {
  550 |       console.log('\n🔒 SEC-1: XSS Input Prevention');
  551 | 
  552 |       await page.goto(APP_URL);
  553 |       await page.waitForLoadState('networkidle');
  554 | 
  555 |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  556 |       if (signInButtons.length > 0) {
  557 |         await signInButtons[0].click();
  558 |         await page.waitForTimeout(500);
  559 | 
  560 |         const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
  561 |         if (emailInput) {
  562 |           await emailInput.fill('<script>alert("xss")</script>');
  563 | 
  564 |           const value = await emailInput.inputValue();
  565 |           expect(value).not.toContain('<script>');
  566 |           console.log('✅ XSS input prevented');
  567 |         }
  568 |       }
  569 |     });
  570 | 
  571 |     test('SEC-2: SQL injection attempt prevention', async ({ page }) => {
  572 |       console.log('\n🔒 SEC-2: SQL Injection Prevention');
  573 | 
  574 |       await page.goto(APP_URL);
  575 |       await page.waitForLoadState('networkidle');
  576 | 
  577 |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  578 |       if (signInButtons.length > 0) {
  579 |         await signInButtons[0].click();
  580 |         await page.waitForTimeout(500);
  581 | 
  582 |         const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
  583 |         if (emailInput) {
  584 |           await emailInput.fill("' OR '1'='1");
  585 |           console.log('✅ SQL injection attempt handled');
  586 |         }
  587 |       }
  588 |     });
  589 | 
  590 |     test('SEC-3: No sensitive data in logs', async ({ page }) => {
  591 |       console.log('\n🔒 SEC-3: Sensitive Data Logging');
  592 | 
  593 |       const consoleLogs: string[] = [];
  594 |       page.on('console', msg => {
  595 |         consoleLogs.push(msg.text());
  596 |       });
  597 | 
  598 |       await quickSignIn(page);
  599 | 
  600 |       // Check for exposed credentials
  601 |       const sensitiveData = consoleLogs.filter(log =>
  602 |         log.includes(DEMO_PASSWORD) ||
  603 |         log.includes('password') && log.toLowerCase().includes('demo')
  604 |       );
  605 | 
  606 |       expect(sensitiveData.length).toBe(0);
  607 |       console.log('✅ No sensitive data logged');
  608 |     });
  609 | 
  610 |     test('SEC-4: HTTPS recommended', async ({ page }) => {
  611 |       console.log('\n🔒 SEC-4: HTTPS Check');
  612 | 
  613 |       const protocol = new URL(page.url()).protocol;
  614 | 
  615 |       // In dev it's http, production should be https
  616 |       console.log(`✅ Protocol check: ${protocol}`);
  617 |     });
  618 | 
  619 |     test('SEC-5: Token not exposed in URLs', async ({ page }) => {
  620 |       console.log('\n🔒 SEC-5: Token Exposure Prevention');
  621 | 
  622 |       const initialUrl = page.url();
  623 | 
  624 |       expect(initialUrl).not.toMatch(/token|auth|password/i);
  625 |       console.log('✅ No sensitive data in URL');
  626 |     });
  627 |   });
  628 | 
```