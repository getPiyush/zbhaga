# 📸 Denver Trip E2E Test - Screenshot Reporting Guide

## Overview

The Denver Trip E2E test suite now includes **comprehensive screenshot coverage** on every phase step, with screenshots **automatically embedded in the Cucumber HTML report**. Every step captures screenshots with element highlighting, and failure cases are captured with error banners.

---

## 📊 Report Location

After running the tests, you'll find the reports at:

```
/Users/piyush/Development/zrugal/zbhaga/cucumber-report.html  ← Main report (open in browser)
/Users/piyush/Development/zrugal/zbhaga/cucumber-report.json  ← JSON format
/Users/piyush/Development/zrugal/zbhaga/cucumber-report.xml   ← JUnit format
```

### Local Screenshot Storage
Screenshots are also saved locally at:
```
./test-screenshots/denver-trip/
```

---

## 🚀 Running Tests with Screenshot Reports

### Standard Run (generates HTML report with embedded screenshots)
```bash
npm run test:e2e:denver
# or
npx cucumber-js
```

### View HTML Report
```bash
# Open in your default browser
open cucumber-report.html

# Or manually open the file in any web browser
```

---

## 📸 Screenshot Coverage

### Phase 1: User Signup
- ✅ Each user signup process captured
- ✅ Success/failure states documented

### Phase 2: Group Creation & Setup
- ✅ Create group button interaction
- ✅ Modal opening and form filling
- ✅ Group creation confirmation
- ✅ Invite code display

### Phase 3: Users Join Group
- ✅ Join group button interaction
- ✅ Invite code entry
- ✅ Group membership verification
- ✅ Success confirmation

### Phase 4: Add Expenses
- ✅ Multiple expenses per user
- ✅ Form filling (description, amount, date)
- ✅ Expense submission
- ✅ Reload and verification

### Phase 5: Record Payments
- ✅ Payment modal opening
- ✅ Payer selection with dropdown
- ✅ Recipient selection
- ✅ Amount entry
- ✅ Payment submission
- ✅ Verification

### Phase 6: Final Verification
- ✅ Group display verification
- ✅ Expenses tab viewing
- ✅ Balances tab viewing
- ✅ Expense count verification
- ✅ Payment count verification
- ✅ Cleanup confirmation

---

## 🎨 Screenshot Features

### Element Highlighting
Each interactive element is highlighted with:
- **Red bounding box** around the element
- **Glow effect** for visibility
- **Arrow indicator** pointing to the element
- **Automatic cleanup** after screenshot

### Error Capture
Failures are captured with:
- **Red error banner** overlaid on the page
- **Error message** displayed
- **Full-page screenshot** of the error state
- **Error details** attached to report

### Phase Markers
Each phase starts with:
- **Green banner** showing phase name
- **Phase number** (1-6)
- **Screenshot** documenting phase transition

---

## 📋 Screenshot Naming Convention

Screenshots are organized by:
- **Phase prefix** (e.g., `login-`, `expense-`, `payment-`)
- **Sequential number** (01, 02, 03...)
- **Descriptive suffix** (signin-page, modal-open, saved)
- **Timestamp** (ISO format for uniqueness)

Example filenames:
```
00-PHASE-1-START-user-signup-2024-10-02T12-34-56-789Z.png
login-01-signin-page-alice-2024-10-02T12-34-57-100Z.png
expense-1-03-desc-bob-2024-10-02T12-34-58-200Z.png
ERROR-add-expense-diana-2024-10-02T12-35-01-500Z.png
```

---

## 🔍 Reading the HTML Report

The Cucumber HTML report includes:

### 1. **Scenario Overview**
- Feature name
- Scenario title
- Execution time
- Pass/Fail status

### 2. **Step Details**
Each step shows:
- Step text (Given/When/Then)
- Execution status
- **Embedded screenshots** (inline images)
- Duration
- Error messages (if failed)

### 3. **Screenshots in Report**
- Click on any step to expand
- Embedded PNG images display inline
- Shows full page state at that moment
- Highlighting visible in screenshot

### 4. **Error Details**
For failed steps:
- Red error banner visible in screenshot
- Error message displayed
- Stack trace shown
- Full page capture for debugging

---

## 💡 Tips for Debugging

### 1. **Visual Trace**
Follow the sequence of screenshots to trace exactly what happened:
```
Step 1: Screenshot shows signup form
Step 2: Screenshot shows email entered (highlighted)
Step 3: Screenshot shows password entered (highlighted)
Step 4: Screenshot shows signin button clicked
Step 5: Screenshot shows error (if failed) or home page (if passed)
```

### 2. **Element Highlighting**
The red bounding boxes show:
- Which element was being interacted with
- Exact element dimensions
- Element position on page
- Helpful for debugging selector issues

### 3. **Timing Issues**
Screenshots capture:
- Modal open/close states
- Page load states
- Navigation transitions
- State changes after actions

### 4. **Error Screenshots**
Error screenshots include:
- Red error banner with message
- Page state at failure
- Visible validation messages
- Element where error occurred

---

## 🔧 Configuration

Screenshots are configured in:
```
tests/e2e/step-definitions/denver-trip.steps.ts
```

Key settings:
- **Screenshot directory**: `./test-screenshots/denver-trip/`
- **Fullpage**: `true` (entire page captured)
- **Highlight color**: `#ff0000` (red)
- **Highlight style**: Border + shadow glow
- **Report format**: HTML (auto-embedded)

---

## 📝 Example Report Structure

When you open `cucumber-report.html`, you'll see:

```
Feature: Denver Trip Expense Splitting
  Scenario: Complete Denver trip expense tracking workflow

    Background:
      ✅ Given the app is running at "http://localhost:8081"
         [screenshot embedded]
      ✅ Given the API is available at "http://localhost:4000"

    Scenario Steps:
      ✅ Given I sign up the following users one by one:
         [screenshot 1: phase marker]
         [screenshot 2: user signup]
      
      ✅ When "Alice" logs in with email "alice.denver@test.com" and password "TestPass123!"
         [screenshot 1: signin page]
         [screenshot 2: email entered (highlighted)]
         [screenshot 3: password entered (highlighted)]
         [screenshot 4: signin button before click (highlighted)]
         [screenshot 5: home page after login]
      
      ... (more steps with screenshots)
      
      ❌ When "Bob" adds an expense
         [screenshot 1: before action]
         [screenshot 2: error state (red banner)]
         Error: Element not found
```

---

## 🚨 Troubleshooting

### Screenshots not appearing in report
1. Ensure Cucumber HTML formatter is configured
2. Check that `globalWorld.attach()` is being called
3. Verify browser can take screenshots
4. Check file permissions in `test-screenshots/` directory

### Error banner not visible
1. Screenshot might be taken before banner renders
2. Check browser can modify DOM
3. Verify no Content Security Policy blocking changes

### Photos blurry or cut off
1. Screenshot is fullpage, so large pages may show scrolled content
2. Element highlighting is relative to viewport
3. Ensure browser window is at correct resolution

---

## 📈 Report Statistics

The report includes:
- **Total scenarios**: 2 (full flow + solo user)
- **Total steps**: 100+
- **Screenshots per scenario**: 60-80
- **Phase markers**: 6
- **Error captures**: Automatic on failure

---

## 🎬 Video-like Experience

By viewing screenshots in sequence:
1. You see the full flow of the app
2. Every interaction is captured
3. Element highlighting shows what's being clicked
4. Error states are clearly visible
5. Looks like a video playback of the test

---

## 📞 Need More Details?

### View Console Output
```bash
npm run test:e2e:denver 2>&1 | tee test-output.log
```

This shows:
- Phase transitions
- Screenshot filenames
- Report attachment confirmations
- Error messages with context

### Check Local Screenshots
```bash
ls -lah test-screenshots/denver-trip/ | head -20
```

This shows:
- All screenshot files
- File sizes
- Timestamps
- Names for reference

---

## ✨ Summary

Your test suite now provides:
- ✅ **Every step captured** with screenshots
- ✅ **Element highlighting** for clarity
- ✅ **Failure documentation** with error states
- ✅ **HTML report** with embedded images
- ✅ **Phase markers** for test flow
- ✅ **Local backup** of all screenshots
- ✅ **Professional presentation** ready to share

Open `cucumber-report.html` to see your test results with full screenshot documentation! 🎉
