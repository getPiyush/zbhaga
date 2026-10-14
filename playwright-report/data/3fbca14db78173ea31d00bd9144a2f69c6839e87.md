# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/integration-scenarios.spec.ts >> zBhaga Integration & Edge Case Tests >> Concurrent & Rapid Interaction >> CI-2: Parallel modal interactions
- Location: tests/e2e/integration-scenarios.spec.ts:433:9

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
  342 |       });
  343 | 
  344 |       await client.detach();
  345 | 
  346 |       console.log('✅ Network condition handling tested');
  347 |     });
  348 | 
  349 |     test('API-3: CORS error handling', async ({ page }) => {
  350 |       console.log('\n🔌 API-3: CORS Handling');
  351 | 
  352 |       await quickSignIn(page);
  353 | 
  354 |       const corsErrors: string[] = [];
  355 |       page.on('console', msg => {
  356 |         if (msg.text().includes('CORS') || msg.text().includes('cors')) {
  357 |           corsErrors.push(msg.text());
  358 |         }
  359 |       });
  360 | 
  361 |       await page.goto(APP_URL);
  362 |       await page.waitForLoadState('networkidle');
  363 |       await page.waitForTimeout(2000);
  364 | 
  365 |       console.log(`✅ CORS errors detected: ${corsErrors.length}`);
  366 |     });
  367 | 
  368 |     test('API-4: Duplicate request prevention', async ({ page }) => {
  369 |       console.log('\n🔌 API-4: Duplicate Request Prevention');
  370 | 
  371 |       const requestUrls: string[] = [];
  372 |       page.on('request', request => {
  373 |         if (request.url().includes(API_URL)) {
  374 |           requestUrls.push(request.url());
  375 |         }
  376 |       });
  377 | 
  378 |       await quickSignIn(page);
  379 | 
  380 |       // Check for duplicate requests
  381 |       const uniqueUrls = new Set(requestUrls);
  382 |       const duplicates = requestUrls.length - uniqueUrls.size;
  383 | 
  384 |       console.log(`✅ Total requests: ${requestUrls.length}, Duplicates: ${duplicates}`);
  385 |     });
  386 | 
  387 |     test('API-5: Response caching behavior', async ({ page }) => {
  388 |       console.log('\n🔌 API-5: Response Caching');
  389 | 
  390 |       const responseTimes: number[] = [];
  391 |       page.on('response', response => {
  392 |         if (response.url().includes(API_URL)) {
  393 |           responseTimes.push(response.ok ? 1 : 0);
  394 |         }
  395 |       });
  396 | 
  397 |       await quickSignIn(page);
  398 | 
  399 |       // Make same request
  400 |       await page.reload();
  401 |       await page.waitForLoadState('networkidle');
  402 | 
  403 |       console.log(`✅ Cached ${responseTimes.filter(t => t === 1).length} successful responses`);
  404 |     });
  405 |   });
  406 | 
  407 |   // ===== CONCURRENT INTERACTION TESTS =====
  408 | 
  409 |   test.describe('Concurrent & Rapid Interaction', () => {
  410 |     test('CI-1: Rapid button clicks handled', async ({ page }) => {
  411 |       console.log('\n⚡ CI-1: Rapid Clicks');
  412 | 
  413 |       await quickSignIn(page);
  414 |       await page.goto(APP_URL);
  415 |       await page.waitForLoadState('networkidle');
  416 | 
  417 |       const buttons = await page.locator('button').all();
  418 | 
  419 |       if (buttons.length > 0) {
  420 |         // Click button rapidly
  421 |         for (let i = 0; i < 3; i++) {
  422 |           await buttons[0].click().catch(() => {
  423 |             console.log(`✓ Click ${i + 1} handled`);
  424 |           });
  425 |         }
  426 |       }
  427 | 
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
> 442 |       expect(buttons.length).toBeGreaterThan(0);
      |                              ^ Error: expect(received).toBeGreaterThan(expected)
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
  528 |       expect(textElements.length).toBeGreaterThan(0);
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
```