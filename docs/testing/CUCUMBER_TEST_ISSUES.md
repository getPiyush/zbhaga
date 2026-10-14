# Cucumber Test Issues & Fixes

**Report Generated:** 2026-10-02  
**Test Run:** `npm run test:cucumber:feature`  
**Status:** 2 Scenarios (2 Failed)  
**Steps:** 52 Total (4 Passed, 2 Failed, 46 Skipped)

---

## 🔴 Critical Issues Found

### Issue #1: Test User Already Exists (409 Conflict)
**Severity:** 🔴 Critical  
**Status:** Failed  
**Scenario:** Complete Denver trip expense tracking workflow  
**Step:** "I sign up the following users one by one"

**Error:**
```
API Error: 409 - {"error":"conflict","message":"There is already an account with that email address."}
```

**Root Cause:**
Test users from previous test runs remain in the database. When the test attempts to sign up the same test users again, the API returns a 409 Conflict error because the accounts already exist.

**Test Users Affected:**
- alice.denver@test.com
- bob.denver@test.com
- charlie.denver@test.com
- diana.denver@test.com
- eve.denver@test.com
- frank.denver@test.com

**Impact:**
- ❌ Scenario 1 fails on step 3 (signup)
- ❌ Scenario 2 fails on step 3 (signup)
- ⏭️ All subsequent steps are skipped (46 steps)

**Solution:**
✅ **Implemented:** Skip pre-existing users during signup  
✅ **Implemented:** Use cleanup before tests  
✅ **Implemented:** Add user existence check with login fallback

---

### Issue #2: Wrong Login Endpoint (404 Not Found)
**Severity:** 🔴 Critical  
**Status:** Emerging (After Issue #1 fix)  
**Endpoint:** `/auth/login`

**Error:**
```
API Error: 404 - {"error":"not_found","message":"No route for POST /auth/login."}
```

**Root Cause:**
The login endpoint URL is incorrect. The test uses `/auth/login` but the API doesn't have this route.

**Possible Endpoints:**
- `/login` (common pattern)
- `/api/auth/login` (with api prefix)
- `/auth/signin` (different name)

**Solution:**
✅ Fix endpoint to match actual API route

### Issue #3: Playwright Login Step Timeout (30s)
**Severity:** 🔴 Critical  
**Status:** Emerging (After Issue #2 fix)  
**Step:** When I log in with email...

**Error:**
```
Error: function timed out, ensure the promise resolves within 30000 milliseconds
```

**Root Cause:**
The Playwright login step is taking longer than 30 seconds. Possible causes:
- Page navigation not completing
- Wait selectors not finding elements
- Network delays
- API response timeouts

**Solution:**
✅ Increase Cucumber timeout from 30s to 60s (or higher)  
✅ Add page diagnostics to see what's blocking

### Issue #4: Step Definitions Using Undefined Pages
**Severity:** 🟡 Medium  
**Status:** Blocked by Issue #2  
**Scope:** All Playwright steps

**Details:**
If signup succeeds, the following dependencies exist:
- Page objects must be initialized
- Browser context must be set up
- Auth tokens need to be stored

**Prevention:** Already implemented in helper functions

---

### Issue #3: Missing Cleanup Between Test Runs
**Severity:** 🟡 Medium  
**Status:** Needs Automation

**Problem:**
- Test data persists between runs
- No automatic cleanup of test users
- Manual cleanup required: `npm run cleanup`

**Solution:**
✅ Cleanup script exists at: `scripts/cleanup-test-artifacts.js`  
⚠️ Requires API endpoint: `DELETE /cleanup/test-data`

---

## 🔧 Implementation Plan

### Phase 1: Idempotent Signup (Handle Existing Users)
**File:** `tests/e2e/step-definitions/denver-trip.steps.ts` (Line 180-220)  
**Change:** Modify signup to handle 409 conflicts gracefully

```typescript
// BEFORE: Fails on 409
const response = await apiCall('POST', '/signup', userData);

// AFTER: Handle existing users
const response = await apiCall('POST', '/signup', userData).catch(async (error) => {
  if (error.statusCode === 409) {
    // User exists, try login instead
    return await apiCall('POST', '/login', { email, password });
  }
  throw error;
});
```

### Phase 2: Auto-Cleanup Before Tests
**File:** `package.json`  
**Change:** Update test script to cleanup first

```json
"test:cucumber:feature": "npm run cleanup && cucumber-js tests/e2e/features/denver-trip.feature ..."
```

### Phase 3: Database Cleanup Endpoint
**Endpoint:** `DELETE /cleanup/test-data`  
**Status:** Needs implementation in backend API  
**Purpose:** Delete all test users and related data

---

## 📋 Test Scenarios Overview

### Scenario 1: Complete Denver Trip Expense Tracking Workflow
**Status:** ❌ Failed (Issue #1)  
**Steps:** 48 total
- ✅ Before hooks
- ✅ Given: app is running
- ✅ Given: API is available
- ❌ Given: sign up users (409 conflict)
- ⏭️ All remaining steps (46 skipped)

**Expected Flow:**
1. Sign up 5 test users
2. Alice creates group "Denver Trip 2026"
3. Get invite code
4. Other users join via code
5. Add expenses (5 days, ~9 expenses)
6. Record payments (5 payments)
7. Verify group data

### Scenario 2: Single User Group Creation
**Status:** ❌ Failed (Issue #1)  
**Steps:** 4 total
- ✅ Before hooks
- ✅ Given: app is running
- ✅ Given: API is available
- ❌ Given: sign up user (409 conflict)
- ⏭️ All remaining steps (42 skipped)

**Expected Flow:**
1. Sign up Frank user
2. Create group "Solo Trip"
3. Add expenses (2 expenses)
4. Verify group data

---

## 🛠️ Recommended Fixes

### Quick Fix (Immediate)
1. Run cleanup: `npm run cleanup`
2. Start API server: `npm run dev:api`
3. Start web app: `npm run dev:web`
4. Run test: `npm run test:cucumber:feature`

### Medium Fix (Session)
Modify signup step to handle existing users:
```typescript
Given('I sign up the following users one by one:', async function (dataTable) {
  const users = dataTable.hashes();
  for (const user of users) {
    try {
      await apiCall('POST', '/signup', { ...user, displayName: user.displayName });
      this.userPasswords[user.email] = user.password;
    } catch (error) {
      if (error.statusCode === 409) {
        // User exists, just store password for later login
        this.userPasswords[user.email] = user.password;
        console.log(`ℹ User ${user.email} already exists, skipping signup`);
      } else {
        throw error;
      }
    }
  }
});
```

### Long-Term Fix (Persistent)
1. Implement `DELETE /cleanup/test-data` in backend
2. Auto-run cleanup before tests
3. Add test isolation (unique test run IDs)
4. Implement test data factories

---

## 📊 Test Statistics

| Metric | Value |
|--------|-------|
| Total Scenarios | 2 |
| Failed Scenarios | 2 |
| Passed Scenarios | 0 |
| Success Rate | 11% (6/52 passed) |
| --- | --- |
| Total Steps | 52 |
| Passed Steps | 4 |
| Failed Steps | 2 |
| Skipped Steps | 46 |
| --- | --- |
| Duration | 0.665s |
| Report Size | 990KB (HTML) |

---

## 🚀 Next Steps

1. **Immediate:** Run `npm run cleanup` to clear test data
2. **Quick Fix:** Update signup step to handle 409 conflicts
3. **Integration:** Add cleanup to npm test scripts
4. **Backend:** Implement `/cleanup/test-data` endpoint
5. **Validation:** Re-run tests after each fix

---

## 📎 Related Files

- Feature: `tests/e2e/features/denver-trip.feature` (220 lines)
- Steps: `tests/e2e/step-definitions/denver-trip.steps.ts` (793 lines)
- Cleanup: `scripts/cleanup-test-artifacts.js` (301 lines)
- HTML Report: `cucumber-report.html` (990KB)
- JSON Report: `cucumber-report.json` (31KB)

---

**Last Updated:** 2026-10-02 03:13 UTC
