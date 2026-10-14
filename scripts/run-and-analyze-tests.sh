#!/bin/bash

###############################################################################
# Comprehensive Test Execution & Issue Analysis Script
#
# This script:
# 1. Ensures clean environment
# 2. Starts API and Web app
# 3. Runs Cucumber tests
# 4. Captures all output
# 5. Analyzes for application issues
# 6. Generates issue report
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/test-logs"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TEST_LOG="$LOG_DIR/test-run-$TIMESTAMP.log"
ISSUE_REPORT="$LOG_DIR/issues-$TIMESTAMP.md"
API_URL="http://localhost:4000"
APP_URL="http://localhost:8081"

# Create log directory
mkdir -p "$LOG_DIR"

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
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

# Phase 1: Cleanup
print_header "Phase 1: Environment Cleanup"

cd "$PROJECT_ROOT"

echo "Cleaning test data..."
npm run cleanup -- --verbose > /dev/null 2>&1 || true
print_step "Test data cleaned"

echo "Killing any existing processes..."
pkill -f "node.*dev" || true
pkill -f "npm.*run" || true
sleep 2
print_step "Processes terminated"

# Phase 2: Health Checks
print_header "Phase 2: Pre-Flight Checks"

echo "Checking Node.js..."
node -v
print_step "Node.js ready"

echo "Checking npm..."
npm -v
print_step "npm ready"

echo "Checking dependencies..."
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    print_error "Dependencies not installed. Run: npm install"
    exit 1
fi
print_step "Dependencies ready"

# Phase 3: Start Services
print_header "Phase 3: Starting Services"

echo "Starting API server..."
cd "$PROJECT_ROOT"
npm run dev:api > "$LOG_DIR/api-$TIMESTAMP.log" 2>&1 &
API_PID=$!
print_step "API started (PID: $API_PID)"

echo "Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s "$API_URL/health" > /dev/null 2>&1; then
        print_step "API is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "API failed to start"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo "Starting Web app..."
npm run dev:web > "$LOG_DIR/web-$TIMESTAMP.log" 2>&1 &
WEB_PID=$!
print_step "Web app started (PID: $WEB_PID)"

echo "Waiting for Web app to be ready..."
for i in {1..30}; do
    if curl -s "$APP_URL" > /dev/null 2>&1; then
        print_step "Web app is responding"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Web app failed to start"
        kill $API_PID $WEB_PID 2>/dev/null || true
        exit 1
    fi
    echo -n "."
    sleep 1
done

sleep 2

# Phase 4: Run Diagnostic
print_header "Phase 4: UI Diagnostics"

echo "Analyzing page structure..."
node "$PROJECT_ROOT/scripts/diagnose-ui.js" > "$LOG_DIR/diagnostic-$TIMESTAMP.log" 2>&1 || true
print_step "Diagnostic complete"

# Phase 5: Run Tests
print_header "Phase 5: Executing Cucumber Tests"

echo "Running tests (output: $TEST_LOG)..."
echo "Timestamp: $TIMESTAMP" > "$TEST_LOG"
echo "API URL: $API_URL" >> "$TEST_LOG"
echo "App URL: $APP_URL" >> "$TEST_LOG"
echo "" >> "$TEST_LOG"

npm run test:cucumber:feature >> "$TEST_LOG" 2>&1 || true

print_step "Test execution complete"
print_step "Log saved to: $TEST_LOG"

# Phase 6: Analyze Results
print_header "Phase 6: Analyzing Results for Issues"

echo "Analyzing test output for issues..."

# Initialize report
cat > "$ISSUE_REPORT" << 'EOF'
# Application Issues Analysis Report

**Generated:** $(date)
**Test Run:** TEST_TIMESTAMP_PLACEHOLDER
**Log File:** LOG_FILE_PLACEHOLDER

## Summary

EOF

# Count test results
TOTAL_STEPS=$(grep -c "✔\|✖\|⏭" "$TEST_LOG" || echo "0")
PASSED=$(grep -c "✔" "$TEST_LOG" || echo "0")
FAILED=$(grep -c "✖" "$TEST_LOG" || echo "0")
SKIPPED=$(grep -c "⏭" "$TEST_LOG" || echo "0")

{
    echo "- **Total Steps:** $TOTAL_STEPS"
    echo "- **Passed:** $PASSED"
    echo "- **Failed:** $FAILED"
    echo "- **Skipped:** $SKIPPED"
    echo ""
    if [ "$FAILED" -gt 0 ]; then
        echo "## 🔴 Failed Tests"
        echo ""
        grep -A 5 "✖" "$TEST_LOG" || true
        echo ""
    fi
    echo "## 📋 Errors Found"
    echo ""
    grep -i "error\|exception\|cannot\|not found" "$TEST_LOG" | head -20 || echo "No errors captured"
    echo ""
    echo "## ⚠️ Warnings"
    echo ""
    grep -i "warning\|deprecated\|timeout" "$TEST_LOG" | head -10 || echo "No warnings"
    echo ""
    echo "## 🔗 Related Files"
    echo ""
    echo "- Test Log: \`$TEST_LOG\`"
    echo "- API Log: \`$LOG_DIR/api-$TIMESTAMP.log\`"
    echo "- Web Log: \`$LOG_DIR/web-$TIMESTAMP.log\`"
    echo "- Diagnostic: \`$LOG_DIR/diagnostic-$TIMESTAMP.log\`"
    echo "- Report: \`cucumber-report.html\`"
    echo ""
    echo "## 📊 Statistics"
    echo ""
    if [ -f "cucumber-report.html" ]; then
        echo "HTML report generated: \`cucumber-report.html\`"
    fi
    if [ -f "cucumber-report.json" ]; then
        SCENARIOS=$(grep -o '"name"' cucumber-report.json | wc -l)
        echo "Scenarios analyzed: $SCENARIOS"
    fi
} >> "$ISSUE_REPORT"

# Update placeholders
sed -i "" "s|TEST_TIMESTAMP_PLACEHOLDER|$TIMESTAMP|g" "$ISSUE_REPORT"
sed -i "" "s|LOG_FILE_PLACEHOLDER|$TEST_LOG|g" "$ISSUE_REPORT"

print_step "Issue report generated: $ISSUE_REPORT"

# Phase 7: Summary
print_header "Phase 7: Test Summary"

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "Total steps executed: $TOTAL_STEPS"
    echo "Passed: $PASSED"
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo "Total steps: $TOTAL_STEPS"
    echo "Passed: $PASSED"
    echo "Failed: $FAILED"
    echo "Skipped: $SKIPPED"
    echo ""
    echo -e "${YELLOW}Review the following files:${NC}"
    echo "  1. Test log: $TEST_LOG"
    echo "  2. Issue report: $ISSUE_REPORT"
    echo "  3. HTML report: cucumber-report.html"
    echo "  4. API log: $LOG_DIR/api-$TIMESTAMP.log"
    echo "  5. Web log: $LOG_DIR/web-$TIMESTAMP.log"
fi

# Phase 8: Cleanup Services
print_header "Phase 8: Cleanup"

echo "Stopping services..."
kill $API_PID 2>/dev/null || true
kill $WEB_PID 2>/dev/null || true
sleep 2
print_step "Services stopped"

# Final Summary
print_header "Test Run Complete"

echo "📊 Results Summary:"
echo "  Total Steps: $TOTAL_STEPS"
echo "  ✓ Passed: $PASSED"
echo "  ✖ Failed: $FAILED"
echo "  ⏭ Skipped: $SKIPPED"
echo ""
echo "📁 Log Files:"
echo "  Test Log:     $TEST_LOG"
echo "  Issue Report: $ISSUE_REPORT"
echo "  API Log:      $LOG_DIR/api-$TIMESTAMP.log"
echo "  Web Log:      $LOG_DIR/web-$TIMESTAMP.log"
echo ""
echo "📈 HTML Report:"
echo "  open cucumber-report.html"
echo ""

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Status: FAILED${NC} (See logs above)"
    exit 1
else
    echo -e "${GREEN}Status: SUCCESS${NC}"
    exit 0
fi
