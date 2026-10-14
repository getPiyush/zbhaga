# zBhaga - Folder Structure & Organization Guide

Industry-standard folder organization following monorepo best practices.

## 📁 Root Level Structure

```
zbhaga/
├── docs/                          # 📚 All documentation (single source of truth)
│   ├── testing/                   # Test documentation
│   │   ├── CUCUMBER_SETUP.md
│   │   ├── CUCUMBER_QUICK_START.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── SCREENSHOTS_GUIDE.md
│   │   └── CLEANUP_SCRIPT_GUIDE.md
│   ├── api/                       # API documentation
│   ├── architecture/              # Architecture & design
│   ├── deployment/                # Deployment guides
│   ├── setup/                     # Setup & installation
│   ├── contributing/              # Contributing guidelines
│   └── README.md                  # Documentation index
│
├── src/                           # 💻 Source code
│   ├── backend/                   # Backend services & API
│   │   ├── api/                   # API implementation (@zbhaga/api)
│   │   ├── shared/                # Shared utilities (@zbhaga/shared)
│   │   └── package.json
│   └── frontend/                  # Frontend applications
│       ├── web/                   # Web app
│       ├── mobile/                # Mobile app (Expo)
│       └── shared/                # Shared frontend utilities
│
├── tests/                         # 🧪 All test files & fixtures
│   ├── e2e/                       # End-to-end tests
│   │   ├── features/              # Gherkin feature files
│   │   ├── step-definitions/      # Step implementations
│   │   └── support/               # Test utilities & world
│   ├── integration/               # Integration tests
│   │   ├── api/                   # API integration tests
│   │   ├── database/              # Database tests
│   │   └── flows/                 # Multi-step flow tests
│   ├── unit/                      # Unit tests
│   │   ├── shared/                # Shared lib tests
│   │   ├── utils/                 # Utility tests
│   │   └── services/              # Service tests
│   ├── fixtures/                  # Test data & mocks
│   │   ├── users.json
│   │   ├── groups.json
│   │   └── expenses.json
│   ├── screenshots/               # Test screenshots
│   │   └── denver-trip/           # Feature-specific screenshots
│   └── reports/                   # Test reports & artifacts
│       ├── cucumber-report.html
│       ├── cucumber-report.json
│       └── playwright-report/
│
├── database/                      # 🗄️ Database files
│   ├── migrations/                # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_add_fields.sql
│   ├── seeds/                     # Seed data
│   │   ├── dev-seed.sql
│   │   └── test-seed.sql
│   ├── schemas/                   # Database schemas
│   │   ├── users.schema.sql
│   │   ├── groups.schema.sql
│   │   └── expenses.schema.sql
│   ├── backups/                   # Database backups
│   └── README.md                  # Database documentation
│
├── config/                        # ⚙️ Configuration files
│   ├── .env.example
│   ├── .env.test
│   ├── .env.production
│   ├── jest.config.js
│   ├── cucumber.js
│   └── README.md
│
├── scripts/                       # 🛠️ Build & utility scripts
│   ├── setup/
│   │   ├── install.js
│   │   └── setup-db.js
│   ├── cleanup/
│   │   └── cleanup-test-artifacts.js
│   ├── build/
│   │   ├── build-web.js
│   │   └── build-mobile.js
│   └── deploy/
│       └── deploy.sh
│
├── .github/                       # GitHub configuration
│   └── workflows/                 # CI/CD workflows
│       ├── test.yml
│       ├── build.yml
│       └── deploy.yml
│
├── playwright.config.ts           # Playwright configuration
├── package.json                   # Root package.json
├── tsconfig.json                  # Root TypeScript config
├── .gitignore
└── README.md                      # Project root README
```

## 📂 Detailed Folder Explanations

### `docs/` - Documentation (Single Source of Truth)
**Purpose:** Centralized documentation hub

**Contents:**
- `testing/` - Test suite documentation (Cucumber, Playwright, screenshots)
- `api/` - API endpoint documentation
- `architecture/` - System design, data models, flows
- `deployment/` - Deployment procedures, DevOps guides
- `setup/` - Installation, environment setup, prerequisites
- `contributing/` - Contribution guidelines, code standards

**Best Practice:** All `.md` files moved here from root, organized by topic

### `src/` - Source Code
**Purpose:** All application source code

**Structure:**
- `backend/` - Backend services
  - `api/` → Link to apps/api
  - `shared/` → Link to packages/shared
- `frontend/` - Frontend applications
  - `web/` → Link to apps/client
  - `mobile/` → Link to mobile app (Expo)

**Best Practice:** Workspace packages linked from here, provides unified view

### `tests/` - All Test Files
**Purpose:** Organized test suite by type

**Organization by test type:**
- `e2e/` - End-to-end tests
  - `features/` - Gherkin feature files
  - `step-definitions/` - Step implementations
  - `support/` - Helpers, world, hooks
- `integration/` - Integration tests
  - `api/` - API integration tests
  - `database/` - Database tests
  - `flows/` - Complex flow tests
- `unit/` - Unit tests
  - `shared/` - Shared package tests
  - `utils/` - Utility function tests
  - `services/` - Service tests

**Supporting folders:**
- `fixtures/` - Test data, mocks, sample data
- `screenshots/` - Test execution screenshots (essential evidence)
- `reports/` - Test reports (HTML, JSON, coverage)

**Best Practice:** All test-related items in one place, organized hierarchically

### `database/` - Database Files
**Purpose:** All database-related files in one location

**Organization:**
- `migrations/` - Schema changes, version control
- `seeds/` - Initial/test data
- `schemas/` - Schema definitions
- `backups/` - Database backups

**Best Practice:** Database as code, versioned and documented

### `config/` - Configuration
**Purpose:** Centralized configuration

**Contents:**
- Environment files (.env.*)
- Tool configurations (jest, cucumber, playwright)
- Shared config files

**Best Practice:** Single source for configuration, never in source code

### `scripts/` - Build & Utility Scripts
**Purpose:** Automation scripts organized by function

**Organization:**
- `setup/` - Installation and initialization
- `cleanup/` - Test and artifact cleanup
- `build/` - Build automation
- `deploy/` - Deployment scripts

**Best Practice:** Scripts organized by purpose, no scripts in package.json root

## 🔗 Workspace Integration

### Current Monorepo (Keep structure, improve organization)
```
zbhaga/ (root)
├── apps/
│   ├── api/                    → Backend API
│   ├── client/                 → Web & Mobile frontend
│   └── package.json
├── packages/
│   ├── shared/                 → Shared utilities
│   └── package.json
├── package.json                → Root workspace
└── pnpm-workspace.yaml         → Workspace definition
```

### Integration with New Structure
```
New structure links to workspaces:
docs/api/                        → documents apps/api/
src/backend/api/                 → links to apps/api/
src/frontend/web/               → links to apps/client/
tests/                          → tests all workspaces
database/                       → shared database files
```

## 📋 Migration Path (Step-by-Step)

### Phase 1: Create Directory Structure
```bash
# Create new folders
mkdir -p docs/{testing,api,architecture,deployment,setup,contributing}
mkdir -p src/{backend,frontend}
mkdir -p tests/{e2e/{features,step-definitions,support},integration/{api,database,flows},unit/{shared,utils,services},fixtures,screenshots,reports}
mkdir -p database/{migrations,seeds,schemas,backups}
mkdir -p config
mkdir -p scripts/{setup,cleanup,build,deploy}
mkdir -p .github/workflows
```

### Phase 2: Move Test Files
```bash
# Move test files to tests/ folder
mv tests/*.spec.ts tests/e2e/
mv tests/features/ tests/e2e/
mv tests/step-definitions/ tests/e2e/
mv tests/support/ tests/e2e/
mv tests/screenshots/ tests/
mv tests/data/ tests/fixtures/
```

### Phase 3: Move Documentation
```bash
# Move all markdown files to docs/
mv CUCUMBER_SETUP.md docs/testing/
mv TESTING_GUIDE.md docs/testing/
mv SCREENSHOTS_GUIDE.md docs/testing/
mv CLEANUP_SCRIPT_GUIDE.md docs/testing/
mv README.md docs/
```

### Phase 4: Organize Database Files
```bash
# Move database-related files
mkdir -p database/migrations
mkdir -p database/seeds
mv apps/api/src/db/migrations database/
mv apps/api/src/db/seeds database/
```

### Phase 5: Create Symlinks (Keep workspace compatibility)
```bash
# Create symlinks from src/ to actual workspace locations
ln -s ../../apps/api src/backend/api
ln -s ../../packages/shared src/backend/shared
ln -s ../../apps/client src/frontend/web
```

## 🎯 Benefits of This Structure

### 1. **Clear Organization**
- All tests in one place (easy to find)
- All docs in one place (single source of truth)
- All database files together (easier to manage)

### 2. **Scalability**
- Easy to add new test types
- Documentation grows naturally
- Database changes tracked clearly

### 3. **Developer Experience**
- New developers know where files live
- Logical grouping by concern
- Standard industry structure

### 4. **CI/CD Integration**
- Easy to run specific test suites
- Reports in expected locations
- Configuration centralized

### 5. **Documentation**
- All docs accessible from one point
- Better discoverability
- Organized by topic

## 📊 File Movement Summary

### Documents (to docs/)
```
CUCUMBER_SETUP.md                → docs/testing/
CUCUMBER_QUICK_START.md          → docs/testing/
TESTING_GUIDE.md                 → docs/testing/
SCREENSHOTS_GUIDE.md             → docs/testing/
SCREENSHOTS_IMPLEMENTATION_SUMMARY.md → docs/testing/
CLEANUP_SCRIPT_GUIDE.md          → docs/testing/
CLEANUP_IMPLEMENTATION_COMPLETE.md   → docs/testing/
CUCUMBER_IMPLEMENTATION_SUMMARY.md   → docs/testing/
DELIVERY_SUMMARY.md              → docs/
FOLDER_STRUCTURE_GUIDE.md        → docs/
```

### Tests (organize in tests/)
```
tests/features/                  → tests/e2e/features/
tests/step-definitions/          → tests/e2e/step-definitions/
tests/support/                   → tests/e2e/support/
tests/screenshots/denver-trip/   → tests/screenshots/
tests/CUCUMBER_*.md              → docs/testing/
```

### Database (to database/)
```
apps/api/src/db/migrations/      → database/migrations/
apps/api/src/db/seeds/           → database/seeds/
```

### Configuration (to config/)
```
.env.* files                     → config/
jest.config.js                   → config/
cucumber.js                      → config/
playwright.config.ts            → config/ (symlink)
tsconfig.json                   → config/
```

### Scripts (to scripts/)
```
scripts/cleanup-test-artifacts.js → scripts/cleanup/
scripts/install.js               → scripts/setup/
scripts/generate-cucumber-report.js → scripts/build/
```

## ✅ Best Practices Implemented

### 1. **Separation of Concerns**
- Tests separate from source
- Database separate from API
- Config separate from code

### 2. **Single Responsibility**
- Each folder has one purpose
- Clear naming conventions
- Logical hierarchy

### 3. **Discoverability**
- Consistent structure
- Predictable locations
- Good documentation

### 4. **Scalability**
- Easy to add new test types
- Easy to add new services
- Easy to grow documentation

### 5. **Industry Standards**
- Follows common monorepo patterns
- Similar to Jest, Next.js projects
- Recognizable by developers

## 🗂️ Quick Reference

| What | Where |
|------|-------|
| Documentation | `docs/` |
| Tests | `tests/` |
| Test Fixtures | `tests/fixtures/` |
| Test Reports | `tests/reports/` |
| Screenshots | `tests/screenshots/` |
| Database Files | `database/` |
| Configuration | `config/` |
| Scripts | `scripts/` |
| Source Code | `src/` |

## 🚀 Implementation Steps

1. **Create new directory structure**
   ```bash
   # Run the migration script
   chmod +x scripts/migrate-structure.sh
   ./scripts/migrate-structure.sh
   ```

2. **Update import paths**
   - Review affected test files
   - Update documentation links
   - Update CI/CD references

3. **Verify all tests still work**
   ```bash
   npm run test
   npm run test:cucumber:feature
   ```

4. **Update CI/CD configurations**
   - Update GitHub Actions workflows
   - Update test command paths
   - Verify artifact paths

5. **Update documentation**
   - Links to moved files
   - Folder navigation
   - Quick reference guides

## 📝 Important Notes

### Keep These as-is
- `apps/` - Workspace structure (monorepo workspaces)
- `packages/` - Shared packages
- `node_modules/` - Dependencies
- `pnpm-workspace.yaml` - Workspace definition

### Create Symlinks (Optional)
```bash
# For easier navigation from src/
ln -s ../../apps/api src/backend/api
ln -s ../../apps/client src/frontend/web
```

### Update CI/CD
```yaml
# Update workflow paths
- run: npm run test:playwright -- tests/e2e/
- run: npm run test:cucumber -- tests/e2e/features/
- uses: actions/upload-artifact@v3
  with:
    path: tests/reports/
```

## ✨ Result

After reorganization:
- ✅ Professional structure (industry-standard)
- ✅ Clear organization (single source of truth)
- ✅ Easy navigation (predictable locations)
- ✅ Better scalability (room to grow)
- ✅ Improved DX (better for new developers)

---

This structure follows:
- **Jest/React conventions** - Test organization
- **Node.js best practices** - Project structure
- **Monorepo patterns** - Workspace management
- **Industry standards** - Professional organization
