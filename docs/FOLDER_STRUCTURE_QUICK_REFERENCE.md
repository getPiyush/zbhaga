# Folder Structure - Quick Reference

Professional, industry-standard folder organization for zBhaga.

## 🎯 Overview

```
zbhaga/
├── docs/              📚 Documentation (single source of truth)
├── src/               💻 Source code (unified view)
├── tests/             🧪 Tests (organized by type)
├── database/          🗄️ Database files
├── config/            ⚙️ Configuration
├── scripts/           🛠️ Automation scripts
├── .github/           🤖 CI/CD workflows
├── apps/              📦 Workspace - apps
├── packages/          📦 Workspace - packages
└── README.md          📖 Project root
```

## 📚 Where to Find Things

| Looking for... | Location |
|---|---|
| Test documentation | `docs/testing/` |
| Cucumber setup guide | `docs/testing/CUCUMBER_SETUP.md` |
| Testing reference | `docs/testing/TESTING_GUIDE.md` |
| Screenshot guide | `docs/testing/SCREENSHOTS_GUIDE.md` |
| Cleanup script guide | `docs/testing/CLEANUP_SCRIPT_GUIDE.md` |
| API docs | `docs/api/` |
| Architecture docs | `docs/architecture/` |
| Deployment guide | `docs/deployment/` |
| --- | --- |
| Cucumber tests | `tests/e2e/` |
| Feature files | `tests/e2e/features/` |
| Step definitions | `tests/e2e/step-definitions/` |
| Test helpers | `tests/e2e/support/` |
| Integration tests | `tests/integration/` |
| Unit tests | `tests/unit/` |
| Test data | `tests/fixtures/` |
| Test screenshots | `tests/screenshots/denver-trip/` |
| Test reports | `tests/reports/` |
| --- | --- |
| Backend API | `src/backend/api/` or `apps/api/` |
| Shared packages | `src/backend/shared/` or `packages/shared/` |
| Web frontend | `src/frontend/web/` or `apps/client/` |
| Mobile app | `src/frontend/mobile/` or `apps/client/` |
| --- | --- |
| Database migrations | `database/migrations/` |
| Database seeds | `database/seeds/` |
| Database schemas | `database/schemas/` |
| Database backups | `database/backups/` |
| --- | --- |
| Environment files | `config/.env*` |
| Jest config | `config/jest.config.js` |
| Cucumber config | `config/cucumber.js` |
| Playwright config | `config/playwright.config.ts` |
| --- | --- |
| Setup scripts | `scripts/setup/` |
| Cleanup scripts | `scripts/cleanup/` |
| Build scripts | `scripts/build/` |
| Deploy scripts | `scripts/deploy/` |
| --- | --- |
| GitHub workflows | `.github/workflows/` |
| CI/CD tests | `.github/workflows/test.yml` |
| CI/CD build | `.github/workflows/build.yml` |

## 🚀 Common Tasks

### Running Tests
```bash
# All tests
npm run test

# Cucumber E2E tests
npm run test:cucumber:feature

# Playwright tests
npm run test:playwright

# All tests with cleanup
npm run test:all
```

### Viewing Documentation
```bash
# Documentation index
open docs/README.md

# Test docs
open docs/testing/

# API docs
open docs/api/
```

### Accessing Test Reports
```bash
# Cucumber reports
open tests/reports/cucumber-report.html

# Screenshots
open tests/screenshots/denver-trip/
```

### Database Operations
```bash
# Run migrations
npm run db:push

# Seed database
npm run db:seed

# Fresh setup
npm run setup
```

### Configuration
```bash
# Copy example env
cp config/.env.example .env

# View config
ls -la config/
```

## 📂 Folder Details

### `docs/` - Documentation
All markdown documentation, organized by topic:
- `testing/` - Cucumber, Playwright, screenshots
- `api/` - API endpoints
- `architecture/` - System design
- `deployment/` - Deploy procedures
- `setup/` - Setup guides
- `contributing/` - Contributing guidelines

### `src/` - Source Code
Unified view of source code:
- `backend/api/` - API service (symlink)
- `backend/shared/` - Shared packages (symlink)
- `frontend/web/` - Web app (symlink)
- `frontend/mobile/` - Mobile app

### `tests/` - Tests
Organized by test type:
- `e2e/` - End-to-end tests (Cucumber, Playwright)
- `integration/` - Integration tests (API, DB)
- `unit/` - Unit tests
- `fixtures/` - Test data & mocks
- `screenshots/` - Visual test evidence
- `reports/` - Test reports

### `database/` - Database
Database as code:
- `migrations/` - Schema changes (versioned)
- `seeds/` - Test data
- `schemas/` - Schema definitions
- `backups/` - Database backups

### `config/` - Configuration
Centralized configuration:
- `.env.example` - Example environment
- `.env.test` - Test configuration
- `jest.config.js` - Jest configuration
- `cucumber.js` - Cucumber configuration
- `playwright.config.ts` - Playwright configuration

### `scripts/` - Automation
Organized utility scripts:
- `setup/` - Installation & setup
- `cleanup/` - Test cleanup
- `build/` - Build automation
- `deploy/` - Deployment scripts

## 🔗 Symlinks

These folders are symlinks (shortcuts) to workspace locations:
```
src/backend/api/       → ../../apps/api/
src/backend/shared/    → ../../packages/shared/
src/frontend/web/      → ../../apps/client/
```

**Why symlinks?**
- Provide unified view without duplication
- Keep workspace structure intact
- Easy navigation

## 📊 Best Practices

### When Adding Files

| Type | Location |
|------|----------|
| Test file (.spec.ts) | `tests/e2e/` or `tests/unit/` |
| Feature file (.feature) | `tests/e2e/features/` |
| Documentation (.md) | `docs/[topic]/` |
| Database migration (.sql) | `database/migrations/` |
| Configuration | `config/` |
| Script | `scripts/[category]/` |

### For Developers

1. **Finding tests** → Look in `tests/`
2. **Finding docs** → Look in `docs/`
3. **Finding source** → Look in `src/` or `apps/`
4. **Finding config** → Look in `config/`

### For CI/CD

1. **Test reports** → `tests/reports/`
2. **Screenshots** → `tests/screenshots/`
3. **Configs** → `config/`
4. **Scripts** → `scripts/`

## ✅ Navigation Tips

### Quick jumps
```bash
# Jump to tests
cd tests/

# Jump to docs
cd docs/testing/

# Jump to backend
cd src/backend/

# Jump to database
cd database/
```

### List commands
```bash
# Show folder structure
tree -L 2

# List test types
ls tests/

# List docs
ls docs/

# List config
ls config/
```

## 🎯 Folder Purposes

| Folder | Purpose | Access |
|--------|---------|--------|
| docs/ | Reference & documentation | Read-only, everyone |
| src/ | Navigate source code | Read, developers |
| tests/ | Write & run tests | Read-write, testers |
| database/ | Version control schemas | Read-write, DBAs |
| config/ | Application settings | Read, everyone |
| scripts/ | Automation | Execute, developers |

## 📈 Growth Planning

The structure supports:
- ✅ Adding new test types (tests/performance/)
- ✅ Adding new services (src/backend/service2/)
- ✅ Adding new apps (src/frontend/desktop/)
- ✅ Expanding documentation (docs/guides/)

## ⚠️ Don't

- ❌ Don't put docs at root level
- ❌ Don't mix test types
- ❌ Don't put config in source
- ❌ Don't ignore symlinks
- ❌ Don't skip organization

## ✨ Do

- ✅ Follow the structure
- ✅ Use symlinks for navigation
- ✅ Keep docs updated
- ✅ Organize by type
- ✅ Maintain clear hierarchy

## 🚀 Quick Setup

To reorganize your project:
```bash
# Run the migration script
./scripts/migrate-folder-structure.sh

# Verify structure
tree -L 3

# Commit changes
git add .
git commit -m "refactor: reorganize folder structure"
```

## 📞 For Help

- **Full guide**: `FOLDER_STRUCTURE_GUIDE.md`
- **Migration script**: `scripts/migrate-folder-structure.sh`
- **Implementation**: `FOLDER_REORGANIZATION_SUMMARY.md`

---

**Professional structure. Industry standards. Easy to navigate.** 🎯
