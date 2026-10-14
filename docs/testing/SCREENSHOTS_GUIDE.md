# Screenshots with Highlights - Complete Guide

The Cucumber test suite now captures detailed screenshots with visual highlights at every step of execution, making it easy to understand exactly what the test is doing.

## 📸 Features

### 1. Automatic Screenshots at Every Step

Every major action in the test flow captures a screenshot:
- Page loads
- Form input
- Button clicks
- Navigation changes
- Tab switches
- Verification checks

### 2. Visual Highlights

When elements are interacted with, they're highlighted with:
- **Red border** around the element
- **Red glow effect** for emphasis
- **Red arrow pointer** indicating the action
- **3px offset** to avoid clipping

### 3. Numbered Screenshots

Screenshots are numbered sequentially (01, 02, 03, etc.) to show the exact order of execution:

```
01-signin-page-alice.png                    ← Initial signin page
02-email-entered-alice.png                  ← Email field highlighted
03-password-entered-alice.png               ← Password field filled
04-before-signin-click-alice.png            ← Signin button highlighted
05-after-signin-home-alice.png              ← After successful login
...
```

### 4. Timestamped Files

Each screenshot includes a timestamp for uniqueness:
```
01-signin-page-alice-2026-10-02T15-30-45-123Z.png
```

## 📋 Screenshot Sequence

### User Signup Phase
```
✓ Users sign up via API (no UI screenshots)
```

### Login Phase (per user)
- `01-signin-page` - Initial login page
- `02-email-entered` - Email field highlighted
- `03-password-entered` - Password field highlighted
- `04-before-signin-click` - Sign in button highlighted
- `05-after-signin-home` - Home page after login

### Group Creation
- `06-before-create-group` - Create Group button highlighted
- `07-create-group-modal` - Modal opened
- `08-group-name-entered` - Group name field highlighted
- `09-before-submit-group` - Submit button highlighted
- `10-group-created` - Group detail page

### Invite Code
- `11-before-invite-button` - Invite button highlighted
- `12-invite-code-modal` - Modal with code
- `13-invite-code-display` - Code element highlighted

### Join Group (per user)
- `14-before-join-group` - Join Group button highlighted
- `15-join-group-modal` - Modal opened
- `16-code-entered` - Code field highlighted
- `17-before-submit-join` - Submit button highlighted
- `18-joined-group` - Group page after joining

### Add Expenses (per expense)
- `21-group-detail` - Starting point
- `22-exp1-before-add` - Add Expense button highlighted
- `23-exp1-modal` - Modal opened
- `24-exp1-desc` - Description field filled
- `25-exp1-amount` - Amount field highlighted
- `26-exp1-date` - Date field filled
- `27-exp1-before-submit` - Submit button highlighted
- `28-exp1-added` - Expense added

### Record Payments (per payment)
- `30-payments-tab` - Payments tab active
- `32-pay1-modal` - Payment modal opened
- `33-pay1-before-paidby` - Paid By button highlighted
- `34-pay1-paidby-dropdown` - Dropdown shown
- `35-pay1-paidby-selected` - Selection confirmed
- `36-pay1-before-paidto` - Paid To button highlighted
- `37-pay1-paidto-dropdown` - Dropdown shown
- `38-pay1-paidto-selected` - Selection confirmed
- `39-pay1-amount` - Amount field highlighted
- `40-pay1-before-submit` - Submit button highlighted
- `41-pay1-recorded` - Payment recorded

### Verification
- `42-verify-groups-list` - Back to groups list
- `43-verify-before-click-group` - Group highlighted
- `44-verify-group-detail` - Group detail page
- `45-verify-before-expenses-tab` - Expenses tab highlighted
- `46-verify-expenses-tab` - Expenses shown
- `47-verify-before-balances-tab` - Balances tab highlighted
- `48-verify-balances-tab` - Balances shown
- `50-verify-before-expense-count-tab` - Expenses tab highlighted
- `51-verify-expense-count-tab` - Counting expenses
- `52-verify-expenses-counted` - Count verified
- `53-verify-before-payment-count-tab` - Payments tab highlighted
- `54-verify-payment-count-tab` - Counting payments
- `55-verify-payments-counted` - Count verified

## 🎯 How Highlights Work

### Highlight Box
```css
border: 4px solid #ff0000;
box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.3), 0 0 15px rgba(255, 0, 0, 0.6);
border-radius: 4px;
```

- **Red border** - Main highlight border
- **Red glow** - Outer shadow effect
- **Rounded corners** - Professional appearance
- **Fixed position** - Stays visible during scrolling

### Arrow Pointer
```css
width: 24px;
height: 24px;
background: #ff0000;
border-radius: 50%;
```

- **Red circle** - Positions left of element
- **White arrow** (◄) - Points to element
- **Glow effect** - Matches the box shadow

### Auto-Cleanup
Highlights are automatically removed after screenshot:
```typescript
// Remove all previous highlights
const oldHighlights = document.querySelectorAll('[data-test-highlight]');
oldHighlights.forEach((el) => el.remove());
```

## 📁 Screenshot Storage

Screenshots are saved to:
```
test-screenshots/denver-trip/
├── 01-signin-page-alice-2026-10-02T15-30-45.png
├── 02-email-entered-alice-2026-10-02T15-30-47.png
├── 03-password-entered-alice-2026-10-02T15-30-49.png
├── ... (100+ more screenshots)
└── 62-solo-final-expenses-view-frank-2026-10-02T15-31-45.png
```

### View Screenshots

```bash
# Open screenshot directory
open test-screenshots/denver-trip/

# Or with file browser
ls -lh test-screenshots/denver-trip/ | sort
```

## 🔍 Using Screenshots for Debugging

### Finding Failures
1. Check the screenshot sequence
2. Look at where the sequence stops
3. View the last "before" screenshot to see element location
4. Check logs for error message

### Validating UI
1. Follow screenshot sequence
2. Verify each highlight shows correct element
3. Check element is visible and clickable
4. Confirm styling matches expectations

### Understanding Flow
1. Start with first screenshot
2. Follow numbered sequence
3. Watch progression through workflow
4. Observe state changes

## 📊 Example Analysis

Looking at payment recording screenshots:

```
30-payments-tab.png
  └─ Payments tab is now active

32-pay1-modal.png
  └─ Record payment modal opened

33-pay1-before-paidby.png (HIGHLIGHTED)
  └─ "Paid By" selector is about to be clicked

34-pay1-paidby-dropdown.png
  └─ Dropdown menu is open with user options

35-pay1-paidby-selected.png
  └─ User "Bob" is selected as payer

36-pay1-before-paidto.png (HIGHLIGHTED)
  └─ "Paid To" selector is about to be clicked

37-pay1-paidto-dropdown.png
  └─ Dropdown menu shows recipient options

38-pay1-paidto-selected.png
  └─ User "Alice" selected as recipient

39-pay1-amount.png (HIGHLIGHTED)
  └─ Amount field "$200" is entered

40-pay1-before-submit.png (HIGHLIGHTED)
  └─ Submit button is about to be clicked

41-pay1-recorded.png
  └─ Payment successfully recorded
```

## 🎬 Video-Like Progression

The numbered screenshots create a "video-like" progression of the test:

- **01-05**: User logs in
- **06-10**: Creates group
- **11-13**: Gets invite code
- **14-18**: Other users join
- **21-28**: Expenses added
- **30-41**: Payments recorded
- **42-55**: Verification complete

Following these in order shows exactly what happens at each step.

## 💡 Tips for Screenshots

### 1. Always Check Before/After
Each major action has:
- `before-X` - Element highlighted before interaction
- `action-Y` - State during action
- Result screenshot - State after action

### 2. Highlight Pattern
Look for numbered pattern:
```
XX-step-name.png                    (overview)
XX-step-before-action.png           (highlight before)
XX-step-during-action.png           (during action)
XX-step-after-action.png            (result)
```

### 3. User Identification
Screenshots include user names:
```
01-signin-page-alice.png            (Alice's perspective)
01-signin-page-bob.png              (Bob's perspective)
```

### 4. Timestamp Reference
Each screenshot has timestamp:
```
01-signin-page-alice-2026-10-02T15-30-45-123Z.png
                              └─ Execution time
```

## 🚨 Common Issues

### Missing Screenshots
- Check if screenshots directory exists
- Verify file permissions on disk
- Check disk space available

### Blurry Highlights
- Highlights use CSS only (no image manipulation)
- Ensure element is fully rendered before screenshot
- Check element isn't behind other elements

### Incomplete Sequence
- Test stopped at first failure
- Check error logs for cause
- Look at last screenshot to see where it failed

## 📈 Performance

### Screenshot Impact
- ~50-100ms per screenshot (depending on page size)
- Total test with screenshots: ~2-5 minutes
- Screenshots add ~1-2MB per test run

### Disable Screenshots (if needed)
Edit `denver-trip.steps.ts`:
```typescript
// Comment out takeScreenshot calls
// await takeScreenshot(page, ...);
```

## 🎨 Customizing Highlights

To change highlight style, edit the `highlightElement` function in `denver-trip.steps.ts`:

```typescript
// Change border color
highlight.style.border = '4px solid #0000ff';  // Blue instead of red

// Change arrow appearance
arrow.textContent = '●';  // Dot instead of arrow

// Change glow effect
highlight.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';  // More glow
```

## 📝 Documentation

Create test documentation from screenshots:
1. Take screenshots with highlights
2. Export numbered sequence
3. Add captions and arrows
4. Create step-by-step guide

Useful for:
- Training documentation
- Bug reports
- User demonstrations
- UI/UX review

## ✅ Best Practices

1. **Always highlight elements before clicking**
   ```typescript
   await takeScreenshot(page, 'before-click', '[selector]');
   await page.click('[selector]');
   ```

2. **Capture state changes**
   ```typescript
   await takeScreenshot(page, 'form-empty');
   await page.fill('[input]', 'value');
   await takeScreenshot(page, 'form-filled');
   ```

3. **Use descriptive names**
   ```typescript
   // Good
   await takeScreenshot(page, '05-after-signin-home-alice');
   
   // Not good
   await takeScreenshot(page, 'screenshot');
   ```

4. **Number sequences**
   - Helps understand order
   - Makes sorting easy
   - Facilitates debugging

## 🎯 Conclusion

The screenshot system provides:
- ✅ Visual understanding of test flow
- ✅ Easy debugging of failures
- ✅ Documentation of user workflows
- ✅ Validation of UI changes
- ✅ Evidence of test execution

Use them effectively to understand, debug, and document your tests!

---

**Run tests with screenshots:**
```bash
npm run dev                    # Start servers
npm run test:cucumber:feature  # Run tests with full screenshots
open test-screenshots/denver-trip/  # View results
```
