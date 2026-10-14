# Cucumber Playwright Test Suite - Denver Trip Scenario

Comprehensive BDD-style end-to-end testing for the zBhaga expense splitting application using Cucumber and Playwright.

## Overview

This test suite implements a complete Denver trip expense splitting workflow using Gherkin feature files and Playwright step definitions. The scenario covers:

1. **User Signup** - 5 users sign up with unique credentials
2. **Group Creation** - First user creates a "Denver Trip" group
3. **Generate Invite Code** - Group invite code is generated
4. **Join Group** - All other users join using the invite code
5. **Add Expenses** - First 3 users add expenses over 5 days
6. **Record Payments** - All users record random payments
7. **Verify Balances** - Final state verification with balances and payments
8. **Cleanup** - All test data is cleaned up

## File Structure

```
tests/
├── features/
│   └── denver-trip.feature          # Gherkin feature file with scenarios
├── step-definitions/
│   └── denver-trip.steps.ts         # Playwright step implementations
├── support/
│   └── world.ts                     # Cucumber world setup
├── CUCUMBER_SETUP.md                # This file
├── QUICK_START.md                   # Quick reference guide
└── ... (other test files)
```

## Installation

### 1. Install Dependencies

If you haven't already installed the Cucumber and TypeScript dependencies:

```bash
npm install --save-dev @cucumber/cucumber ts-node typescript
```

### 2. Verify Installation

Check that dependencies are installed:

```bash
npm ls @cucumber/cucumber @playwright/test ts-node
```

## Configuration

### Environment Variables (Optional)

You can customize the test environment using environment variables:

```bash
export APP_URL=http://localhost:8081
export API_URL=http://localhost:4000
```

Or set them inline when running tests:

```bash
APP_URL=http://localhost:8081 npm run test:cucumber:feature
```

### Cucumber Configuration

The `cucumber.js` file at the root contains the configuration:

- **Features location**: `tests/features/**/*.feature`
- **Step definitions**: `tests/step-definitions/**/*.ts`
- **Support files**: `tests/support/**/*.ts`
- **Report formats**: 
  - Progress bar (console)
  - HTML report (`cucumber-report.html`)
  - JSON report (`cucumber-report.json`)
  - JUnit XML (`cucumber-report.xml`)

## Running Tests

### Prerequisites

Before running tests, ensure the application and API are running:

```bash
# Terminal 1: Start the API and Web app
npm run dev

# Or start them separately
npm run dev:api    # Port 4000
npm run dev:web    # Port 8081
```

Wait for both to be ready before running tests.

### Run Denver Trip Feature

Run the complete Denver trip scenario:

```bash
npm run test:cucumber:feature
```

This will:
- Execute all scenarios in `tests/features/denver-trip.feature`
- Take screenshots during test execution
- Generate HTML report
- Display progress in terminal

### Run All Cucumber Features

Run all feature files in the project:

```bash
npm run test:cucumber
```

### Run Specific Scenario

Run only the "Complete Denver trip expense tracking workflow" scenario:

```bash
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --name "Complete Denver trip expense tracking workflow"
```

### Run with More Verbose Output

Get detailed logging during test execution:

```bash
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --format progress-bar \
  --format json:cucumber-report.json
```

## Test Data

### Users Created in Tests

The feature file creates the following test users:

| Name    | Email                    | Password     |
|---------|--------------------------|--------------|
| Alice   | alice.denver@test.com    | TestPass123! |
| Bob     | bob.denver@test.com      | TestPass123! |
| Charlie | charlie.denver@test.com  | TestPass123! |
| Diana   | diana.denver@test.com    | TestPass123! |
| Eve     | eve.denver@test.com      | TestPass123! |
| Frank   | frank.denver@test.com    | TestPass456! |

**Note:** These users are created during test setup and cleaned up after each scenario completes.

## Step Definitions Reference

### Signup Steps

```gherkin
Given I sign up the following users one by one:
  | displayName | email                  | password         |
  | Alice       | alice.denver@test.com  | TestPass123!     |
```

### Login Steps

```gherkin
When Alice logs in with email "alice.denver@test.com" and password "TestPass123!"
When I log in as "alice.denver@test.com"
```

### Group Steps

```gherkin
When Alice creates a new group named "Denver Trip 2026"
When Alice views the group invite code
Then the invite code should be displayed
When Bob joins the group using the invite code
Then Bob should be in the Denver Trip group
```

### Expense Steps

```gherkin
When Alice adds an expense to Denver Trip group:
  | description | amount | date       |
  | Day 1 - Hotel       | 300    | 2026-10-15 |
  | Day 1 - Breakfast   | 45     | 2026-10-15 |
```

### Payment Steps

```gherkin
When Alice records a payment in Denver Trip group:
  | paidBy | paidTo | amount |
  | Bob    | Alice  | 200    |
```

### Verification Steps

```gherkin
Then Alice should see the group "Denver Trip 2026" with all expenses listed
And Alice should see the group balances tab
And the expenses tab should show at least 9 total expenses
And the payments tab should show at least 5 recorded payments
```

### Cleanup

```gherkin
Then cleanup all test data for the trip
```

## Screenshots

Screenshots are automatically taken during test execution and saved to:

```
test-screenshots/denver-trip/
```

Each screenshot is named with:
- Action description (login, group-created, expenses-added, etc.)
- Timestamp for uniqueness

Example: `login-alice-2026-10-02T14-30-45.123Z.png`

## Reports

### HTML Report

After test execution, view the HTML report:

```bash
open cucumber-report.html
```

Or use the npm script:

```bash
npm run test:cucumber:feature && open cucumber-report.html
```

### JSON Report

The JSON report is saved to `cucumber-report.json` and can be used for:
- CI/CD integration
- Custom reporting
- Dashboard aggregation

## Troubleshooting

### Common Issues

#### 1. **Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:** Kill existing processes or wait for them to be ready:

```bash
lsof -i :4000  # Find process using port 4000
kill -9 <PID>  # Kill the process
```

#### 2. **Timeout Errors**

```
Error: Timeout of 30000ms exceeded
```

**Solution:** Increase timeout in `tests/support/world.ts`:

```typescript
setDefaultTimeout(60000); // 60 seconds
```

#### 3. **Element Not Found**

```
Error: locator.click: Target page, context or browser has been closed
```

**Solution:** Ensure the app is running and element selectors are correct.

#### 4. **Database Issues**

```
Error: Database error during user creation
```

**Solution:** Reset the database:

```bash
npm run setup  # Pushes schema and seeds data
```

## Extending Tests

### Add New Scenarios

Add new scenarios to `tests/features/denver-trip.feature`:

```gherkin
Scenario: New scenario name
  Given I sign up the following users...
  When Alice logs in...
  Then Alice should see...
```

### Add New Step Definitions

Add new steps to `tests/step-definitions/denver-trip.steps.ts`:

```typescript
When('Alice does something', async (displayName: string) => {
  const page = context.pages.get(email);
  // Implementation
});
```

### Add Test Data Helpers

Create new helper functions in the step definitions file:

```typescript
async function setupTestData(): Promise<void> {
  // Setup code
}
```

## Best Practices

1. **Always wait for navigation**: Use `page.waitForURL()` after actions that navigate
2. **Use test IDs**: Ensure app has `data-testid` attributes for reliable element selection
3. **Take screenshots at key points**: Helps debug failures
4. **Clean up after tests**: Always run cleanup steps
5. **Use meaningful assertions**: Make test failures clear
6. **Parallel execution**: For faster runs with multiple browsers/processes

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Cucumber Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install-all
      - run: npm run setup
      - run: npm run dev &
      - run: sleep 10  # Wait for servers to start
      - run: npm run test:cucumber:feature
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: cucumber-reports
          path: cucumber-report.*
```

## Performance Tips

1. **Reduce screenshot frequency**: Comment out screenshots in production runs
2. **Use headless mode**: Default for fastest execution
3. **Parallel test runs**: Run multiple feature files simultaneously
4. **Database cleanup**: Use API calls instead of UI for cleanup

## Additional Resources

- [Cucumber.js Documentation](https://github.com/cucumber/cucumber-js)
- [Playwright Documentation](https://playwright.dev)
- [Gherkin Syntax Guide](https://cucumber.io/docs/gherkin/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review test output and screenshots
3. Check Cucumber reports (`cucumber-report.html`)
4. Review Playwright reports (`playwright-report/`)
