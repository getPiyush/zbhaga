# Finding and Fixing Application Issues - Complete Guide

**Purpose:** Systematic approach to identify and fix bugs found by Cucumber tests  
**Audience:** Developers fixing application bugs  
**Status:** Ready to implement

---

## 🎯 Complete Workflow

```
1. RUN TESTS          → Capture all issues
2. ANALYZE RESULTS    → Categorize by severity
3. IDENTIFY CAUSE     → Root cause analysis
4. PLAN FIX          → Design solution
5. IMPLEMENT FIX     → Code changes
6. VERIFY FIX        → Re-run tests
7. DOCUMENT FIX      → Update docs
8. CLOSE ISSUE       → Mark resolved
```

---

## 📋 Step-by-Step Process

### Step 1: Run Comprehensive Tests

**Automated (Recommended):**
```bash
# Runs everything: cleanup → start services → tests → analyze → cleanup
bash scripts/run-and-analyze-tests.sh

# Output:
# - Test results in test-logs/
# - Issues report in test-logs/issues-*.md
# - HTML report: cucumber-report.html
```

**Manual:**
```bash
# Terminal 1: API
npm run dev:api

# Terminal 2: Web App
npm run dev:web

# Terminal 3: Tests
npm run test:cucumber:feature

# Optional: Diagnostic
node scripts/diagnose-ui.js
```

### Step 2: Identify Issues

Review the logs and reports:

```bash
# View test output
cat test-logs/test-run-*.log

# View issues report
cat test-logs/issues-*.md

# View HTML report
open cucumber-report.html

# Check API logs
cat test-logs/api-*.log | grep -i "error"

# Check Web logs
cat test-logs/web-*.log | grep -i "error"
```

### Step 3: Categorize Issues

For each issue, determine:

**Severity:**
- 🔴 **Critical** - Breaks core functionality, users can't use app
- 🟠 **High** - Significant impact, feature doesn't work properly
- 🟡 **Medium** - Workaround exists, feature partially works
- 🟢 **Low** - Minor issue, cosmetic or edge case

**Category:**
- **API** - Backend endpoints, validation, data handling
- **UI** - Frontend display, interaction, navigation
- **Data** - Database, calculations, persistence
- **Auth** - Login, permissions, sessions

**Area:**
- Signup/Login
- Groups
- Expenses
- Payments
- Calculations
- Display/UI

### Step 4: Document the Issue

Use this template to document each issue:

```markdown
## Issue #N: [Brief Title]

### Basic Info
- **Severity:** 🔴 Critical
- **Category:** API / UI / Data / Auth
- **Area:** [Signup/Groups/Expenses/Payments/Calculations]
- **Status:** New / In Progress / Fixed / Verified
- **Date Found:** YYYY-MM-DD

### Problem Description
One sentence summary of what's wrong.

### Test That Failed
Which Cucumber step failed?
```
When "Alice" adds an expense to "Denver Trip 2026" group
```

### Steps to Reproduce
1. Sign up user
2. Create group
3. Add expense with amount $100.50
4. See what happens

### Expected Behavior
Expense should be created with:
- Correct amount: $100.50
- Correct description
- Correct date
- Correct payer
- Correct group

### Actual Behavior
The expense was created with amount $100.00 (cents dropped)

### Error Message
```
API Response: {"amount": 100, "error": "Amount rounded"}
```

### Root Cause Analysis
The backend is rounding decimal amounts to integers instead of storing cents.

**File:** `apps/api/src/routes/expenses.ts` (Line 42)
```typescript
const amount = Math.floor(expense.amount);  // ← BUG: Should be Math.round()
```

### Impact
- Users lose precision on expense amounts
- Settlement calculations may be off by cents
- Multiple small errors compound

### Suggested Fix
Change `Math.floor()` to proper decimal handling:

```typescript
// Before
const amount = Math.floor(expense.amount);

// After
const amount = parseFloat(expense.amount.toFixed(2));
```

### Files to Modify
- `apps/api/src/routes/expenses.ts`
- `apps/api/src/models/Expense.ts` (if validation exists)
- `tests/e2e/features/denver-trip.feature` (verify test expectations)

### Verification Plan
1. Fix the code
2. Run diagnostic: `node scripts/diagnose-ui.js`
3. Re-run tests: `npm run test:cucumber:feature`
4. Check logs for "add expense" step
5. Verify amount is stored correctly
6. Confirm all related payments calculate correctly

### Related Issues
- Issue #X: Settlement calculations off
- Issue #Y: Payment amounts not matching

### Notes
- Found during Denver trip scenario
- Affects both new and existing expenses
- May need database migration if data already stored incorrectly
```

### Step 5: Analyze Root Cause

**For API Issues:**
```bash
# 1. Check API logs
tail -100 test-logs/api-*.log | grep -i "error"

# 2. Check request/response
# Add logging to API endpoint
console.log('Request:', req.body);
console.log('Response:', response);

# 3. Test endpoint directly
curl -X POST http://localhost:4000/groups \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group"}'

# 4. Check database
# Connect to DB and query directly
SELECT * FROM groups WHERE name = 'Test Group';
```

**For UI Issues:**
```bash
# 1. Check browser console
# Open DevTools → Console tab
# Look for JavaScript errors

# 2. Check network tab
# Open DevTools → Network tab
# Check API responses

# 3. Inspect element
# Right-click element → Inspect
# Check if element exists and has correct attributes

# 4. Check page state
# Open browser console
# Run: console.log(document.body.innerHTML)
```

**For Data Issues:**
```bash
# 1. Check database directly
SELECT * FROM expenses WHERE id = 1;

# 2. Check calculations
SELECT SUM(amount) FROM expenses WHERE group_id = 1;

# 3. Compare with API response
curl http://localhost:4000/groups/1/expenses

# 4. Check for race conditions
# Run multiple operations in parallel
# Check if data is consistent
```

### Step 6: Implement Fix

**Typical Workflow:**
```bash
# 1. Create feature branch
git checkout -b fix/issue-description

# 2. Make code changes
# Edit the file with the bug

# 3. Run type checking
npm run typecheck

# 4. Run diagnostic
node scripts/diagnose-ui.js

# 5. Test the fix locally
npm run dev:api
npm run dev:web
# Manually test in browser

# 6. Re-run Cucumber tests
npm run test:cucumber:feature

# 7. Commit changes
git add .
git commit -m "fix: [issue description]

Fixes #N: [Issue title]

Changes:
- Fixed [what was wrong]
- Updated [what was changed]
- Added [if test case needed]"
```

### Step 7: Verify Fix

**Verification Checklist:**
```bash
# 1. Test passes
✓ npm run test:cucumber:feature

# 2. Related tests still pass
✓ All 52 cucumber steps pass
✓ Other scenarios not broken

# 3. Database clean
✓ Test data cleaned up properly
✓ No orphaned records

# 4. Screenshots generated
✓ All screenshots captured
✓ Key steps documented

# 5. Logs clean
✓ No error messages in logs
✓ No warnings
✓ Performance acceptable
```

---

## 🔍 Common Application Issues Found by Tests

### Issue Type 1: API Response Issues

**Pattern:**
```
✖ Step fails with: "Cannot read property 'X' of undefined"
```

**Root Cause:**
API not returning expected field

**Fix Process:**
1. Check API endpoint
2. Verify response format
3. Update if field missing
4. Add validation
5. Test response

**Example Fix:**
```typescript
// Before: Missing email in response
res.json({ id: user.id, name: user.name });

// After: Include all required fields
res.json({
  id: user.id,
  email: user.email,
  name: user.name,
  token: user.token
});
```

### Issue Type 2: UI Element Not Found

**Pattern:**
```
✖ Element not found: [data-testid="..."]
```

**Root Cause:**
Element doesn't exist or has different ID

**Fix Process:**
1. Inspect actual element in browser
2. Find correct selector
3. Update test selectors in `ElementSelectors`
4. Re-run tests

**Example Fix:**
```typescript
// Before: Wrong ID
EMAIL_INPUT: { testid: 'email-input' }

// After: Correct ID
EMAIL_INPUT: { name: 'userEmail', placeholder: 'Email' }
```

### Issue Type 3: Data Not Persisting

**Pattern:**
```
✖ Expected data not found after save
```

**Root Cause:**
Data not being saved to database

**Fix Process:**
1. Check save endpoint
2. Verify database INSERT
3. Check for errors
4. Add error handling
5. Test persistence

**Example Fix:**
```typescript
// Before: No error handling
await db.expenses.create(expenseData);

// After: With error handling and verification
try {
  const saved = await db.expenses.create(expenseData);
  if (!saved) throw new Error('Failed to save expense');
  return saved;
} catch (error) {
  console.error('Save failed:', error);
  throw error;
}
```

### Issue Type 4: Calculation Errors

**Pattern:**
```
✖ Total amount is $X but expected $Y
```

**Root Cause:**
Incorrect calculation logic

**Fix Process:**
1. Find calculation code
2. Verify formula
3. Check data types
4. Test with examples
5. Handle edge cases

**Example Fix:**
```typescript
// Before: Integer division loses cents
const split = expense.amount / users.length;

// After: Proper decimal handling
const split = parseFloat((expense.amount / users.length).toFixed(2));
```

### Issue Type 5: Authorization/Security

**Pattern:**
```
✖ User can see data from another user
```

**Root Cause:**
Missing authorization checks

**Fix Process:**
1. Find endpoint
2. Add user ID check
3. Verify user owns resource
4. Prevent unauthorized access
5. Test security

**Example Fix:**
```typescript
// Before: No check
const expense = await db.expenses.findOne(id);

// After: With authorization
const expense = await db.expenses.findOne({
  id: id,
  userId: req.user.id  // ← Add ownership check
});
if (!expense) throw new Error('Not found or unauthorized');
```

---

## 🛠️ Tools for Debugging

### Browser DevTools
```bash
# Open DevTools
F12 or Cmd+Option+I

# Check Console for JavaScript errors
# Check Network tab for API issues
# Check Application tab for stored data
# Use debugger to step through code
```

### API Testing
```bash
# Use curl for testing endpoints
curl -X POST http://localhost:4000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass","name":"Test"}'

# Use Postman for complex requests
# Set up authentication
# Test different scenarios
```

### Database Inspection
```bash
# Connect to database
psql -U user -d database_name

# Check data
SELECT * FROM users;
SELECT * FROM groups;
SELECT * FROM expenses;

# Debug calculations
SELECT *, SUM(amount) OVER (PARTITION BY group_id) as total 
FROM expenses;

# Find issues
SELECT * FROM expenses WHERE amount IS NULL;
SELECT * FROM payments WHERE payer_id = payee_id;
```

### Log Analysis
```bash
# Extract errors from logs
grep -i "error" test-logs/*.log

# Extract specific pattern
grep "expense" test-logs/*.log | grep -i "fail"

# Count occurrences
grep -i "error" test-logs/*.log | wc -l

# Show context (3 lines before/after)
grep -i -C 3 "error" test-logs/*.log
```

---

## 📊 Issue Tracking

### Create Issue Summary

```bash
# After fixing each issue:

1. Update APPLICATION_ISSUES_ANALYSIS.md
2. Add to issues found section
3. Include:
   - What was wrong
   - How it was fixed
   - Files changed
   - Verification status

# Example:
### Issue #1: Expense Amount Truncation ✅ FIXED

**Problem:** Decimal amounts were being truncated to integers

**Root Cause:** Math.floor() in expense creation endpoint

**Fix:** Changed to proper decimal handling with toFixed(2)

**Files Modified:**
- apps/api/src/routes/expenses.ts

**Verification:** All expense tests pass, decimal amounts preserved
```

---

## ✅ Verification Checklist for Each Fix

- [ ] Issue documented in APPLICATION_ISSUES_ANALYSIS.md
- [ ] Root cause identified
- [ ] Code change made
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Unit tests created or updated (if applicable)
- [ ] Cucumber tests pass (`npm run test:cucumber:feature`)
- [ ] Related tests still pass
- [ ] No console errors
- [ ] No database issues
- [ ] Documentation updated
- [ ] Commit message clear and references issue
- [ ] Code reviewed (if applicable)

---

## 🚀 Running Tests in Different Scenarios

### Scenario 1: Full Application Test
```bash
bash scripts/run-and-analyze-tests.sh
# Runs everything automatically
```

### Scenario 2: Quick Smoke Test
```bash
npm run cleanup
npm run dev:api &
npm run dev:web &
sleep 3
npm run test:cucumber:feature
```

### Scenario 3: Specific Scenario Only
```bash
# Run just one scenario
npm run dev:api &
npm run dev:web &
npm run test:cucumber:feature | grep "Scenario: \[name\]"
```

### Scenario 4: Debug Mode
```bash
# With debug output
DEBUG=* npm run test:cucumber:feature

# With verbose logging
npm run test:cucumber:feature --verbose
```

---

## 📈 Metrics to Track

Record these metrics in your issue documentation:

```
- Issues Found: X
- Critical: X (must fix)
- High: X (should fix)
- Medium: X (nice to fix)
- Low: X (can defer)

- Issues Fixed: X
- Issues In Progress: X
- Issues Deferred: X

- Success Rate Before Fixes: XX%
- Success Rate After Fixes: XX%
```

---

## 🎓 Best Practices

1. **Test Early, Fix Fast**
   - Run tests frequently
   - Fix issues immediately
   - Don't accumulate bugs

2. **Document Everything**
   - Clear issue descriptions
   - Detailed root cause
   - Solution explained

3. **Verify Thoroughly**
   - Test the fix
   - Run all tests
   - Check edge cases

4. **Communicate**
   - Link to issue in commits
   - Add comments to code
   - Update documentation

5. **Prevent Recurrence**
   - Add test cases for bug
   - Improve validation
   - Add logging/monitoring

---

## 🔗 Quick Links

- **Run Tests:** `bash scripts/run-and-analyze-tests.sh`
- **Test Reports:** `cucumber-report.html`
- **Issues Found:** Check logs/ directory
- **Application Code:** `apps/api/` and `apps/client/`
- **Test Code:** `tests/e2e/`
- **Documentation:** `docs/testing/`

---

**Ready to identify and fix application issues!**

Next: Run tests and analyze results → Document issues → Fix → Verify
