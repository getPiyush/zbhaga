# Denver Trip Test - Quick Start Guide

## What This Test Does

This comprehensive Playwright test suite simulates a complete group trip expense scenario with:
- ✅ 10 users
- ✅ 1 group ("Denver Trip")
- ✅ 25 expenses over 5 days
- ✅ 4 random payers
- ✅ Settlement calculations
- ✅ Payment recording
- ✅ Web UI verification

## Quick Run

```bash
# Run the test
npm run test:playwright -- tests/denver-trip-scenario.spec.ts

# Run with browser visible
npm run test:playwright -- tests/denver-trip-scenario.spec.ts --headed

# View test report
npm run test:playwright:report
```

## Test Breakdown

### Test 1: SETUP (30 sec)
- Creates 10 unique users
- Creates "Denver Trip" group
- Adds all users to group

### Test 2: SCENARIO (60 sec)
- Adds 25 expenses randomly
- 5 categories × 5 days
- 4 random payers
- Amount variance ±20%

### Test 3: SETTLEMENT (5 sec)
- Calculates all balances
- Generates payment suggestions
- Shows who owes/gets money

### Test 4: PAYMENT (10 sec)
- Records 3+ settlement payments
- Updates balances
- Shows payment history

### Test 5: UI (10 sec)
- Signs into web app
- Navigates to group
- Verifies content displays

### Test 6: SUMMARY (5 sec)
- Generates trip statistics
- Shows totals and averages
- Lists all settlements

### Test 7: VALIDATION (5 sec)
- Verifies data integrity
- Checks balance conservation
- Validates all metrics

## Example Output

```
✅ Successfully created 10 users
✅ Group created with invite code: W7MJ82Q7
✅ All 10 users added to group

✅ Successfully added 25 expenses

💰 Group Balances:
  Alice Johnson: GETS $1108.51
  David Brown: GETS $1614.57
  Emma Davis: OWES $534.64

🔄 Suggested Settlements (9 payments needed):
  Emma Davis → Alice Johnson: $534.64
```

## Expected Results

- ✅ **All 7 tests PASS**
- ✅ Total trip expenses: ~$5,250
- ✅ Per person average: ~$525
- ✅ Settlement payments: 9-10
- ✅ All balances verified

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rate limit error | Delays added automatically |
| User conflict | Timestamps make emails unique |
| API not running | Start with `npm run dev:api` |
| Web server missing | Start with `npm run dev:web` |

## Files Included

1. **denver-trip-scenario.spec.ts** - Main test file (520 lines)
2. **DENVER_TRIP_README.md** - Full documentation
3. **QUICK_START.md** - This file
4. **DENVER_TRIP_TEST_SUMMARY.md** - Detailed summary

## Key Features

✨ **Realistic Data** - Random payers, amount variance, multi-day itinerary  
✨ **Full API Testing** - User creation, groups, expenses, payments, balances  
✨ **UI Integration** - Web app sign-in and navigation  
✨ **Data Validation** - Balance conservation, integrity checks  
✨ **Detailed Logging** - Emoji indicators for easy reading  

## Performance

- ⏱️ ~5 minutes total (serial execution)
- ⏱️ 30 sec setup
- ⏱️ 60 sec expenses
- ⏱️ 2 min+ balances/payments
- ⏱️ 30 sec UI/summary/validation

## Success Criteria

All tests pass with:
- ✅ 10 users created
- ✅ 25 expenses recorded
- ✅ Balances calculated
- ✅ Payments recorded
- ✅ UI verified
- ✅ Data validated
