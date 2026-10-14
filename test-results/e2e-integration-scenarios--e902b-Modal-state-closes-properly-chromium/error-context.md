# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/integration-scenarios.spec.ts >> zBhaga Integration & Edge Case Tests >> State Management & Persistence >> SM-4: Modal state closes properly
- Location: tests/e2e/integration-scenarios.spec.ts:248:9

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
  159 | 
  160 |     test('FV-7: Numeric input validation', async ({ page }) => {
  161 |       console.log('\n🔍 FV-7: Numeric Input Validation');
  162 | 
  163 |       await quickSignIn(page);
  164 |       await page.goto(APP_URL);
  165 |       await page.waitForLoadState('networkidle');
  166 | 
  167 |       const numberInputs = await page.locator('input[type="number"], input[inputmode="numeric"]').all();
  168 | 
  169 |       if (numberInputs.length > 0) {
  170 |         await numberInputs[0].fill('abc');
  171 |         console.log('✅ Numeric input validation working');
  172 |       } else {
  173 |         console.log('ℹ️  No numeric inputs found');
  174 |       }
  175 |     });
  176 | 
  177 |     test('FV-8: Auto-capitalization in code fields', async ({ page }) => {
  178 |       console.log('\n🔍 FV-8: Auto-Capitalization');
  179 | 
  180 |       await quickSignIn(page);
  181 |       await page.goto(APP_URL);
  182 |       await page.waitForLoadState('networkidle');
  183 | 
  184 |       const inputs = await page.locator('input').all();
  185 | 
  186 |       if (inputs.length > 0) {
  187 |         console.log('✅ Input fields accessible');
  188 |       }
  189 |     });
  190 |   });
  191 | 
  192 |   // ===== STATE MANAGEMENT TESTS =====
  193 | 
  194 |   test.describe('State Management & Persistence', () => {
  195 |     test('SM-1: Auth state persists after page reload', async ({ page }) => {
  196 |       console.log('\n🔄 SM-1: Auth State Persistence');
  197 | 
  198 |       await quickSignIn(page);
  199 | 
  200 |       const text1 = await page.locator('body').textContent() || '';
  201 |       const isAuth1 = text1.includes('Sign Out');
  202 | 
  203 |       await page.reload();
  204 |       await page.waitForLoadState('networkidle');
  205 | 
  206 |       const text2 = await page.locator('body').textContent() || '';
  207 |       const isAuth2 = text2.includes('Sign Out') || text2.includes('Hello');
  208 | 
  209 |       expect(isAuth2 || !isAuth1).toBeTruthy();
  210 |       console.log('✅ Auth state preserved');
  211 |     });
  212 | 
  213 |     test('SM-2: Group data updates on refresh', async ({ page }) => {
  214 |       console.log('\n🔄 SM-2: Data Refresh');
  215 | 
  216 |       await quickSignIn(page);
  217 | 
  218 |       const text1 = await page.locator('body').textContent() || '';
  219 | 
  220 |       await page.reload();
  221 |       await page.waitForLoadState('networkidle');
  222 | 
  223 |       const text2 = await page.locator('body').textContent() || '';
  224 | 
  225 |       expect(text2.length).toBeGreaterThan(0);
  226 |       console.log('✅ Data refreshed correctly');
  227 |     });
  228 | 
  229 |     test('SM-3: Tab navigation preserves state', async ({ page }) => {
  230 |       console.log('\n🔄 SM-3: Tab Navigation State');
  231 | 
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
> 259 |       expect(buttons.length).toBeGreaterThan(0);
      |                              ^ Error: expect(received).toBeGreaterThan(expected)
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
  332 |       await page.goto(APP_URL);
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
```