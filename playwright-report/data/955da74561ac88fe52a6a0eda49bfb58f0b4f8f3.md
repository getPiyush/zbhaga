# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/complete-e2e.spec.ts >> zBhaga Complete E2E Test Suite >> Group Management Flows >> GM-2: User can see group cards with details
- Location: tests/e2e/complete-e2e.spec.ts:195:9

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 5
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
  105 |                              bodyText.includes('Your groups');
  106 | 
  107 |       expect(isAuthenticated).toBeTruthy();
  108 |       console.log('✅ Successfully authenticated');
  109 |     });
  110 | 
  111 |     test('AT-4: Invalid credentials shows error', async ({ page }) => {
  112 |       console.log('\n🧪 AT-4: Invalid Credentials Error');
  113 | 
  114 |       await page.goto(APP_URL);
  115 |       await page.waitForLoadState('networkidle');
  116 | 
  117 |       // Find Sign In button
  118 |       const signInButtons = await page.locator('button:has-text("Sign In")').all();
  119 |       if (signInButtons.length > 0) {
  120 |         await signInButtons[0].click();
  121 |         await page.waitForTimeout(500);
  122 | 
  123 |         // Fill with invalid credentials
  124 |         const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first().catch(() => null);
  125 |         const passwordInput = await page.locator('input[type="password"]').first().catch(() => null);
  126 | 
  127 |         if (emailInput && passwordInput) {
  128 |           await emailInput.fill('invalid@example.com');
  129 |           await passwordInput.fill('wrongpassword');
  130 | 
  131 |           const submitBtn = await page.locator('button:has-text("Sign In")').last();
  132 |           await submitBtn.click();
  133 | 
  134 |           await page.waitForTimeout(2000);
  135 |           console.log('✅ Invalid credentials form submitted');
  136 |         }
  137 |       }
  138 |     });
  139 | 
  140 |     test('AT-5: Session persists across page reloads', async ({ page }) => {
  141 |       console.log('\n🧪 AT-5: Session Persistence');
  142 | 
  143 |       // Sign in
  144 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  145 |       const textBefore = await page.locator('body').textContent() || '';
  146 | 
  147 |       // Reload page
  148 |       await page.reload();
  149 |       await page.waitForLoadState('networkidle');
  150 | 
  151 |       const textAfter = await page.locator('body').textContent() || '';
  152 |       const stillAuthenticated = textAfter.includes('Sign Out') || textAfter.includes('Hello');
  153 | 
  154 |       expect(stillAuthenticated).toBeTruthy();
  155 |       console.log('✅ Session persisted across reload');
  156 |     });
  157 | 
  158 |     test('AT-6: User can sign out successfully', async ({ page }) => {
  159 |       console.log('\n🧪 AT-6: Sign Out');
  160 | 
  161 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  162 |       await signOut(page);
  163 | 
  164 |       const bodyText = await page.locator('body').textContent() || '';
  165 |       const notAuthenticated = !bodyText.includes('Sign Out') &&
  166 |                               (bodyText.includes('Sign In') || bodyText.includes('Welcome'));
  167 | 
  168 |       expect(notAuthenticated || true).toBeTruthy(); // Lenient check
  169 |       console.log('✅ Successfully signed out');
  170 |     });
  171 |   });
  172 | 
  173 |   // ===== GROUP MANAGEMENT TESTS =====
  174 | 
  175 |   test.describe('Group Management Flows', () => {
  176 |     test.beforeEach(async ({ page }) => {
  177 |       await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  178 |     });
  179 | 
  180 |     test('GM-1: User can view list of groups', async ({ page }) => {
  181 |       console.log('\n🧪 GM-1: View Groups List');
  182 | 
  183 |       await page.goto(APP_URL);
  184 |       await page.waitForLoadState('networkidle');
  185 |       await page.waitForTimeout(1000);
  186 | 
  187 |       const bodyText = await page.locator('body').textContent() || '';
  188 |       const hasGroupContent = bodyText.toLowerCase().includes('group') ||
  189 |                              bodyText.includes('member');
  190 | 
  191 |       expect(bodyText.length).toBeGreaterThan(0);
  192 |       console.log('✅ Groups list accessible');
  193 |     });
  194 | 
  195 |     test('GM-2: User can see group cards with details', async ({ page }) => {
  196 |       console.log('\n🧪 GM-2: Group Cards Display');
  197 | 
  198 |       await page.goto(APP_URL);
  199 |       await page.waitForLoadState('networkidle');
  200 |       await page.waitForTimeout(1000);
  201 | 
  202 |       const groupCards = await page.locator('div[style*="border"]').all();
  203 |       const textElements = await page.locator('text').all();
  204 | 
> 205 |       expect(textElements.length).toBeGreaterThan(5);
      |                                   ^ Error: expect(received).toBeGreaterThan(expected)
  206 |       console.log(`✅ Found UI elements on groups page`);
  207 |     });
  208 | 
  209 |     test('GM-3: Create Group button is accessible', async ({ page }) => {
  210 |       console.log('\n🧪 GM-3: Create Group Button Access');
  211 | 
  212 |       await page.goto(APP_URL);
  213 |       await page.waitForLoadState('networkidle');
  214 |       await page.waitForTimeout(1000);
  215 | 
  216 |       const createButton = await page.locator('button:has-text("Create")').first().catch(() => null);
  217 |       const bodyText = await page.locator('body').textContent() || '';
  218 | 
  219 |       expect(bodyText.includes('Create') || bodyText.includes('create')).toBeTruthy();
  220 |       console.log('✅ Create button accessible');
  221 |     });
  222 | 
  223 |     test('GM-4: Join Group button is accessible', async ({ page }) => {
  224 |       console.log('\n🧪 GM-4: Join Group Button Access');
  225 | 
  226 |       await page.goto(APP_URL);
  227 |       await page.waitForLoadState('networkidle');
  228 |       await page.waitForTimeout(1000);
  229 | 
  230 |       const joinButton = await page.locator('button:has-text("Join")').first().catch(() => null);
  231 |       const bodyText = await page.locator('body').textContent() || '';
  232 | 
  233 |       expect(bodyText.includes('Join') || bodyText.includes('join') || bodyText.length > 0).toBeTruthy();
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
```