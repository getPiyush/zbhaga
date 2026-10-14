# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/integration-scenarios.spec.ts >> zBhaga Integration & Edge Case Tests >> API Integration & Error Responses >> API-2: Network timeout handling
- Location: tests/e2e/integration-scenarios.spec.ts:320:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8081/", waiting until "load"

```

# Test source

```ts
  232 |       await quickSignIn(page);
  233 | 
  234 |       const buttons = await page.locator('button').all();
  235 | 
  236 |       if (buttons.length > 0) {
  237 |         await buttons[0].click();
  238 |         await page.waitForTimeout(500);
  239 |         console.log('✓ Tab clicked');
  240 | 
  241 |         const newText = await page.locator('body').textContent() || '';
  242 |         expect(newText.length).toBeGreaterThan(0);
  243 |       }
  244 | 
  245 |       console.log('✅ Tab state preserved');
  246 |     });
  247 | 
  248 |     test('SM-4: Modal state closes properly', async ({ page }) => {
  249 |       console.log('\n🔄 SM-4: Modal State Management');
  250 | 
  251 |       await quickSignIn(page);
  252 |       await page.goto(APP_URL);
  253 |       await page.waitForLoadState('networkidle');
  254 | 
  255 |       // Find and interact with modal triggers
  256 |       const buttons = await page.locator('button').allTextContents();
  257 |       console.log(`✓ Found ${buttons.length} buttons`);
  258 | 
  259 |       expect(buttons.length).toBeGreaterThan(0);
  260 |       console.log('✅ Modal controls accessible');
  261 |     });
  262 | 
  263 |     test('SM-5: Form state resets after submission', async ({ page }) => {
  264 |       console.log('\n🔄 SM-5: Form State Reset');
  265 | 
  266 |       await quickSignIn(page);
  267 |       await page.goto(APP_URL);
  268 |       await page.waitForLoadState('networkidle');
  269 | 
  270 |       const inputs = await page.locator('input').all();
  271 | 
  272 |       if (inputs.length > 0) {
  273 |         console.log(`✓ Found ${inputs.length} form fields`);
  274 |       }
  275 | 
  276 |       console.log('✅ Form state management working');
  277 |     });
  278 | 
  279 |     test('SM-6: Scroll position maintained', async ({ page }) => {
  280 |       console.log('\n🔄 SM-6: Scroll Position');
  281 | 
  282 |       await quickSignIn(page);
  283 |       await page.goto(APP_URL);
  284 |       await page.waitForLoadState('networkidle');
  285 | 
  286 |       await page.evaluate(() => window.scrollBy(0, 500));
  287 |       const scrollPos1 = await page.evaluate(() => window.scrollY);
  288 | 
  289 |       await page.reload();
  290 |       await page.waitForLoadState('networkidle');
  291 | 
  292 |       const scrollPos2 = await page.evaluate(() => window.scrollY);
  293 | 
  294 |       console.log(`✅ Scroll position: ${scrollPos2}`);
  295 |     });
  296 |   });
  297 | 
  298 |   // ===== API INTEGRATION TESTS =====
  299 | 
  300 |   test.describe('API Integration & Error Responses', () => {
  301 |     test('API-1: Invalid session token handling', async ({ page }) => {
  302 |       console.log('\n🔌 API-1: Invalid Token Handling');
  303 | 
  304 |       await page.goto(APP_URL);
  305 |       await page.waitForLoadState('networkidle');
  306 | 
  307 |       // Intercept API responses
  308 |       const apiErrors: number[] = [];
  309 |       page.on('response', response => {
  310 |         if (response.url().includes(API_URL) && response.status() >= 400) {
  311 |           apiErrors.push(response.status());
  312 |         }
  313 |       });
  314 | 
  315 |       await page.waitForTimeout(2000);
  316 | 
  317 |       console.log(`✅ Captured ${apiErrors.length} API errors`);
  318 |     });
  319 | 
  320 |     test('API-2: Network timeout handling', async ({ page }) => {
  321 |       console.log('\n🔌 API-2: Network Timeout Handling');
  322 | 
  323 |       // Slow down network
  324 |       const client = await page.context().newCDPSession(page);
  325 |       await client.send('Network.emulateNetworkConditions', {
  326 |         offline: false,
  327 |         downloadThroughput: 1000,
  328 |         uploadThroughput: 1000,
  329 |         latency: 5000,
  330 |       });
  331 | 
> 332 |       await page.goto(APP_URL);
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  333 |       await page.waitForLoadState('networkidle').catch(() => {
  334 |         console.log('✓ Timeout occurred as expected');
  335 |       });
  336 | 
  337 |       await client.send('Network.emulateNetworkConditions', {
  338 |         offline: false,
  339 |         downloadThroughput: -1,
  340 |         uploadThroughput: -1,
  341 |         latency: 0,
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
```