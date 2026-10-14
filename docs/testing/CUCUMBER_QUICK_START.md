# Cucumber Tests - Quick Start Guide

Get up and running with Cucumber Playwright tests for the Denver trip scenario in 5 minutes.

## Step 1: Install Dependencies (One Time)

```bash
cd /Users/piyush/Development/zrugal/zbhaga
npm install --save-dev @cucumber/cucumber ts-node typescript
```

## Step 2: Start the Application

In your terminal:

```bash
npm run dev
```

Wait for both servers to be ready:
- API: `http://localhost:4000`
- Web: `http://localhost:8081`

## Step 3: Run the Denver Trip Test

In another terminal:

```bash
npm run test:cucumber:feature
```

This will:
1. ✅ Create 5 test users
2. ✅ Create a Denver Trip group
3. ✅ All users join the group
4. ✅ Add expenses over 5 days
5. ✅ Record payments
6. ✅ Verify balances
7. ✅ Clean up test data

## Step 4: View Results

After the test completes:

```bash
open cucumber-report.html
```

## What Gets Tested

```
✓ User signup (5 users)
✓ Group creation
✓ Invite code generation
✓ Group joining with invite code
✓ Adding expenses (9 expenses, 5 days)
✓ Recording payments (5 payments)
✓ Viewing group details
✓ Checking balances
✓ Test cleanup
```

## Test Timeline

Expected execution time: **2-5 minutes**

Breakdown:
- Signup: ~30 seconds
- Group creation: ~20 seconds
- Joining group: ~40 seconds
- Adding expenses: ~60 seconds
- Recording payments: ~40 seconds
- Verification: ~30 seconds
- Cleanup: ~20 seconds

## Troubleshooting

### Tests won't start
```bash
# Make sure API and Web are running
npm run dev

# In another terminal
npm run test:cucumber:feature
```

### Timeout errors
The app might be slow to respond. Tests have a 30-second timeout. If you need more time:

Edit `tests/support/world.ts` and change:
```typescript
setDefaultTimeout(60000); // 60 seconds instead of 30
```

### Port already in use
```bash
# Kill the process using port 4000 or 8081
lsof -i :4000
kill -9 <PID>
```

### Element not found errors
This usually means the app DOM structure changed. Check:
1. App is running at `http://localhost:8081`
2. Element `data-testid` attributes exist in the app
3. Browser console for errors

## Running Specific Scenarios

### Run just the main scenario
```bash
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --name "Complete Denver trip expense tracking workflow"
```

### Run just the solo trip scenario
```bash
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --name "Single user group creation and expense tracking"
```

## View Test Screenshots

Screenshots are taken during each major step:

```bash
open test-screenshots/denver-trip/
```

Files are named like:
- `login-alice-2026-10-02T14-30-45.png`
- `group-created-denver-trip-2026-2026-10-02T14-31-00.png`
- `expenses-added-bob-2026-10-02T14-31-45.png`

## Tips for Development

### Add debugging
Edit `tests/step-definitions/denver-trip.steps.ts` to add:
```typescript
console.log(`Debug info: ${someVariable}`);
```

### Slow down tests to see what's happening
Add pauses in step definitions:
```typescript
await page.waitForTimeout(2000); // 2 second pause
```

### Check network requests
Open browser DevTools while test runs:
```typescript
// Add this to pause test for inspection
await page.pause();
```

## Extending the Tests

### Add a new user to signup

Edit `tests/features/denver-trip.feature`:
```gherkin
Given I sign up the following users one by one:
  | displayName | email                    | password     |
  | George      | george.denver@test.com   | TestPass789! |
```

### Add more expenses

Edit `tests/features/denver-trip.feature`:
```gherkin
When Alice adds an expense to Denver Trip group:
  | description        | amount | date       |
  | Additional expense | 100    | 2026-10-20 |
```

### Add more payments

Edit the payments section in the feature file:
```gherkin
When Alice records a payment in Denver Trip group:
  | paidBy | paidTo | amount |
  | George | Alice  | 250    |
```

## Next Steps

After the basic test passes:

1. **Add more scenarios** - Create new `.feature` files
2. **Test different flows** - Add scenarios for edge cases
3. **Performance testing** - Add timing measurements
4. **CI/CD integration** - Set up GitHub Actions
5. **Custom reports** - Extend report generation

## Help

For full documentation:
```bash
open tests/CUCUMBER_SETUP.md
```

For Playwright issues:
```bash
npm run test:playwright:debug
```

For Cucumber issues:
```bash
npx cucumber-js --help
```

## Quick Commands Reference

```bash
# Install dependencies
npm install --save-dev @cucumber/cucumber ts-node

# Run tests
npm run test:cucumber:feature

# View reports
open cucumber-report.html

# Run with debug
npx cucumber-js tests/features/denver-trip.feature --require-module ts-node/register --debug

# Clean up reports
rm cucumber-report.* test-screenshots -rf
```

That's it! Happy testing! 🎉
