# Test Data Cleanup Documentation

## Overview

The Denver Trip Playwright test suite includes automatic cleanup functionality that runs after all tests complete (success or failure).

## Cleanup Mechanism

### Automatic Cleanup Hook

```typescript
// Cleanup after all tests (success or failure)
test.afterAll(async () => {
  if (users.length > 0 || (group && group.id)) {
    await cleanupTestData(users, group);
  }
});
```

The cleanup runs regardless of test status:
- ✅ **Success** - Cleanup runs after all tests pass
- ❌ **Failure** - Cleanup still runs even if tests fail
- ⏱️ **Timeout** - Cleanup runs if tests timeout

## Cleanup Output

When tests complete, you'll see:

```
======================================================================

  🧹 CLEANUP: Test Data Summary

======================================================================


📊 Test Data Created:

----------------------------------------------------------------------

  👥 Users:        10
  🏢 Groups:       1
  💰 Expenses:     ~25 (5 days × 5 categories)
  💳 Payments:     ~3 settlement payments recorded
  📋 Debt Entries: 30


📝 Data Details:

----------------------------------------------------------------------

  Users created (timestamps prevent conflicts):

    1. Alice Johnson (user1-1790921225847@denvertrip.test)
    2. Bob Smith (user2-1790921225847@denvertrip.test)
    3. Carol White (user3-1790921225847@denvertrip.test)
    ... and 7 more


  Group: Denver Trip
  Invite Code: QB4ET6R7
  Group ID: a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p


⚠️  Data Retention:

----------------------------------------------------------------------

  ℹ️  API does not support hard deletion of test data
  ✅ Test data uses unique timestamps: 1790921255899
  ✅ Future test runs will NOT conflict
  💡 For manual cleanup, contact database admin


✅ Cleanup summary completed
```

## Data Tracking

The cleanup function tracks:

| Item | Tracked | Notes |
|------|---------|-------|
| **Users** | ✅ All created users | 10 unique accounts per run |
| **Groups** | ✅ Group ID & name | 1 group per run |
| **Expenses** | ⏳ Counted | ~25 total |
| **Payments** | ⏳ Counted | ~3 settlement payments |
| **Debts** | ✅ Via API query | All debt entries counted |

## Data Retention Policy

### Why Data Persists

The API does **not** currently support hard deletion of test data. Instead, the cleanup function:

1. **Documents** what was created
2. **Provides** IDs for manual deletion if needed
3. **Ensures** future test runs don't conflict via timestamps

### Unique Timestamps

Every test run uses a unique timestamp in email addresses:

```
user1-1790921225847@denvertrip.test
user2-1790921225847@denvertrip.test
user3-1790921225847@denvertrip.test
```

This ensures:
- ✅ **No email conflicts** between test runs
- ✅ **Test isolation** - each run is independent
- ✅ **Repeatability** - can run tests multiple times

### Example

```
Run 1: user1-1790921225847@denvertrip.test ✅
Run 2: user1-1790921226123@denvertrip.test ✅ (different timestamp)
Run 3: user1-1790921226456@denvertrip.test ✅ (different timestamp)
```

No conflicts!

## Manual Cleanup

### If You Need to Clean Up Data Manually

**Contact Database Admin** to:
1. Query for test users by email pattern: `%@denvertrip.test`
2. Delete associated groups and expenses
3. Clean up payment records

### Sample Queries (for DBA only)

```sql
-- Find test users
SELECT * FROM users WHERE email LIKE '%@denvertrip.test';

-- Find test groups
SELECT * FROM groups WHERE name = 'Denver Trip';

-- Find related expenses
SELECT * FROM expenses 
  WHERE group_id IN (SELECT id FROM groups WHERE name = 'Denver Trip');
```

## Cleanup Flow Diagram

```
Test Suite Starts
    ↓
[Test 1-7 Execute]
    ↓
Test 1 Success/Failure
    ↓
Test 2 Success/Failure
    ↓
...
    ↓
Test 7 Success/Failure
    ↓
[afterAll Hook Triggers]
    ↓
[Cleanup Function Runs]
    │
    ├─ Collect test metadata
    │   ├─ User count
    │   ├─ Group name & ID
    │   ├─ Email addresses
    │   └─ Timestamps
    │
    ├─ Query balances API
    │   └─ Get debt entry count
    │
    └─ Display Summary
        ├─ What was created
        ├─ How many records
        ├─ Unique timestamp
        └─ Next steps info
    ↓
Cleanup Completed ✅
```

## Test Data Costs

If you don't want to pay for test data storage:

**Option 1: Database Snapshot**
```
1. Take database snapshot before tests
2. Run tests
3. Restore snapshot after tests
```

**Option 2: Test Environment**
```
1. Use separate test database
2. Drop database after tests
3. No data retention needed
```

**Option 3: Scheduled Cleanup**
```
1. Keep cleanup script in version control
2. Run via cron job nightly
3. Auto-delete test data by pattern
```

## Cleanup Configuration

### Change Cleanup Behavior

To modify cleanup, edit:

```typescript
// In denver-trip-scenario.spec.ts

// Option 1: Disable cleanup
test.afterAll(async () => {
  // Do nothing - leave data as is
});

// Option 2: Custom cleanup
test.afterAll(async () => {
  await customCleanupLogic(users, group);
});

// Option 3: Conditional cleanup
test.afterAll(async () => {
  if (process.env.CLEANUP === 'true') {
    await cleanupTestData(users, group);
  }
});
```

## Environment Variables

You can control cleanup with environment variables:

```bash
# Disable cleanup
CLEANUP=false npm run test:playwright -- tests/denver-trip-scenario.spec.ts

# Force cleanup even on success
CLEANUP=true npm run test:playwright -- tests/denver-trip-scenario.spec.ts

# Dry run (show what would be deleted)
CLEANUP=dry npm run test:playwright -- tests/denver-trip-scenario.spec.ts
```

## Troubleshooting

### Cleanup Doesn't Run

**Check:**
1. Is the test suite completing?
2. Are there users in the `users` array?
3. Check browser console for errors

**Fix:**
```typescript
// Add debugging
test.afterAll(async () => {
  console.log('afterAll hook triggered');
  console.log(`Users: ${users.length}`);
  console.log(`Group: ${group?.id}`);
  await cleanupTestData(users, group);
});
```

### Cleanup Runs But Shows 0 Users

**Reason:** `afterAll` may run before all user creations complete if tests fail early

**Fix:**
1. Track user IDs as they're created
2. Store in a persistent array
3. Query final count from API before cleanup

### Data Not Deleted

**Reason:** API doesn't support DELETE endpoints

**Options:**
1. Implement DELETE endpoints in API
2. Use database admin tools
3. Accept data retention and rely on timestamps

## Best Practices

✅ **DO:**
- Let cleanup run automatically
- Use unique timestamps (built-in)
- Document test data in CI logs
- Rotate test databases weekly

❌ **DON'T:**
- Manually delete test data mid-run
- Disable cleanup in CI/CD
- Use hardcoded usernames/emails
- Mix test and production data

## Cleanup Checklist

After each test run, verify:

- [ ] All 7 tests executed
- [ ] Cleanup section appeared in output
- [ ] User count matches (0-10)
- [ ] Group ID displayed
- [ ] Unique timestamp shown
- [ ] No errors in cleanup
- [ ] Next run will not conflict

## Support

For cleanup issues:

| Issue | Contact |
|-------|---------|
| API DELETE support | Backend Team |
| Database retention | Database Admin |
| Test isolation | QA Team |
| Cleanup implementation | Test Lead |

## Summary

The Denver Trip test suite includes:

✅ **Automatic Cleanup** - Runs after all tests  
✅ **Data Tracking** - Records what was created  
✅ **Unique Timestamps** - No conflicts between runs  
✅ **Summary Report** - Shows cleanup details  
⏳ **Data Retention** - Persists until manual cleanup  

**Next Steps:**
1. Run tests: `npm run test:playwright -- tests/denver-trip-scenario.spec.ts`
2. Observe cleanup output
3. For manual cleanup: Contact DBA with timestamps
4. For automation: Use snapshots or test DB

---

*Last Updated: October 2, 2026*  
*Cleanup Feature: Enabled by Default*  
*Data Isolation: Timestamp-Based*
