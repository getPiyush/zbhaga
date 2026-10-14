# Cucumber Playwright Test Suite for zBhaga

Complete BDD end-to-end test automation for the zBhaga expense splitting application.

## 🎯 What's Included

A comprehensive Cucumber Playwright test suite with:

- ✅ **Feature File** - Gherkin scenarios for Denver trip expense workflow
- ✅ **Step Definitions** - 30+ Playwright-powered test steps
- ✅ **Test Data** - Complete test data constants and utilities
- ✅ **Helper Library** - 30+ reusable test helper functions
- ✅ **Comprehensive Documentation** - 4 detailed guides
- ✅ **Automatic Screenshots** - Screenshots at each major step
- ✅ **HTML Reports** - Beautiful test execution reports
- ✅ **CI/CD Ready** - Examples for GitHub Actions, Jenkins, GitLab

## 📁 File Structure

```
tests/
├── features/
│   └── denver-trip.feature              # Main feature file (220 lines)
│
├── step-definitions/
│   └── denver-trip.steps.ts             # Step implementations (750+ lines)
│
├── support/
│   ├── world.ts                         # Cucumber World config
│   └── helpers.ts                       # 30+ helper functions (400+ lines)
│
├── data/
│   └── denver-trip-data.ts              # Test data constants
│
├── CUCUMBER_SETUP.md                    # Full setup & reference guide
├── CUCUMBER_QUICK_START.md              # 5-minute quick start
└── TESTING_GUIDE.md                     # Complete testing guide

cucumber.js                              # Cucumber configuration
package.json                             # Updated with Cucumber deps
CUCUMBER_README.md                       # This file
CUCUMBER_IMPLEMENTATION_SUMMARY.md       # Technical overview
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install --save-dev @cucumber/cucumber ts-node typescript
```

### Step 2: Start Application

```bash
npm run dev
```

Wait for both servers to be ready:
- API: `http://localhost:4000` ✓
- Web: `http://localhost:8081` ✓

### Step 3: Run Tests

```bash
npm run test:cucumber:feature
```

### Step 4: View Results

```bash
open cucumber-report.html
```

## 📋 What Gets Tested

The **Denver Trip Scenario** validates:

```
✓ User signup (5 users, one by one)
✓ Group creation ("Denver Trip 2026")
✓ Invite code generation and sharing
✓ Group joining (4 users via invite code)
✓ Expense adding (9 expenses, 5 days)
  - Day 1: Hotel $300, Breakfast $45
  - Day 2: Car Rental $450, Lunch $60
  - Day 3: Dinner $150, Parking $25
  - Day 4: Attractions $200, Dinner $120
  - Day 5: Checkout $100
✓ Payment recording (5 payments between users)
✓ Balance verification
✓ Expense history viewing
✓ Payment history viewing
✓ Data cleanup (all test data removed)
```

**Execution Time**: 2-4 minutes

## 📚 Documentation

Four comprehensive guides are included:

| Document | Purpose | Length | Read Time |
|----------|---------|--------|-----------|
| [CUCUMBER_QUICK_START.md](tests/CUCUMBER_QUICK_START.md) | Get running in 5 min | 150 lines | 5 min |
| [CUCUMBER_SETUP.md](tests/CUCUMBER_SETUP.md) | Complete reference | 350 lines | 15 min |
| [TESTING_GUIDE.md](tests/TESTING_GUIDE.md) | Testing architecture | 500 lines | 20 min |
| [CUCUMBER_IMPLEMENTATION_SUMMARY.md](CUCUMBER_IMPLEMENTATION_SUMMARY.md) | Technical details | 300 lines | 10 min |

**Start here**: [CUCUMBER_QUICK_START.md](tests/CUCUMBER_QUICK_START.md)

## 🔧 Available Commands

```bash
# Run Denver trip feature (recommended)
npm run test:cucumber:feature

# Run all Cucumber features
npm run test:cucumber

# Run with specific name
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --name "Complete Denver trip expense tracking workflow"

# Run with debugging
npx cucumber-js tests/features/denver-trip.feature \
  --require-module ts-node/register \
  --debug

# View reports
open cucumber-report.html
open test-screenshots/denver-trip/
```

## 📊 Test Reports

After running tests, you get:

1. **HTML Report** (`cucumber-report.html`)
   - Visual step-by-step results
   - Execution times
   - Pass/fail status
   - Screenshots embedded

2. **JSON Report** (`cucumber-report.json`)
   - Machine-readable format
   - CI/CD integration ready

3. **Screenshots** (`test-screenshots/denver-trip/`)
   - Auto-captured at each step
   - Timestamped filenames
   - Full-page captures for debugging

## 🎓 Feature Overview

### Scenario 1: Complete Denver Trip Workflow

**7 Phases:**
1. User signup (5 users)
2. Group creation (Alice creates group)
3. Invite code generation
4. Group joining (4 users join)
5. Expense adding (9 expenses, 5 days)
6. Payment recording (5 payments)
7. Verification and cleanup

**Code example:**
```gherkin
Given I sign up the following users one by one:
  | displayName | email                  | password     |
  | Alice       | alice.denver@test.com  | TestPass123! |
  | Bob         | bob.denver@test.com    | TestPass123! |
  # ... 3 more users

When Alice logs in and creates a group "Denver Trip 2026"
And Alice generates the group invite code
And Bob joins using the code
# ... repeat for other users

When Alice adds expenses:
  | description | amount | date |
  | Hotel       | 300    | 10-15 |
  # ... more expenses

Then verify expenses are listed
And verify balances are calculated
And cleanup all test data
```

### Scenario 2: Single User Solo Trip

Simpler workflow demonstrating:
- Single user signup
- Group creation
- Expense adding
- Group viewing

## 🛠️ Architecture

### Technology Stack

- **Cucumber 10.0.0** - BDD framework
- **Playwright 1.63.0** - Browser automation
- **TypeScript 5.3.3** - Type safety
- **ts-node 10.9.2** - TypeScript execution

### Test Layers

```
Feature File (Gherkin)
    ↓
Step Definitions (Playwright)
    ↓
Helper Functions (Reusable utilities)
    ↓
Test Data (Constants & fixtures)
    ↓
Browser Automation (Playwright APIs)
    ↓
API Integration (Fetch calls)
```

## 🔑 Key Features

### 1. Comprehensive Coverage
- Entire user workflow from signup to settlement
- Multiple scenarios for different paths
- Tabular test data input

### 2. Maintainable Code
- Clear Gherkin syntax (business-readable)
- Well-organized step definitions
- Reusable helper functions
- Type-safe TypeScript

### 3. Reliable Execution
- Automatic retries for flaky operations
- Proper wait strategies (element, URL, network)
- Screenshot on error
- Detailed error messages

### 4. Observable Results
- HTML reports with step details
- Automatic screenshots at each step
- JSON reports for CI/CD
- Execution time tracking

### 5. Extensible
- Easy to add new scenarios
- Pluggable helper functions
- Centralized test data
- Modular step definitions

## 📖 Usage Examples

### Run Tests

```bash
# Start app
npm run dev

# In another terminal
npm run test:cucumber:feature
```

### Add New Scenario

1. Edit `tests/features/denver-trip.feature`
2. Add your scenario with Gherkin syntax
3. Implement steps if needed
4. Run tests

### Add New Step

```typescript
// Add to tests/step-definitions/denver-trip.steps.ts
When('{string} does something new', async (name) => {
  const page = context.pages.get(userEmail);
  // Implementation
  await takeScreenshot(page, 'step-name');
});
```

### Use Helpers

```typescript
import { 
  apiCall, 
  fillField, 
  takeScreenshot, 
  waitForElement 
} from '../support/helpers';

// Use in steps
await fillField(page, '[data-testid="input"]', 'value');
await waitForElement(page, '[data-testid="button"]');
await takeScreenshot(page, screenshotDir, 'my-step');
```

## ⚙️ Configuration

### Environment Variables

```bash
# Custom server URLs
APP_URL=http://localhost:3000 npm run test:cucumber:feature
API_URL=http://api.example.com npm run test:cucumber:feature
```

### Timeout Settings

Edit `tests/support/world.ts`:

```typescript
setDefaultTimeout(30000); // 30 seconds per step
```

### Screenshots

Enable/disable in `tests/data/denver-trip-data.ts`:

```typescript
screenshots: {
  enabled: true,
  directory: './test-screenshots/denver-trip'
}
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Port already in use** | `lsof -i :4000 && kill -9 <PID>` |
| **Timeout errors** | Increase timeout in `world.ts` |
| **Element not found** | Check `data-testid` attributes exist |
| **API errors** | Run `npm run setup` to reset DB |
| **Screenshot failures** | Check directory permissions |

See [TESTING_GUIDE.md](tests/TESTING_GUIDE.md#troubleshooting-matrix) for more.

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
- run: npm install-all
- run: npm run setup
- run: npm run dev &
- run: sleep 10
- run: npm run test:cucumber:feature
- uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: cucumber-report.*
```

See [TESTING_GUIDE.md](tests/TESTING_GUIDE.md#cicd-integration) for Jenkins and GitLab examples.

## 📈 Performance

**Typical Execution Times:**

| Phase | Duration |
|-------|----------|
| Signup (5 users) | 30s |
| Group setup | 20s |
| User joining | 40s |
| Add expenses | 60s |
| Record payments | 40s |
| Verification | 30s |
| Cleanup | 20s |
| **Total** | **~2-4 mins** |

## 🎯 Next Steps

1. **Install dependencies** - `npm install --save-dev @cucumber/cucumber ts-node`
2. **Read quick start** - `tests/CUCUMBER_QUICK_START.md`
3. **Start app** - `npm run dev`
4. **Run tests** - `npm run test:cucumber:feature`
5. **View results** - `open cucumber-report.html`
6. **Add new scenarios** - Follow examples in feature file
7. **Extend tests** - Use helper functions and test data

## 📞 Support

- **Setup Help** → [CUCUMBER_SETUP.md](tests/CUCUMBER_SETUP.md)
- **Quick Questions** → [CUCUMBER_QUICK_START.md](tests/CUCUMBER_QUICK_START.md)
- **Testing Guide** → [TESTING_GUIDE.md](tests/TESTING_GUIDE.md)
- **Technical Details** → [CUCUMBER_IMPLEMENTATION_SUMMARY.md](CUCUMBER_IMPLEMENTATION_SUMMARY.md)

## 📝 Test Data Reference

### Users Created

| Name | Email | Password |
|------|-------|----------|
| Alice | alice.denver@test.com | TestPass123! |
| Bob | bob.denver@test.com | TestPass123! |
| Charlie | charlie.denver@test.com | TestPass123! |
| Diana | diana.denver@test.com | TestPass123! |
| Eve | eve.denver@test.com | TestPass123! |

### Expenses Created

- **9 total expenses** across 5 days
- **$1,450 total** amount
- Categories: accommodation, food, transport, entertainment, misc

### Payments Recorded

- **5 total payments** recorded between users
- **$575 total** amount
- Demonstrates settlement between participants

See `tests/data/denver-trip-data.ts` for complete data constants.

## ✅ Checklist

Before running tests, verify:

- [ ] Node.js 20+ installed
- [ ] Dependencies installed: `npm install --save-dev @cucumber/cucumber ts-node`
- [ ] App starts: `npm run dev`
- [ ] API ready at `http://localhost:4000`
- [ ] Web ready at `http://localhost:8081`
- [ ] Database reset: `npm run setup`

## 📊 What's Covered

```
Feature Coverage:
✓ Authentication (signup, login, logout)
✓ Group Management (create, join, invite)
✓ Expense Management (add, view, list)
✓ Payment Recording (record, view, history)
✓ Balance Calculation (view, settlement)
✓ Data Cleanup (delete users, groups)

UI Coverage:
✓ Authentication screens
✓ Home/groups list
✓ Group detail view
✓ Expenses tab
✓ Payments tab
✓ Balances tab
✓ Forms and modals

User Actions:
✓ Fill forms
✓ Click buttons
✓ Select dropdowns
✓ Navigate pages
✓ View results
✓ Verify data
```

## 🏆 Best Practices Included

✅ Clear Gherkin scenarios (business-readable)
✅ Type-safe TypeScript implementation
✅ Comprehensive error handling
✅ Automatic screenshot capture
✅ Reusable helper functions
✅ Centralized test data
✅ Proper wait strategies
✅ Clean code organization
✅ Detailed documentation
✅ CI/CD ready

## 📅 Version Info

- **Created**: October 2, 2026
- **Framework**: Cucumber 10.0.0
- **Browser Automation**: Playwright 1.63.0
- **Language**: TypeScript 5.3.3
- **Node.js**: 20+

## 🎉 Ready to Test!

```bash
# 1. Install
npm install --save-dev @cucumber/cucumber ts-node

# 2. Start
npm run dev

# 3. Test
npm run test:cucumber:feature

# 4. Report
open cucumber-report.html
```

Happy testing! 🚀

---

**Questions?** Check the documentation files or review the step definitions for examples.
