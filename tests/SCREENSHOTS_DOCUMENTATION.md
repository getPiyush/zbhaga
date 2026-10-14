# Screenshot & UI Highlighting Documentation

## Overview

The Denver Trip Playwright tests now capture full-page screenshots at every step with automatic UI element highlighting, providing visual documentation of test execution.

## Features

### 📸 Screenshot Capture

Every major test step captures a full-page screenshot including:
- Complete page layout
- UI element states
- User interactions
- Visual state changes

### 🔴 UI Element Highlighting

Elements being interacted with are highlighted with:
- **Red border** - 3px solid red border around element
- **Red background** - Semi-transparent red overlay (rgba(255, 0, 0, 0.1))
- **Red glow** - Box shadow with red color
- **Arrow indicator** - Left-pointing arrow showing element location
- **Rounded corners** - 4px border radius for clarity

### 📁 Organized Storage

Screenshots are saved in:
```
test-screenshots/
├── signin-1-app-initial-load-2026-10-02-02-30-15.png
├── signin-2-sign-in-button-found-2026-10-02-02-30-16.png
├── signin-3-after-click-signin-2026-10-02-02-30-17.png
├── signin-4-email-filled-2026-10-02-02-30-18.png
├── signin-5-password-filled-2026-10-02-02-30-19.png
├── signin-6-before-submit-2026-10-02-02-30-20.png
├── signin-7-after-signin-success-2026-10-02-02-30-21.png
│
├── ui-groupview-1-groups-list-page-2026-10-02-02-31-10.png
├── ui-groupview-2-denver-trip-group-found-2026-10-02-02-31-11.png
├── ui-groupview-3-group-detail-page-2026-10-02-02-31-12.png
├── ui-groupview-4-expense-section-2026-10-02-02-31-13.png
├── ui-groupview-5-payment-section-2026-10-02-02-31-14.png
└── ui-groupview-6-balance-section-2026-10-02-02-31-15.png
```

### 🏷️ Naming Convention

Screenshots follow a naming pattern:

```
{test-name}-{step-name}-{timestamp}.png
```

**Example breakdown:**
- `signin` = Test name (Sign In)
- `1-app-initial-load` = Step name and sequence
- `2026-10-02-02-30-15` = Timestamp (YYYY-MM-DD-HH-MM-SS)

## Screenshot Points

### Sign In Test Steps

| Step | Screenshot | UI Element |
|------|-----------|-----------|
| 1 | App-Initial-Load | Full page load |
| 2 | Sign-In-Button-Found | Sign In button (highlighted) |
| 3 | After-Click-SignIn | Form revealed |
| 4 | Email-Filled | Email input (highlighted) |
| 5 | Password-Filled | Password input (highlighted) |
| 6 | Before-Submit | Submit button (highlighted) |
| 7 | After-SignIn-Success | Dashboard after login |

### Group View Test Steps

| Step | Screenshot | Content |
|------|-----------|---------|
| 1 | Groups-List-Page | List of all groups |
| 2 | Denver-Trip-Group-Found | Group in list (highlighted) |
| 3 | Group-Detail-Page | Group detail view |
| 4 | Expense-Section | Expenses tab/section |
| 5 | Payment-Section | Payments tab/section |
| 6 | Balance-Section | Balances tab/section |

## Viewing Screenshots

### Method 1: File Explorer
```bash
# Open screenshots directory
open test-screenshots/
```

### Method 2: Command Line
```bash
# List all screenshots
ls -lh test-screenshots/

# View specific screenshot
open test-screenshots/signin-4-email-filled-*.png
```

### Method 3: Browser
```bash
# Drag screenshot into browser
# Or: python -m http.server 8000
# Then: http://localhost:8000/test-screenshots/
```

### Method 4: VS Code
```
Open test-screenshots folder in VS Code
→ Right-click image → Open Preview
```

## Technical Implementation

### Screenshot Function

```typescript
async function takeScreenshot(
  page: Page,
  testName: string,
  stepName: string,
  elementLocator?: Locator
): Promise<string>
```

**Parameters:**
- `page` - Playwright Page object
- `testName` - Name of the test (SignIn, UI-GroupView)
- `stepName` - Name of the step (1-App-Initial-Load)
- `elementLocator` - Optional element to highlight

**Returns:**
- File path of saved screenshot

### Highlight Function

```typescript
async function highlightElement(page: Page, locator: Locator): Promise<void>
```

Creates visual highlight on specified element:
1. Gets element bounding rectangle
2. Creates div with red border/background
3. Adds arrow indicator
4. Waits 300ms for highlight to be visible
5. Screenshot captures highlighted state

### Usage Example

```typescript
// Take screenshot and highlight email input
const emailInput = await page.locator('input[type="email"]').first();
await emailInput.fill(email);
await takeScreenshot(page, 'SignIn', '4-Email-Filled', emailInput);
```

## Screenshot Output Log

When tests run, console shows:

```
🔐 Signing in as user1-1790921301958@denvertrip.test...
  📸 Screenshot: 1-App-Initial-Load
     Path: test-screenshots/signin-1-app-initial-load-2026-10-02-02-30-15.png
  📸 Screenshot: 2-Sign-In-Button-Found
     Path: test-screenshots/signin-2-sign-in-button-found-2026-10-02-02-30-16.png
  📸 Screenshot: 3-After-Click-SignIn
     Path: test-screenshots/signin-3-after-click-signin-2026-10-02-02-30-17.png
  📸 Screenshot: 4-Email-Filled
     Path: test-screenshots/signin-4-email-filled-2026-10-02-02-30-18.png
  📸 Screenshot: 5-Password-Filled
     Path: test-screenshots/signin-5-password-filled-2026-10-02-02-30-19.png
  📸 Screenshot: 6-Before-Submit
     Path: test-screenshots/signin-6-before-submit-2026-10-02-02-30-20.png
  📸 Screenshot: 7-After-SignIn-Success
     Path: test-screenshots/signin-7-after-signin-success-2026-10-02-02-30-21.png
  ✅ Signed in successfully
```

## Highlight Visual Elements

### Red Border
```css
border: 3px solid #ff0000;
```

### Semi-transparent Overlay
```css
background-color: rgba(255, 0, 0, 0.1);
```

### Red Glow
```css
box-shadow: 0 0 0 2px #ff0000, 0 0 10px #ff0000;
```

### Arrow Indicator
```css
/* Left-pointing arrow, red circle */
• Left offset: -20px from element
• Red circle: 20px × 20px
• Symbol: "◄"
```

## Use Cases

### 🔍 Debugging
- Identify where tests fail
- See UI state at each step
- Verify element visibility

### 📚 Documentation
- Create test documentation
- Show user journey through app
- Visual regression testing

### 👥 Stakeholder Communication
- Show test coverage to product team
- Demonstrate app functionality
- Build confidence in testing

### 🎓 Learning
- Understand test flow visually
- See how app responds to actions
- Identify UI patterns

## Screenshot Management

### Disk Space

Typical test run generates:
- ~7 Sign In screenshots
- ~6 UI Group View screenshots
- **Total: ~13 screenshots per run**
- **Size: ~5-15 MB per run** (depending on page complexity)

### Cleanup

```bash
# Remove all test screenshots
rm -rf test-screenshots/

# Archive screenshots
tar -czf test-screenshots-backup.tar.gz test-screenshots/

# Keep only recent screenshots (last 7 days)
find test-screenshots -mtime +7 -delete
```

### Storage Strategy

**Option 1: Keep All**
```bash
# No cleanup, keep history
npm run test:playwright -- tests/denver-trip-scenario.spec.ts
# Archives build up over time
```

**Option 2: Archive & Clean**
```bash
# Archive before cleanup
tar -czf archives/screenshots-$(date +%Y%m%d-%H%M%S).tar.gz test-screenshots/
rm -rf test-screenshots/
```

**Option 3: CI/CD Integration**
```yaml
# .github/workflows/test.yml
- name: Run Tests with Screenshots
  run: npm run test:playwright -- tests/denver-trip-scenario.spec.ts

- name: Upload Screenshots
  if: always()
  uses: actions/upload-artifact@v2
  with:
    name: test-screenshots
    path: test-screenshots/
    retention-days: 7
```

## Advanced Features

### Custom Highlight Colors

To change highlight color, modify:

```typescript
// In highlightElement function
highlight.style.border = '3px solid #00ff00'; // Green
highlight.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
highlight.style.boxShadow = '0 0 0 2px #00ff00, 0 0 10px #00ff00';
```

### Multi-Element Highlighting

```typescript
// Highlight multiple elements
const button = page.locator('button');
const input = page.locator('input');

await highlightElement(page, input);
await highlightElement(page, button);
await takeScreenshot(page, 'Test', 'Multiple-Highlights');
```

### Conditional Screenshots

```typescript
// Only take screenshots in debug mode
const debug = process.env.DEBUG === 'true';

if (debug) {
  await takeScreenshot(page, 'Test', 'Step');
}
```

## Troubleshooting

### Screenshots Not Created

**Check:**
1. `test-screenshots/` directory exists
2. Write permissions on directory
3. Disk space available

**Fix:**
```bash
# Create directory manually
mkdir -p test-screenshots

# Check permissions
chmod 755 test-screenshots
```

### Highlights Not Visible

**Reason:** Element might not be in viewport

**Fix:**
```typescript
// Scroll element into view
await elementLocator.scrollIntoViewIfNeeded();
await highlightElement(page, elementLocator);
```

### Large Screenshot Files

**Reason:** Full-page screenshots with complex layouts

**Options:**
1. Reduce page complexity
2. Use viewport-only screenshots
3. Compress images after

```bash
# Compress screenshots
for file in test-screenshots/*.png; do
  convert "$file" -quality 80 "$file"
done
```

## Best Practices

✅ **DO:**
- Name steps descriptively
- Include step numbers (1-, 2-, etc.)
- Screenshot before and after actions
- Highlight user-facing elements
- Archive old screenshots

❌ **DON'T:**
- Take too many redundant screenshots
- Highlight invisible elements
- Leave screenshots unorganized
- Ignore disk space warnings
- Commit screenshots to Git

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Run Playwright Tests
  run: npm run test:playwright -- tests/denver-trip-scenario.spec.ts

- name: Upload Test Screenshots
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-screenshots
    path: test-screenshots/
    retention-days: 30
```

### Jenkins

```groovy
stage('Test') {
  steps {
    sh 'npm run test:playwright -- tests/denver-trip-scenario.spec.ts'
  }
}

post {
  always {
    archiveArtifacts 'test-screenshots/**/*.png'
  }
}
```

## Accessing in CI/CD

**GitHub Actions:**
1. Go to workflow run
2. Click "Artifacts"
3. Download "test-screenshots"

**Jenkins:**
1. Click build number
2. View "Archive" section
3. Click screenshots

## Summary

The screenshot feature provides:

✅ **Visual Documentation** - Every step captured  
✅ **Element Highlighting** - Red borders & arrows  
✅ **Organized Storage** - Timestamped files  
✅ **Easy Debugging** - See exactly what happened  
✅ **CI/CD Ready** - Works in any environment  

---

*Last Updated: October 2, 2026*  
*Screenshots Enabled: YES*  
*Directory: test-screenshots/*  
*Per-run screenshots: ~13 images*  
*Total size per-run: 5-15 MB*
