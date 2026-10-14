#!/bin/bash

# Folder Structure Migration Script
# Reorganizes zBhaga project to follow industry best practices
# Creates: docs/, src/, tests/, database/, config/ structure

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Confirm before proceeding
confirm_proceed() {
    read -p "Proceed with migration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 1
    fi
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_header "zBhaga Folder Structure Migration"

echo "Project root: $PROJECT_ROOT"
echo ""
echo "This script will:"
echo "  1. Create new folder structure (docs/, src/, tests/, database/, config/)"
echo "  2. Move documentation files to docs/"
echo "  3. Organize test files by type"
echo "  4. Consolidate database files"
echo "  5. Organize configuration files"
echo "  6. Update file paths where needed"
echo ""

confirm_proceed

# Create directory structure
print_header "Creating Directory Structure"

# docs/
mkdir -p "$PROJECT_ROOT/docs/testing"
mkdir -p "$PROJECT_ROOT/docs/api"
mkdir -p "$PROJECT_ROOT/docs/architecture"
mkdir -p "$PROJECT_ROOT/docs/deployment"
mkdir -p "$PROJECT_ROOT/docs/setup"
mkdir -p "$PROJECT_ROOT/docs/contributing"
print_step "Created docs/ structure"

# src/
mkdir -p "$PROJECT_ROOT/src/backend"
mkdir -p "$PROJECT_ROOT/src/frontend"
print_step "Created src/ structure"

# tests/
mkdir -p "$PROJECT_ROOT/tests/e2e/features"
mkdir -p "$PROJECT_ROOT/tests/e2e/step-definitions"
mkdir -p "$PROJECT_ROOT/tests/e2e/support"
mkdir -p "$PROJECT_ROOT/tests/integration/api"
mkdir -p "$PROJECT_ROOT/tests/integration/database"
mkdir -p "$PROJECT_ROOT/tests/integration/flows"
mkdir -p "$PROJECT_ROOT/tests/unit/shared"
mkdir -p "$PROJECT_ROOT/tests/unit/utils"
mkdir -p "$PROJECT_ROOT/tests/unit/services"
mkdir -p "$PROJECT_ROOT/tests/fixtures"
mkdir -p "$PROJECT_ROOT/tests/reports"
# Keep screenshots in original location or move
if [ -d "$PROJECT_ROOT/test-screenshots" ]; then
    mkdir -p "$PROJECT_ROOT/tests/screenshots"
fi
print_step "Created tests/ structure"

# database/
mkdir -p "$PROJECT_ROOT/database/migrations"
mkdir -p "$PROJECT_ROOT/database/seeds"
mkdir -p "$PROJECT_ROOT/database/schemas"
mkdir -p "$PROJECT_ROOT/database/backups"
print_step "Created database/ structure"

# config/
mkdir -p "$PROJECT_ROOT/config"
print_step "Created config/ structure"

# .github/workflows/
mkdir -p "$PROJECT_ROOT/.github/workflows"
print_step "Created .github/workflows/ structure"

# Move documentation files
print_header "Moving Documentation Files to docs/"

# Testing docs
move_if_exists() {
    local src="$1"
    local dest="$2"
    if [ -f "$src" ]; then
        mv "$src" "$dest"
        print_step "Moved $(basename "$src") to docs/testing/"
    fi
}

move_if_exists "$PROJECT_ROOT/CUCUMBER_SETUP.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/CUCUMBER_QUICK_START.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/CUCUMBER_REPORT_SUMMARY.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/CUCUMBER_IMPLEMENTATION_SUMMARY.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/TESTING_GUIDE.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/SCREENSHOTS_GUIDE.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/SCREENSHOTS_IMPLEMENTATION_SUMMARY.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/SCREENSHOTS_COMPLETE.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/CLEANUP_SCRIPT_GUIDE.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/CLEANUP_IMPLEMENTATION_COMPLETE.md" "$PROJECT_ROOT/docs/testing/"
move_if_exists "$PROJECT_ROOT/DELIVERY_SUMMARY.md" "$PROJECT_ROOT/docs/"
move_if_exists "$PROJECT_ROOT/FOLDER_STRUCTURE_GUIDE.md" "$PROJECT_ROOT/docs/"

# Move root README if exists
if [ -f "$PROJECT_ROOT/README.md" ]; then
    cp "$PROJECT_ROOT/README.md" "$PROJECT_ROOT/docs/README.md"
    print_step "Copied README.md to docs/"
fi

# Create docs index if main README moved
if [ ! -f "$PROJECT_ROOT/README.md" ]; then
    cat > "$PROJECT_ROOT/README.md" << 'EOF'
# zBhaga - Expense Splitting Application

For full documentation, see [docs/README.md](./docs/README.md)

## Quick Start

```bash
npm install-all
npm run setup
npm run dev
```

## Documentation

- [Complete Documentation](./docs/README.md)
- [Testing Guide](./docs/testing/)
- [API Documentation](./docs/api/)
- [Architecture](./docs/architecture/)

## Testing

```bash
# Run all tests
npm run test

# Run Cucumber tests
npm run test:cucumber:feature

# Run Playwright tests
npm run test:playwright
```

## Project Structure

See [FOLDER_STRUCTURE_GUIDE.md](./docs/FOLDER_STRUCTURE_GUIDE.md) for detailed structure.
EOF
    print_step "Created new root README.md"
fi

# Move test-related docs in tests/ folder
print_header "Organizing Test Documentation"

move_test_doc() {
    local file="$1"
    if [ -f "$PROJECT_ROOT/tests/$file" ]; then
        mv "$PROJECT_ROOT/tests/$file" "$PROJECT_ROOT/docs/testing/"
        print_step "Moved $file to docs/testing/"
    fi
}

move_test_doc "CUCUMBER_SETUP.md"
move_test_doc "CUCUMBER_QUICK_START.md"
move_test_doc "TESTING_GUIDE.md"

# Organize test files by type
print_header "Organizing Test Files by Type"

# Move existing test files to e2e
if [ -d "$PROJECT_ROOT/tests" ]; then
    # Move feature files
    if [ -d "$PROJECT_ROOT/tests/features" ]; then
        find "$PROJECT_ROOT/tests/features" -type f -exec mv {} "$PROJECT_ROOT/tests/e2e/features/" \; 2>/dev/null || true
        rmdir "$PROJECT_ROOT/tests/features" 2>/dev/null || true
        print_step "Moved feature files to tests/e2e/features/"
    fi

    # Move step definitions
    if [ -d "$PROJECT_ROOT/tests/step-definitions" ]; then
        find "$PROJECT_ROOT/tests/step-definitions" -type f -exec mv {} "$PROJECT_ROOT/tests/e2e/step-definitions/" \; 2>/dev/null || true
        rmdir "$PROJECT_ROOT/tests/step-definitions" 2>/dev/null || true
        print_step "Moved step definitions to tests/e2e/step-definitions/"
    fi

    # Move support files
    if [ -d "$PROJECT_ROOT/tests/support" ]; then
        find "$PROJECT_ROOT/tests/support" -type f -exec mv {} "$PROJECT_ROOT/tests/e2e/support/" \; 2>/dev/null || true
        rmdir "$PROJECT_ROOT/tests/support" 2>/dev/null || true
        print_step "Moved support files to tests/e2e/support/"
    fi

    # Move spec files to e2e
    find "$PROJECT_ROOT/tests" -maxdepth 1 -name "*.spec.ts" -exec mv {} "$PROJECT_ROOT/tests/e2e/" \; 2>/dev/null || true
    print_step "Moved spec files to tests/e2e/"
fi

# Move test data to fixtures
print_header "Organizing Test Fixtures"

if [ -d "$PROJECT_ROOT/tests/data" ]; then
    find "$PROJECT_ROOT/tests/data" -type f -exec mv {} "$PROJECT_ROOT/tests/fixtures/" \; 2>/dev/null || true
    rmdir "$PROJECT_ROOT/tests/data" 2>/dev/null || true
    print_step "Moved test data to tests/fixtures/"
fi

# Move screenshots
if [ -d "$PROJECT_ROOT/test-screenshots" ]; then
    mv "$PROJECT_ROOT/test-screenshots" "$PROJECT_ROOT/tests/screenshots"
    print_step "Moved test-screenshots to tests/screenshots/"
fi

# Organize configuration files
print_header "Organizing Configuration Files"

# Move or copy config files
if [ -f "$PROJECT_ROOT/jest.config.js" ]; then
    cp "$PROJECT_ROOT/jest.config.js" "$PROJECT_ROOT/config/"
    print_step "Copied jest.config.js to config/"
fi

if [ -f "$PROJECT_ROOT/cucumber.js" ]; then
    cp "$PROJECT_ROOT/cucumber.js" "$PROJECT_ROOT/config/"
    print_step "Copied cucumber.js to config/"
fi

# Move environment files
if [ -f "$PROJECT_ROOT/.env.example" ]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/config/"
    print_step "Copied .env.example to config/"
fi

# Create symlinks for src/ navigation
print_header "Creating Symlinks (Optional)"

echo "Creating symlinks to workspace folders:"

# Backend symlink
if [ -d "$PROJECT_ROOT/apps/api" ] && [ ! -L "$PROJECT_ROOT/src/backend/api" ]; then
    ln -s ../../apps/api "$PROJECT_ROOT/src/backend/api"
    print_step "Created symlink: src/backend/api → apps/api"
fi

# Frontend web symlink
if [ -d "$PROJECT_ROOT/apps/client" ] && [ ! -L "$PROJECT_ROOT/src/frontend/web" ]; then
    ln -s ../../apps/client "$PROJECT_ROOT/src/frontend/web"
    print_step "Created symlink: src/frontend/web → apps/client"
fi

# Shared symlink
if [ -d "$PROJECT_ROOT/packages/shared" ] && [ ! -L "$PROJECT_ROOT/src/backend/shared" ]; then
    ln -s ../../packages/shared "$PROJECT_ROOT/src/backend/shared"
    print_step "Created symlink: src/backend/shared → packages/shared"
fi

# Clean up empty directories
print_header "Cleaning Up Empty Directories"

cleanup_empty_dir() {
    if [ -d "$1" ] && [ -z "$(find "$1" -type f 2>/dev/null)" ]; then
        rmdir "$1" 2>/dev/null || true
        print_step "Removed empty directory: $1"
    fi
}

cleanup_empty_dir "$PROJECT_ROOT/tests/data"
cleanup_empty_dir "$PROJECT_ROOT/test-results"

# Create documentation index
print_header "Creating Documentation Index"

cat > "$PROJECT_ROOT/docs/README.md" << 'EOF'
# zBhaga Documentation

Complete documentation for the zBhaga expense splitting application.

## Quick Links

- **[Getting Started](./setup/)** - Installation and setup guides
- **[Testing Guide](./testing/)** - Complete testing documentation
- **[API Documentation](./api/)** - API endpoints and integration
- **[Architecture](./architecture/)** - System design and architecture
- **[Deployment](./deployment/)** - Deployment procedures
- **[Contributing](./contributing/)** - Contributing guidelines

## Testing Documentation

- [Cucumber Setup](./testing/CUCUMBER_SETUP.md) - Full Cucumber reference
- [Quick Start](./testing/CUCUMBER_QUICK_START.md) - 5-minute quick start
- [Testing Guide](./testing/TESTING_GUIDE.md) - Complete testing guide
- [Screenshots Guide](./testing/SCREENSHOTS_GUIDE.md) - Visual test documentation
- [Cleanup Script](./testing/CLEANUP_SCRIPT_GUIDE.md) - Database cleanup automation

## Folder Structure

```
docs/
├── testing/           # Test documentation
├── api/              # API docs
├── architecture/     # Design docs
├── deployment/       # Deploy guides
├── setup/            # Setup guides
└── contributing/     # Contributing guidelines
```

## Topics

### Testing
- Cucumber/Gherkin BDD tests
- Playwright end-to-end tests
- Screenshot documentation
- Test database cleanup

### Development
- Frontend development
- Backend API development
- Database schema management
- Shared utilities

### Operations
- Deployment procedures
- Database management
- Monitoring and logging
- Backup procedures

---

Last updated: $(date '+%Y-%m-%d')
EOF

print_step "Created docs/README.md"

# Summary
print_header "Migration Complete ✓"

echo ""
echo "New folder structure created:"
echo "  ✓ docs/              - All documentation"
echo "  ✓ src/               - Source code (with symlinks)"
echo "  ✓ tests/             - All tests (organized by type)"
echo "  ✓ database/          - Database files"
echo "  ✓ config/            - Configuration files"
echo "  ✓ scripts/           - Build/utility scripts"
echo "  ✓ .github/workflows/ - CI/CD workflows"
echo ""

echo "Next steps:"
echo "  1. Review the new structure: ls -la"
echo "  2. Verify tests still work: npm run test"
echo "  3. Update any CI/CD references if needed"
echo "  4. Commit the changes: git add . && git commit -m 'refactor: reorganize folder structure'"
echo ""

echo -e "${GREEN}Migration successful!${NC}"
