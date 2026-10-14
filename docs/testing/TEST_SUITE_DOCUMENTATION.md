# zBhaga Playwright Test Suite Documentation

## Overview

This document provides comprehensive documentation for the zBhaga Playwright test suite, covering all test files, scenarios, and how to run and maintain the tests.

## Test Files

### 1. **complete-e2e.spec.ts** - Core End-to-End Tests
**Purpose**: Comprehensive E2E testing covering all major user flows and features.

**Test Suites**:
- **Authentication Flows (AT-1 to AT-6)**: Sign in/up, session management, sign out
- **Group Management Flows (GM-1 to GM-7)**: Create, join, view groups
- **Expense Management Flows (EM-1 to EM-6)**: Add, view, track expenses
- **Payment & Settlement Flows (PS-1 to PS-6)**: Record payments, view balances
- **Error Handling & Edge Cases (EH-1 to EH-7)**: Network errors, rendering issues
- **User Profile & Settings (UP-1 to UP-3)**: Profile display, sign out
- **Full Integration Scenarios (INT-1 to INT-5)**: Complete user journeys
- **Performance & UX (PERF-1 to PERF-3)**: Load times, responsiveness

**Total Tests**: 50+

**Running**:
```bash
npx playwright test tests/complete-e2e.spec.ts
```

### 2. **user-scenarios.spec.ts** - Real-World User Scenarios
**Purpose**: Test application from perspective of different user personas and workflows.

**Test Suites**:
- **New User Onboarding (SC-NEW-1 to SC-NEW-3)**: First-time user experience
- **Frequent User Workflow (SC-FREQ-1 to SC-FREQ-5)**: Regular user patterns
- **Multi-Group Management (SC-MULTI-1 to SC-MULTI-5)**: Users with multiple groups
- **Expense Tracking (SC-EXP-1 to SC-EXP-5)**: Viewing and analyzing expenses
- **Settlement & Payment Recording (SC-SETTLE-1 to SC-SETTLE-5)**: Managing debts
- **Group Collaboration (SC-COLLAB-1 to SC-COLLAB-5)**: Sharing and coordination
- **Mobile User Experience (SC-MOBILE-1 to SC-MOBILE-5)**: Mobile viewport testing
- **Offline Handling (SC-OFFLINE-1 to SC-OFFLINE-3)**: Offline functionality
- **Dark Mode Experience (SC-DARK-1 to SC-DARK-3)**: Dark theme testing
- **Accessibility (SC-A11Y-1 to SC-A11Y-5)**: Keyboard navigation, contrast, ARIA

**Total Tests**: 40+

**Running**:
```bash
npx playwright test tests/user-scenarios.spec.ts
```

### 3. **integration-scenarios.spec.ts** - Integration & Edge Cases
**Purpose**: Test API integration, edge cases, boundaries, and security.

**Test Suites**:
- **Form Validation (FV-1 to FV-8)**: Input validation, special characters
- **State Management (SM-1 to SM-6)**: Session persistence, state updates
- **API Integration (API-1 to API-5)**: Token handling, timeouts, CORS
- **Concurrent Interactions (CI-1 to CI-4)**: Rapid clicks, navigation
- **Boundary Testing (LIMIT-1 to LIMIT-5)**: Large data sets, deep nesting
- **Security (SEC-1 to SEC-5)**: XSS prevention, data exposure
- **Memory & Performance (MEM-1 to MEM-3)**: Memory leaks, resource cleanup
- **Browser Compatibility (COMPAT-1 to COMPAT-5)**: Feature detection

**Total Tests**: 40+

**Running**:
```bash
npx playwright test tests/integration-scenarios.spec.ts
```

## Quick Start

### Prerequisites
```bash
npm install
npm run install-all
npm run setup
```

### Start the Application
Terminal 1:
```bash
npm run dev
```

### Run All Tests
```bash
npm run test:playwright
```

### Run Tests in UI Mode (Recommended for Development)
```bash
npm run test:playwright:ui
```

### View Test Report
```bash
npm run test:playwright:report
```

## Test Coverage by Feature

### ✅ Authentication
- Welcome screen display
- Sign in with credentials
- Sign up for new account
- OAuth integration readiness
- Session persistence
- Sign out functionality
- Session expiration handling
- Invalid credentials error handling

### ✅ Group Management
- View all user groups
- Create new group
- Join group with invite code
- Display group invite code
- Show group members
- Navigate to group details
- Group card information display

### ✅ Expense Management
- View expense list
- Add expense with amount
- Split expenses equally
- Manual split configuration
- View expense details
- Expense currency display
- Expense timestamp display
- Expense payer information

### ✅ Payments & Settlements
- View balance information
- See who owes whom
- Record payments between members
- View payment history
- Settlement suggestions
- Quick-pay from suggestions
- Balance updates after payment
- Settled balance indicators

### ✅ User Profile
- Display user name
- Show email/credentials
- Access profile settings
- Sign out button visibility
- Profile information update

### ✅ Error Handling
- Network error recovery
- Invalid data handling
- Missing data graceful display
- Form validation errors
- Offline mode handling
- XSS/injection prevention
- CORS error handling
- API timeout handling

### ✅ Performance
- Page load time < 30 seconds
- No excessive re-renders
- No memory leaks
- Responsive UI interactions
- Rapid navigation handling
- Concurrent request handling

### ✅ Accessibility
- Keyboard navigation
- Focus management
- Button accessibility
- Form label associations
- Color contrast sufficiency
- Touch target sizing (44px minimum)
- Screen reader compatibility ready

### ✅ Cross-Platform
- Desktop responsiveness
- Mobile layout (375x812)
- Tablet viewport support
- Dark mode support
- Light mode support
- No horizontal overflow

## Running Specific Tests

### By Test Name
```bash
npx playwright test -g "AT-3"
```

### By Test File
```bash
npx playwright test tests/complete-e2e.spec.ts
```

### By Test Suite
```bash
npx playwright test -g "Authentication"
```

### Single Test
```bash
npx playwright test tests/complete-e2e.spec.ts -g "Sign in with demo credentials"
```

## Advanced Test Execution

### Debug Mode
```bash
npx playwright test --debug
```
Opens inspector with step-through debugging.

### Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Specific Browser
```bash
npx playwright test --project=chromium
```

### Slow Motion (Helpful for Debugging)
```bash
npx playwright test --headed --slow-mo=1000
```

### Workers (Parallel Execution)
```bash
npx playwright test --workers=4
```

### Single Worker (Sequential)
```bash
npx playwright test --workers=1
```

## Viewing Results

### HTML Report
```bash
npm run test:playwright:report
```

### Trace Viewer
Traces are automatically captured on first retry. View with:
```bash
npx playwright show-trace trace.zip
```

### Screenshots on Failure
```bash
npx playwright test --screenshot=only-on-failure
```

## Test Data & Credentials

### Demo Account
- Email: `asha@example.com`
- Password: `zbhaga-demo-2026`

### Sample Group Code
- Default invite code in seed data

All tests use the demo account to avoid creating test data repeatedly.

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm run install-all

- name: Setup database
  run: npm run setup

- name: Run Playwright tests
  run: npm run test:playwright

- name: Upload report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Best Practices

### 1. **Isolation**
Each test is independent and doesn't rely on others:
```typescript
test.beforeEach(async ({ page }) => {
  await signIn(page, DEMO_EMAIL, DEMO_PASSWORD);
});
```

### 2. **Wait States**
Always wait for network and DOM:
```typescript
await page.goto(APP_URL);
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

### 3. **Meaningful Names**
Test names clearly describe what's tested:
```typescript
test('AT-3: Sign in with demo credentials succeeds')
```

### 4. **Locator Strategy**
Use semantic locators:
```typescript
// Good
page.locator('button:has-text("Create")')
page.getByLabel('Group name')

// Avoid
page.locator('.btn.btn-primary')
```

### 5. **Error Messages**
Provide context in failures:
```typescript
expect(isAuthenticated).toBeTruthy();
console.log('✅ Successfully authenticated');
```

### 6. **Logging**
Add console logs for debugging:
```typescript
console.log('\n🧪 AT-3: Sign In Success');
```

## Maintaining Tests

### When UI Changes
1. Update locators in affected tests
2. Run tests locally first
3. Verify report before committing

### When Flows Change
1. Update test expectations
2. Add new tests for new flows
3. Keep old tests if backward compatible

### Performance Regression
Monitor test duration:
```bash
# Compare reports
npx playwright show-report
```

## Troubleshooting

### Tests Timeout
```bash
npx playwright test --timeout=60000
```

### Port Already in Use
```bash
lsof -i :8081
kill -9 <PID>
npm run dev:web
```

### Tests Won't Start Server
```bash
# Ensure no process on port 8081
npx playwright test --headed
# See server logs in console
```

### Authentication Fails
1. Verify demo credentials work manually
2. Check database is seeded: `npm run setup`
3. Clear browser cache: `npx playwright test --workers=1`

### Flaky Tests
- Increase wait times
- Use `waitForLoadState('networkidle')`
- Avoid hard-coded delays

## Metrics & Reporting

### Test Count by Category
- Authentication: 6 tests
- Groups: 7 tests
- Expenses: 6 tests
- Payments: 6 tests
- Error Handling: 7 tests
- Integration: 5 tests
- User Scenarios: 40 tests
- Integration/Edge Cases: 40 tests

**Total: 130+ Playwright Tests**

### Coverage Target
- Happy path: ✅ Complete
- Error cases: ✅ Complete
- Edge cases: ✅ Complete
- Performance: ✅ Complete
- Accessibility: ✅ Complete
- Security: ✅ Complete

## Future Enhancements

- [ ] Visual regression testing
- [ ] Lighthouse performance audits
- [ ] Mobile device emulation (iPhone, Android)
- [ ] Multi-browser testing (Firefox, WebKit)
- [ ] Load testing for scalability
- [ ] API mock testing
- [ ] Component-level testing
- [ ] E2E user journey recordings

## Support & Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Contact

For test-related issues or improvements:
1. Check existing test files for similar scenarios
2. Review Playwright documentation
3. Run with `--debug` flag for step-through debugging
4. Check console logs for error messages
