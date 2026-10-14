# Complete Testing Guide for zBhaga Cucumber Tests

This guide explains the full testing architecture, how to run tests, and how to extend the test suite.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing New Tests](#writing-new-tests)
6. [Debugging Tests](#debugging-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)

## Architecture Overview

### Test Pyramid

```
        UI Tests (Cucumber/Playwright)
         /                    \
    Integration Tests        E2E Tests
       /                        \
    API Tests              User Workflows
   /                          \
Domain Logic                System Behavior
```

Our Cucumber tests sit at the top as comprehensive E2E tests that validate complete user workflows.

### Component Architecture

```
Feature Files (.feature)
        ↓
Gherkin Parser
        ↓
Step Definitions (.ts)
        ↓
Playwright Browser Automation
        ↓
Test Data Management
        ↓
API Integration
```

### File Organization

```
tests/
├── features/                    # Gherkin feature files
│   └── denver-trip.feature     # Main scenario
├── step-definitions/           # Step implementations
│   └── denver-trip.steps.ts   # All step definitions
├── support/                    # Support code
│   ├── world.ts               # Cucumber World
│   └── helpers.ts             # 30+ helper functions
├── data/                       # Test data
│   └── denver-trip-data.ts    # Constants and data
├── screenshots/               # Auto-generated
│   └── denver-trip/           # Test screenshots
├── CUCUMBER_SETUP.md          # Full documentation
├── CUCUMBER_QUICK_START.md    # Quick reference
└── TESTING_GUIDE.md           # This file
```

## Quick Start

### 1. Prerequisites

```bash
# Node.js 20+
node --version

# Verify dependencies installed
npm ls @cucumber/cucumber @playwright/test
```

### 2. Start Application

```bash
npm run dev
```

Wait for:
- API ready at `http://localhost:4000`
- Web ready at `http://localhost:8081`

### 3. Run Tests

```bash
npm run test:cucumber:feature
```

### 4. View Results

```bash
open cucumber-report.html
open test-screenshots/denver-trip/
```

## Running Tests

### Commands Reference

```bash
# Run Denver trip feature (recommended)
npm run test:cucumber:feature

# Run all Cucumber features
npm run test:cucumber

# Run specific scenario
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --name "Complete Denver trip expense tracking workflow"

# Run with dry-run (parse only)
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --dry-run

# Run with verbose output
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --format progress-bar \
  --publish

# Run and fail fast on first error
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --fail-fast
```

### Environment Variables

```bash
# Override server URLs
APP_URL=http://localhost:3000 npm run test:cucumber:feature
API_URL=http://example.com/api npm run test:cucumber:feature

# Enable debugging
DEBUG=* npm run test:cucumber:feature

# Headed browser (see actions)
HEADLESS=false npm run test:cucumber:feature

# Slowdown for observation
SLOW_MO=1000 npm run test:cucumber:feature
```

## Test Structure

### Feature File Structure

```gherkin
Feature: <Feature Name>
  <Context and business value>

  Background:
    Given <Setup that runs before each scenario>

  Scenario: <Scenario name>
    Given <Initial state>
    When <Action>
    Then <Expected outcome>
```

### Step Definition Structure

```typescript
// Signup step
Given('I sign up the following users one by one:', async (dataTable) => {
  const rows = dataTable.hashes();
  for (const row of rows) {
    // Signup logic
  }
});

// Login step  
When('{string} logs in with email {string}', async (name, email, password) => {
  // Login logic
});

// Verification step
Then('the invite code should be displayed', async () => {
  // Assertion logic
});
```

### Data Flow in Tests

```
Feature File (Gherkin)
    ↓
Step Definition (finds matching step)
    ↓
Page Object / Helper Functions
    ↓
Playwright APIs
    ↓
Browser Actions
    ↓
API Calls / UI Interactions
    ↓
Assertions
    ↓
Screenshots
```

## Writing New Tests

### Adding a New Scenario

1. **Add to feature file** (`tests/features/denver-trip.feature`):

```gherkin
Scenario: New expense-sharing workflow
  Given I sign up the following users one by one:
    | displayName | email            | password  |
    | Tom         | tom@test.com     | Pass123!  |
  
  When Tom logs in with email "tom@test.com" and password "Pass123!"
  And Tom creates a new group named "New Group"
  
  Then Tom should see the group "New Group" in the groups list
```

2. **Implement steps** (if new steps needed):

```typescript
// Add to denver-trip.steps.ts
When('{string} creates a new group named {string}', async (name, groupName) => {
  const email = // find email for user
  const page = context.pages.get(email);
  
  await page.click('[data-testid="create-group-button"]');
  await page.fill('[data-testid="group-name-input"]', groupName);
  await page.click('[data-testid="create-group-submit"]');
  
  await takeScreenshot(page, `group-${groupName}`);
});
```

### Adding a New Feature File

1. **Create feature file** (`tests/features/my-feature.feature`):

```gherkin
Feature: My new feature
  Background:
    Given the app is running at "http://localhost:8081"
    And the API is available at "http://localhost:4000"

  Scenario: My scenario
    # Steps here
```

2. **Implement steps**:

```typescript
// Create tests/step-definitions/my-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('my step', async () => {
  // Implementation
});
```

3. **Run new feature**:

```bash
npx cucumber-js tests/features/my-feature.feature \
  --require-module ts-node/register
```

### Using Test Data

Import from `tests/data/denver-trip-data.ts`:

```typescript
import { 
  DENVER_TRIP_USERS, 
  DENVER_TRIP_EXPENSES,
  DOM_SELECTORS 
} from '../data/denver-trip-data';

// Use constants
for (const user of DENVER_TRIP_USERS) {
  // signup user
}

// Use DOM selectors
await page.click(DOM_SELECTORS.createGroupButton);
```

### Using Helper Functions

```typescript
import { 
  apiCall, 
  takeScreenshot, 
  waitForElement,
  fillField,
  retry 
} from '../support/helpers';

// Make API call
const response = await apiCall({
  method: 'POST',
  endpoint: '/groups',
  body: { name: 'New Group' },
  token: userToken,
  baseUrl: apiUrl
});

// Take screenshot
await takeScreenshot(page, screenshotDir, 'my-step');

// Wait for element
await waitForElement(page, '[data-testid="element"]', 5000);

// Fill field
await fillField(page, '[data-testid="input"]', 'value');

// Retry operation
await retry(
  () => apiCall({ /* ... */ }),
  3, // max attempts
  1000 // delay ms
);
```

## Debugging Tests

### 1. Headed Mode (See Browser)

```bash
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --publish \
  --dry-run false
```

Or modify `denver-trip.steps.ts`:

```typescript
Before(async () => {
  context.browser = await chromium.launch({ 
    headless: false  // Show browser
  });
});
```

### 2. Add Screenshots at Specific Point

```typescript
When('Alice does something', async () => {
  const page = context.pages.get('alice@test.com');
  
  // Do action
  await page.click('[data-testid="button"]');
  
  // Take screenshot for debugging
  await takeScreenshot(page, context.screenshotDir, 'debug-point');
});
```

### 3. Pause Test for Inspection

```typescript
// Add to any step to pause execution
await page.pause(); // Opens inspector, press enter to continue
```

### 4. Print Debug Information

```typescript
When('Alice logs in', async () => {
  console.log('Available users:', Array.from(context.users.keys()));
  console.log('Page URL:', page.url());
  console.log('Current time:', new Date().toISOString());
});
```

### 5. Check Element Existence

```typescript
const element = await page.$('[data-testid="element"]');
if (!element) {
  console.error('Element not found. Current page text:');
  const text = await page.textContent('body');
  console.log(text);
  throw new Error('Critical element missing');
}
```

### 6. View Detailed Reports

```bash
# View HTML report with details
open cucumber-report.html

# View Playwright report  
npx playwright show-report

# View JSON report
cat cucumber-report.json | jq '.'

# Check screenshots
ls -lah test-screenshots/denver-trip/
```

### 7. Increase Timeout for Slow Operations

Edit `tests/support/world.ts`:

```typescript
setDefaultTimeout(60000); // 60 seconds instead of 30
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Cucumber E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install-all
      
      - name: Setup database
        run: npm run setup
      
      - name: Start servers
        run: |
          npm run dev:api &
          npm run dev:web &
          sleep 10  # Wait for servers
      
      - name: Run Cucumber tests
        run: npm run test:cucumber:feature
        continue-on-error: true
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: |
            cucumber-report.*
            test-screenshots/
            playwright-report/
      
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-screenshots/denver-trip/
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any
  
  stages {
    stage('Install') {
      steps {
        sh 'npm install-all'
      }
    }
    
    stage('Setup') {
      steps {
        sh 'npm run setup'
      }
    }
    
    stage('Start Servers') {
      steps {
        sh 'npm run dev:api &'
        sh 'npm run dev:web &'
        sh 'sleep 10'
      }
    }
    
    stage('Run Tests') {
      steps {
        sh 'npm run test:cucumber:feature'
      }
      post {
        always {
          publishHTML([
            reportDir: '.',
            reportFiles: 'cucumber-report.html',
            reportName: 'Cucumber Report'
          ])
          
          archiveArtifacts artifacts: 'test-screenshots/denver-trip/**'
        }
      }
    }
  }
}
```

### GitLab CI

```yaml
stages:
  - test

e2e_tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  
  script:
    - npm install-all
    - npm run setup
    - npm run dev:api &
    - npm run dev:web &
    - sleep 10
    - npm run test:cucumber:feature
  
  artifacts:
    when: always
    paths:
      - cucumber-report.*
      - test-screenshots/
    expire_in: 1 week
```

## Best Practices

### 1. Test Isolation

Each scenario should:
- Create its own test data
- Clean up after itself
- Not depend on other scenarios

```gherkin
Scenario: My scenario
  Given I sign up users
  # ... test steps ...
  Then cleanup all test data for the trip
```

### 2. Meaningful Assertions

```typescript
// ✅ Good - specific assertion
expect(userCount).toBe(5);
expect(expenseDescription).toContain('Hotel');

// ❌ Bad - vague assertion
expect(element).toBeTruthy();
expect(page).toBeDefined();
```

### 3. Wait Properly

```typescript
// ✅ Good - explicit waits
await page.waitForURL('**/group/**', { timeout: 10000 });
await page.waitForLoadState('networkidle');
await page.locator('[data-testid="element"]').waitFor();

// ❌ Bad - arbitrary sleeps
await page.waitForTimeout(5000); // Hidden race conditions
```

### 4. Use Test IDs

Prefer `data-testid` over brittle selectors:

```typescript
// ✅ Good
await page.click('[data-testid="create-group-button"]');

// ❌ Bad
await page.click('.btn.btn-primary.mt-2');
await page.click('button:has-text("Create")');
```

### 5. Error Handling

```typescript
// ✅ Good - handle errors gracefully
try {
  await apiCall({ /* ... */ });
} catch (error) {
  await takeErrorScreenshot(page, screenshotDir, 'api-error');
  throw new Error(`API call failed: ${error.message}`);
}

// ❌ Bad - silent failures
try {
  await apiCall({ /* ... */ });
} catch (error) {
  console.log('Error occurred'); // Not helpful
}
```

### 6. DRY Principle

```typescript
// ✅ Use helpers
await fillField(page, selector, value);
await clickAndWait(page, button, urlPattern);

// ❌ Repeat code
await page.fill(selector, value);
await page.click(button);
await page.waitForURL(urlPattern);
```

### 7. Clear Test Names

```gherkin
# ✅ Clear and specific
Scenario: User can add multiple expenses in a group

# ❌ Vague
Scenario: Test expense feature
Scenario: Add expense
```

### 8. Document Complex Steps

```typescript
// Complex step - add documentation
When('{string} adds expenses with split method', async (name, dataTable) => {
  // Split method can be 'equal' or 'manual'
  // This step handles both cases dynamically
  const rows = dataTable.hashes();
  
  for (const expense of rows) {
    // Add expense implementation
  }
});
```

## Performance Optimization

### Parallel Test Execution

```bash
# Run multiple features in parallel (requires separate config)
npx cucumber-js --parallel 4
```

### Screenshot Optimization

```typescript
// Only take screenshots on failure
if (testFailed) {
  await takeScreenshot(page, screenshotDir, 'failure');
}
```

### Database Optimization

Use API for cleanup instead of UI:

```typescript
// ✅ Fast - API call
await apiCall({
  method: 'DELETE',
  endpoint: `/groups/${groupId}`,
  token
});

// ❌ Slow - UI interaction
await page.click('[data-testid="group-settings"]');
await page.click('[data-testid="delete-group"]');
await page.click('[data-testid="confirm-delete"]');
```

## Maintenance

### Updating Test Data

1. Edit `tests/data/denver-trip-data.ts`
2. Update feature file if needed
3. Update step definitions if logic changed
4. Run tests to verify

### Handling App Changes

If app structure changes:

1. Update `data-testid` selectors in `DOM_SELECTORS`
2. Update step implementations in `denver-trip.steps.ts`
3. Test single scenario to verify
4. Update other tests as needed

### Regular Cleanup

```bash
# Clean old screenshots
rm -rf test-screenshots/denver-trip/*

# Clean reports
rm cucumber-report.* cucumber-report/

# Clean npm cache (if issues)
npm cache clean --force
```

## Troubleshooting Matrix

| Issue | Cause | Solution |
|-------|-------|----------|
| Timeout | Slow app/network | Increase timeout in world.ts |
| Element not found | Changed selector | Update DOM_SELECTORS |
| API error | Invalid request | Check API endpoint and body |
| Port in use | Process still running | Kill with `lsof -i :PORT` |
| Database issue | Data corruption | Run `npm run setup` |
| Screenshot failure | Permission denied | Check directory permissions |

## Resources

- [Cucumber.js Docs](https://github.com/cucumber/cucumber-js)
- [Playwright Docs](https://playwright.dev)
- [Gherkin Guide](https://cucumber.io/docs/gherkin/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)

## Support

For help:
1. Check troubleshooting section
2. Review test reports and screenshots
3. Check test logs: `cucumber-report.html`
4. Increase verbosity: `--format progress-bar`
5. Add debug logging to steps

---

**Last Updated**: October 2, 2026
**Framework**: Cucumber 10.0.0 + Playwright 1.63.0
**Language**: TypeScript 5.3.3
