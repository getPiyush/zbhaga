# Denver Trip Scenario - Comprehensive E2E Test Suite

## Overview

This test suite (`denver-trip-scenario.spec.ts`) provides a complete end-to-end workflow for testing the zBhaga expense splitting application with a realistic group trip scenario.

## Test Scenario

**Trip Details:**
- **Group:** Denver Trip
- **Participants:** 10 users
- **Duration:** 5 days
- **Payers:** 4 members paying for group expenses
- **Total Expenses:** 25 expense entries (5 categories × 5 days)

## Expense Categories

1. **Car Rental** - $450 (±20%)
2. **Airbnb** - $500 (±20%)
3. **Lunch** - $30 (±20%)
4. **Dinner** - $50 (±20%)
5. **Park Ticket** - $20 (±20%)

## Test Cases

### 1. **SETUP: Create 10 users and Denver Trip group**
**What it tests:**
- User creation via API
- Group creation
- Group member invitation
- Invite code functionality

**Expected Results:**
- 10 unique users created with unique emails
- 1 group created with invite code
- All 10 users added to group

### 2. **SCENARIO: Add expenses over 5-day trip with 4 random payers**
**What it tests:**
- Expense creation with split distribution
- Random payer selection from 4 members
- Amount variance (realistic spending)
- Multi-day expense tracking

**Expected Results:**
- 25 total expenses created
- Each expense split equally among 10 members
- Random payer distribution
- Proper amount calculations

### 3. **SETTLEMENT: View and validate settlement suggestions**
**What it tests:**
- Balance calculation accuracy
- Settlement suggestion algorithm
- Debt consolidation logic
- Financial data integrity

**Expected Results:**
- All 10 users have calculated balances
- Net balance calculations correct
- Settlement suggestions generated (minimized payment chain)
- Currency displayed as USD

### 4. **PAYMENT: Record payments following settlement suggestions**
**What it tests:**
- Payment recording API
- Balance updates after payment
- Payment method tracking
- Transaction logging

**Expected Results:**
- At least 3 payments successfully recorded
- Updated balances reflect payments
- Payment entries properly logged
- Balances decrease after settlement

### 5. **UI: View group details and balances in web app**
**What it tests:**
- Web application UI rendering
- Group navigation
- Tab/section visibility (expenses, payments, balances)
- User authentication in web app

**Expected Results:**
- User can sign in
- Group "Denver Trip" visible
- Group detail page loads
- Expense, payment, and balance sections display

### 6. **SUMMARY: Generate trip summary report**
**What it tests:**
- Statistical calculations
- Report generation
- Data aggregation
- Financial summary accuracy

**Expected Results:**
- Total trip expenses calculated
- Per-person averages computed
- Settlement payments counted
- All metrics display correctly

### 7. **VALIDATION: Verify data integrity and balances**
**What it tests:**
- Conservation of money (sum of balances = 0)
- User representation in balances
- Settlement suggestion validity
- Currency consistency

**Expected Results:**
- All users represented in balances
- Balance sum equals zero (±1 cent for rounding)
- No self-payments in suggestions
- All amounts positive in suggestions

## Running the Tests

### Run all Denver Trip tests:
```bash
npm run test:playwright -- tests/denver-trip-scenario.spec.ts
```

### Run with UI (headed mode):
```bash
npm run test:playwright -- tests/denver-trip-scenario.spec.ts --headed
```

### Run with debug mode:
```bash
npm run test:playwright -- tests/denver-trip-scenario.spec.ts --debug
```

### View test report:
```bash
npm run test:playwright:report
```

## Test Execution Flow

The tests run **sequentially** (serial mode) to maintain state:

```
1. SETUP (creates users/group)
   ↓
2. SCENARIO (adds expenses)
   ↓
3. SETTLEMENT (calculates balances)
   ↓
4. PAYMENT (records payments)
   ↓
5. UI (verifies web app)
   ↓
6. SUMMARY (generates report)
   ↓
7. VALIDATION (checks integrity)
```

## Key Features

✅ **Realistic Data**
- Random payer selection
- Amount variance (±20%)
- 5-day itinerary
- Multiple expense categories

✅ **API Testing**
- Direct API calls to backend
- User and group management
- Expense creation
- Payment recording
- Balance queries

✅ **UI Integration**
- Web app sign-in
- Navigation testing
- Page content verification
- Section visibility checks

✅ **Data Validation**
- Balance conservation (sum = 0)
- User representation
- Settlement validity
- Currency consistency

✅ **Comprehensive Logging**
- Color-coded emoji indicators
- Detailed operation tracking
- Financial calculations shown
- Test progress visibility

## Expected Data Output

### Users Created
```
Alice Johnson (user1@denvertrip.test)
Bob Smith (user2@denvertrip.test)
Carol White (user3@denvertrip.test)
David Brown (user4@denvertrip.test)
Emma Davis (user5@denvertrip.test)
Frank Miller (user6@denvertrip.test)
Grace Lee (user7@denvertrip.test)
Henry Wilson (user8@denvertrip.test)
Iris Taylor (user9@denvertrip.test)
Jack Anderson (user10@denvertrip.test)
```

### Sample Balance Calculation
```
Alice Johnson: GETS $1108.51
Bob Smith: GETS $395.19
Carol White: GETS $89.13
David Brown: GETS $1614.57
Emma Davis: OWES $534.64
Frank Miller: OWES $534.60
Grace Lee: OWES $534.57
Henry Wilson: OWES $534.56
Iris Taylor: OWES $534.53
Jack Anderson: OWES $534.50
```

### Settlement Example
```
Emma Davis → Alice Johnson: $534.64
Frank Miller → David Brown: $534.60
Grace Lee → David Brown: $534.57
Henry Wilson → David Brown: $534.56
Iris Taylor → David Brown: $534.53
Jack Anderson → David Brown: $534.50
```

## Validation Checks

1. **All users represented** - Each user has a balance entry
2. **Balance conservation** - Sum of all balances = 0 (money is conserved)
3. **Valid settlements** - No self-payments, positive amounts
4. **Currency consistency** - All amounts in USD

## Troubleshooting

### Test Failures

**"Users not created"**
- Make sure SETUP test runs first
- Tests must run sequentially (serial mode enabled)
- Check API is running (port 4000)

**"Failed to create group"**
- User authentication may have failed
- Check API token is valid
- Verify user was created successfully

**"Failed to join group"**
- Invite code may be invalid
- Group owner may not exist
- Check network connectivity

**"Balance sum not zero"**
- Rounding error expected (±1 cent)
- Check expense calculations
- Verify all payments recorded

## Performance Notes

- Full test suite takes ~3-5 minutes to complete
- Depends on API and web server performance
- Network delays may affect timing
- Each test operation logs its duration

## Architecture

The test suite uses:
- **Playwright** for browser automation
- **Direct API calls** for data operations
- **TypeScript** for type safety
- **Fetch API** for HTTP requests
- **Serial execution** for state management

## Dependencies

- @playwright/test ^1.63.0
- Node.js ^20
- Running API server (port 4000)
- Running Web server (port 8081)

## Future Enhancements

- [ ] Test concurrent user payments
- [ ] Test expense editing and deletion
- [ ] Test expense categorization filters
- [ ] Test group member removal
- [ ] Test invitation code expiration
- [ ] Test partial payment recording
- [ ] Test settlement with rounding
- [ ] Test large group scenarios (50+ users)
