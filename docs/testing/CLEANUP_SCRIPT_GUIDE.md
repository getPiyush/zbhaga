# Test Database Cleanup Script - Complete Guide

Automated cleanup of test database data while **preserving all reports and screenshots** for documentation purposes.

## 📋 Overview

The cleanup script runs after Cucumber tests and:
- ✅ **Deletes test database records** (users, groups, expenses, payments)
- ✅ **Removes temporary test files** (.tmp, .cache)
- ✅ **PRESERVES all reports** (HTML, JSON, XML) - essential for docs
- ✅ **PRESERVES all screenshots** (250+ PNG files) - visual evidence
- ✅ **Provides detailed summary**
- ✅ **Supports dry-run mode**

## 🚀 Quick Start

### Automatic Cleanup (After Tests)
```bash
npm run test:cucumber:feature
# Automatically cleans database after tests complete
```

### Manual Cleanup
```bash
# Standard cleanup
npm run cleanup

# With verbose output
npm run cleanup:after-test

# Preview without making changes
npm run cleanup:dry-run

# Skip database, cleanup temp files only
npm run cleanup --skip-db
```

## 🔧 Cleanup Options

### Standard Cleanup (`npm run cleanup`)
**Runs automatically after every test**

Performs:
- ✅ Connects to API and deletes test data
- ✅ Removes temp files
- ✅ **KEEPS all reports** ← Important!
- ✅ **KEEPS all screenshots** ← Important!
- ✅ Provides summary

Output:
```
============================================================
  Test Database Cleanup
============================================================

ℹ Cleaning up test database...
✓ Deleted test data: 5 users, 2 groups, 9 expenses, 5 payments
ℹ Cleaning up temporary files...
✓ Removed 3 temporary files
ℹ Verifying preservation of test reports and screenshots...
✓ Protected: 3 reports, 287 screenshots

============================================================
  Cleanup Summary
============================================================

✓ Database Cleanup:
  ✓ Test Users Deleted:       5
  ✓ Test Groups Deleted:      2
  ✓ Test Expenses Deleted:    9
  ✓ Test Payments Deleted:    5
✓ Temp Files Deleted:       3

✓ Preserved:
  ✓ All Reports               (HTML, JSON, XML)
  ✓ All Screenshots           (250+ PNG files)
  ✓ Test Artifacts            (Essential for documentation)

✓ Duration:             0.45s
```

### Dry Run Mode (`npm run cleanup:dry-run`)
**Preview cleanup without making changes**

Output shows:
- What database records would be deleted
- All files that would be cleaned
- Confirmation that reports/screenshots are preserved
- No actual changes made

Perfect for:
- Verifying cleanup behavior
- Understanding impact
- Testing new rules

### Skip Database (`npm run cleanup --skip-db`)
**Cleanup only temp files, skip database**

Use when:
- API not available
- Want to preserve database state
- Testing cleanup script behavior

## 📊 What Gets Cleaned

### Database Cleanup
```
Test Users:
  - Accounts created during test runs
  - All associated data

Test Groups:
  - Groups created in tests
  - Expenses within groups
  - Payment records

Test Expenses:
  - All expense entries
  - Descriptions, amounts, dates

Test Payments:
  - Settlement records
  - Payment transactions
  - Test balances
```

### Temporary Files
```
Files removed:
  - tmp-test-data.json
  - .test-cache

Impact: 10-50 KB freed
```

### What Is PRESERVED ✅
```
Reports (NEVER deleted):
  ✓ cucumber-report.html
  ✓ cucumber-report.json
  ✓ cucumber-report.xml

Screenshots (NEVER deleted):
  ✓ test-screenshots/denver-trip/*.png
  ✓ All 250-300 screenshots kept
  ✓ Timestamped with execution order
  ✓ Visual evidence of test flow
```

## 🔄 Integration with Test Pipeline

### Automatic Execution After Tests
```bash
# In package.json
"test:cucumber:feature": "cucumber-js ... && npm run cleanup:after-test"
```

**Behavior:**
- Tests run
- Reports generated (HTML, JSON, XML)
- Screenshots captured (250-300 files)
- Tests complete successfully or fail
- Database cleanup executes (always)
- Reports and screenshots preserved (always)
- Temporary files cleaned
- Summary displayed
- Process exits

## 🎯 Usage Examples

### Example 1: Run Tests with Auto Cleanup
```bash
npm run test:cucumber:feature

# Output shows:
# ✓ Deleted test data: 5 users, 2 groups, 9 expenses, 5 payments
# ✓ Protected: 3 reports, 287 screenshots
```

### Example 2: Verify Cleanup Before Running
```bash
npm run cleanup:dry-run

# Output:
# ⚠ DRY RUN MODE - No changes will be made
# ✓ Deleted test data: 5 users, 2 groups, 9 expenses, 5 payments
# ✓ Protected: 3 reports, 287 screenshots
```

### Example 3: Skip Database Cleanup
```bash
npm run cleanup -- --skip-db

# Only removes temp files
# Database records preserved
```

## 📊 Configuration

### Default Settings
```javascript
CONFIG = {
  apiUrl: 'http://localhost:4000',           // API endpoint
  dbCleanupEndpoint: '/cleanup/test-data',   // Cleanup endpoint
  preserveScreenshots: true,                 // ALWAYS keep
  preserveReports: true,                     // ALWAYS keep
  verbose: false,                            // Detailed logging
  dry: false,                                // Preview mode
  skipDb: false                              // Skip database
}
```

### Override API URL
```bash
# Use custom API URL
API_URL=http://api.example.com npm run cleanup:after-test
```

## 🛡️ Safety Features

### 1. Dry-Run Mode
```bash
npm run cleanup:dry-run
# Shows what would be deleted without changes
```

### 2. Preserved Reports
```
Reports are NEVER deleted:
✓ cucumber-report.html
✓ cucumber-report.json
✓ cucumber-report.xml
```

### 3. Preserved Screenshots
```
Screenshots are NEVER deleted:
✓ test-screenshots/denver-trip/*.png
✓ All visual evidence preserved
✓ All 250-300 screenshots kept
```

### 4. Error Handling
- Gracefully handles API unavailability
- Continues if database endpoint not available
- Reports all errors clearly
- No catastrophic failures

## 🔍 What Happens When API Is Unavailable

If the API is not running:
```
ℹ Cleaning up test database...
ℹ API unavailable - skipping database cleanup (tests may still pass)
ℹ Cleaning up temporary files...
✓ Removed 3 temporary files
ℹ Verifying preservation...
✓ Protected: 3 reports, 287 screenshots
```

**Note:** The cleanup script gracefully handles API unavailability and continues with other cleanup tasks.

## 📋 Common Scenarios

### Scenario 1: Daily Test Runs
```bash
npm run test:cucumber:feature

# Result:
# - Database cleaned
# - Temp files removed
# - Reports and screenshots preserved
# - Ready for next run
```

### Scenario 2: Before Pushing to Production
```bash
npm run cleanup:dry-run
npm run test:cucumber:feature

# Verify cleanup behavior
# Run tests with auto cleanup
# All evidence preserved
```

### Scenario 3: CI/CD Integration
```yaml
# GitHub Actions
- run: npm run test:cucumber:feature
  # Auto cleanup runs as part of test command
  # Reports and screenshots available as artifacts
```

### Scenario 4: Investigation of Failed Tests
```bash
# Cleanup doesn't run on test failure
# Database may have test data (for investigation)
# Reports and screenshots always preserved
```

## 🔧 API Endpoint Required

The cleanup script needs the API to expose this endpoint:

```typescript
DELETE /cleanup/test-data
```

**Response format:**
```json
{
  "deleted": {
    "users": 5,
    "groups": 2,
    "expenses": 9,
    "payments": 5
  }
}
```

If this endpoint isn't available, the script continues gracefully and only cleans temp files.

## 🎯 Best Practices

### 1. Always Preserve Evidence
✅ Reports are preserved (HTML, JSON, XML)
✅ Screenshots are preserved (all PNG files)
✅ Combined provide complete test documentation

### 2. Run After Every Test
```bash
npm run test:cucumber:feature
# Automatic cleanup included
```

### 3. Review Reports Before Cleanup
```bash
# View reports before cleanup
open cucumber-report.html
open test-screenshots/denver-trip/

# Then run tests with cleanup
npm run test:cucumber:feature
```

### 4. Archive Important Runs
```bash
# Before major changes
open cucumber-report.html
open test-screenshots/denver-trip/
# Save manually if needed before fresh test runs
```

## 📊 Performance Impact

### Cleanup Execution Time
- Database cleanup: 100-500ms (depending on data)
- Temp file cleanup: 50-100ms
- **Total: 150-600ms**
- **Total test time: 2-4 minutes + 0.15-0.6 seconds**

**Impact:** Negligible (<1% overhead)

## ✅ Verification Checklist

After running cleanup:
- [ ] No error messages displayed
- [ ] Test database appears clean
- [ ] Reports still exist (cucumber-report.html, etc.)
- [ ] Screenshots directory not deleted
- [ ] Temporary files removed

## 🎊 Summary

The cleanup script provides:
- ✅ Automatic database cleanup
- ✅ Temporary file removal
- ✅ **ALL reports preserved** (essential)
- ✅ **ALL screenshots preserved** (essential)
- ✅ Safe dry-run mode
- ✅ Detailed reporting
- ✅ Graceful error handling
- ✅ Zero configuration needed

**Result:** Clean database, preserved documentation! 📸✨

---

**Key Principle:** Reports and screenshots are never deleted because they provide essential visual evidence of test execution and are crucial for documentation, debugging, and stakeholder communication.
