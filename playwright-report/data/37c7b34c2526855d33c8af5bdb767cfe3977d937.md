# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/integration-scenarios.spec.ts >> zBhaga Integration & Edge Case Tests >> Browser Feature Compatibility >> COMPAT-1: LocalStorage available
- Location: tests/e2e/integration-scenarios.spec.ts:683:9

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
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
  629 |   // ===== MEMORY & PERFORMANCE TESTS =====
  630 | 
  631 |   test.describe('Memory & Resource Management', () => {
  632 |     test('MEM-1: No memory leaks on repeated navigation', async ({ page }) => {
  633 |       console.log('\n💾 MEM-1: Memory Leak Check');
  634 | 
  635 |       const metrics1 = await page.evaluate(() => ({
  636 |         memory: (performance as any).memory?.usedJSHeapSize || 0,
  637 |       }));
  638 | 
  639 |       for (let i = 0; i < 5; i++) {
  640 |         await page.reload();
  641 |         await page.waitForLoadState('networkidle').catch(() => {});
  642 |       }
  643 | 
  644 |       const metrics2 = await page.evaluate(() => ({
  645 |         memory: (performance as any).memory?.usedJSHeapSize || 0,
  646 |       }));
  647 | 
  648 |       console.log(`✅ Memory usage tracked: ${metrics1.memory} -> ${metrics2.memory}`);
  649 |     });
  650 | 
  651 |     test('MEM-2: Event listeners cleaned up', async ({ page }) => {
  652 |       console.log('\n💾 MEM-2: Event Listener Cleanup');
  653 | 
  654 |       await quickSignIn(page);
  655 | 
  656 |       // Navigate multiple times
  657 |       for (let i = 0; i < 3; i++) {
  658 |         await page.goto(APP_URL);
  659 |         await page.waitForLoadState('networkidle').catch(() => {});
  660 |       }
  661 | 
  662 |       console.log('✅ Navigation completed without errors');
  663 |     });
  664 | 
  665 |     test('MEM-3: DOM node cleanup', async ({ page }) => {
  666 |       console.log('\n💾 MEM-3: DOM Cleanup');
  667 | 
  668 |       for (let i = 0; i < 3; i++) {
  669 |         await page.reload();
  670 |         await page.waitForLoadState('networkidle').catch(() => {});
  671 |       }
  672 | 
  673 |       const nodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
  674 | 
  675 |       expect(nodeCount).toBeGreaterThan(0);
  676 |       console.log(`✅ DOM has ${nodeCount} nodes`);
  677 |     });
  678 |   });
  679 | 
  680 |   // ===== BROWSER COMPATIBILITY TESTS =====
  681 | 
  682 |   test.describe('Browser Feature Compatibility', () => {
  683 |     test('COMPAT-1: LocalStorage available', async ({ page }) => {
  684 |       console.log('\n🌐 COMPAT-1: LocalStorage');
  685 | 
  686 |       const available = await page.evaluate(() => {
  687 |         try {
  688 |           return typeof localStorage !== 'undefined';
  689 |         } catch {
  690 |           return false;
  691 |         }
  692 |       });
  693 | 
> 694 |       expect(available).toBeTruthy();
      |                         ^ Error: expect(received).toBeTruthy()
  695 |       console.log('✅ LocalStorage available');
  696 |     });
  697 | 
  698 |     test('COMPAT-2: SessionStorage available', async ({ page }) => {
  699 |       console.log('\n🌐 COMPAT-2: SessionStorage');
  700 | 
  701 |       const available = await page.evaluate(() => {
  702 |         try {
  703 |           return typeof sessionStorage !== 'undefined';
  704 |         } catch {
  705 |           return false;
  706 |         }
  707 |       });
  708 | 
  709 |       expect(available).toBeTruthy();
  710 |       console.log('✅ SessionStorage available');
  711 |     });
  712 | 
  713 |     test('COMPAT-3: Promise support', async ({ page }) => {
  714 |       console.log('\n🌐 COMPAT-3: Promise Support');
  715 | 
  716 |       const available = await page.evaluate(() => {
  717 |         return typeof Promise !== 'undefined';
  718 |       });
  719 | 
  720 |       expect(available).toBeTruthy();
  721 |       console.log('✅ Promises supported');
  722 |     });
  723 | 
  724 |     test('COMPAT-4: Fetch API available', async ({ page }) => {
  725 |       console.log('\n🌐 COMPAT-4: Fetch API');
  726 | 
  727 |       const available = await page.evaluate(() => {
  728 |         return typeof fetch !== 'undefined';
  729 |       });
  730 | 
  731 |       expect(available).toBeTruthy();
  732 |       console.log('✅ Fetch API available');
  733 |     });
  734 | 
  735 |     test('COMPAT-5: CSS Grid support', async ({ page }) => {
  736 |       console.log('\n🌐 COMPAT-5: CSS Features');
  737 | 
  738 |       const supported = await page.evaluate(() => {
  739 |         return CSS.supports('display', 'grid');
  740 |       });
  741 | 
  742 |       expect(supported).toBeTruthy();
  743 |       console.log('✅ CSS Grid supported');
  744 |     });
  745 |   });
  746 | });
  747 | 
```