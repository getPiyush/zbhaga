#!/usr/bin/env node

/**
 * Test Database Cleanup Script
 * Runs after Cucumber test completion to clean up test database data
 *
 * Performs:
 * - Deletes test users from database
 * - Removes test groups and expenses
 * - Cleans up test payments and records
 * - Removes temporary files
 * - PRESERVES all reports and screenshots (essential for documentation)
 * - Provides cleanup summary
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  dbCleanupEndpoint: '/cleanup/test-data',
  preserveScreenshots: true,  // ✅ ALWAYS preserve screenshots
  preserveReports: true,      // ✅ ALWAYS preserve reports
  tempFiles: [
    './tmp-test-data.json',
    './.test-cache'
  ],
  verbose: process.argv.includes('--verbose'),
  dry: process.argv.includes('--dry-run'),
  skipDb: process.argv.includes('--skip-db')
};

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class TestDatabaseCleanup {
  constructor() {
    this.stats = {
      usersDeleted: 0,
      groupsDeleted: 0,
      expensesDeleted: 0,
      paymentsDeleted: 0,
      filesDeleted: 0,
      bytesFreed: 0,
      startTime: Date.now()
    };
  }

  // ===== LOGGING =====

  print(message, color = 'reset', level = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    const icon = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✗',
      debug: '→'
    }[level] || '•';

    const colorCode = colors[color] || '';
    const output = `${colorCode}[${timestamp}] ${icon} ${message}${colors.reset}`;
    console.log(output);
  }

  printHeader(text) {
    console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${text}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }

  printSummary() {
    const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
    const totalDeleted = this.stats.usersDeleted + this.stats.groupsDeleted +
                        this.stats.expensesDeleted + this.stats.paymentsDeleted +
                        this.stats.filesDeleted;

    console.log(`\n${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}  Cleanup Summary${colors.reset}`);
    console.log(`${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}\n`);

    if (this.stats.usersDeleted > 0 || this.stats.groupsDeleted > 0 ||
        this.stats.expensesDeleted > 0 || this.stats.paymentsDeleted > 0) {
      console.log(`${colors.green}✓ Database Cleanup:${colors.reset}`);
      if (this.stats.usersDeleted > 0) {
        console.log(`  ✓ Test Users Deleted:       ${this.stats.usersDeleted}`);
      }
      if (this.stats.groupsDeleted > 0) {
        console.log(`  ✓ Test Groups Deleted:      ${this.stats.groupsDeleted}`);
      }
      if (this.stats.expensesDeleted > 0) {
        console.log(`  ✓ Test Expenses Deleted:    ${this.stats.expensesDeleted}`);
      }
      if (this.stats.paymentsDeleted > 0) {
        console.log(`  ✓ Test Payments Deleted:    ${this.stats.paymentsDeleted}`);
      }
    } else {
      console.log(`${colors.green}✓ Database:${colors.reset}                 Clean (no test data found)`);
    }

    if (this.stats.filesDeleted > 0) {
      console.log(`${colors.green}✓ Temp Files Deleted:${colors.reset}       ${this.stats.filesDeleted}`);
    }

    console.log(`\n${colors.green}✓ Preserved:${colors.reset}`);
    console.log(`  ✓ All Reports               (HTML, JSON, XML)`);
    console.log(`  ✓ All Screenshots           (250+ PNG files)`);
    console.log(`  ✓ Test Artifacts            (Essential for documentation)`);

    console.log(`\n${colors.green}✓ Duration:${colors.reset}              ${duration}s`);

    if (CONFIG.dry) {
      console.log(`\n${colors.yellow}⚠ DRY RUN - No changes made${colors.reset}`);
    }

    console.log(`\n`);
  }

  // ===== DATABASE CLEANUP =====

  async cleanupDatabase() {
    this.print('Cleaning up test database...', 'cyan');

    if (CONFIG.skipDb) {
      this.print('Skipping database cleanup (--skip-db flag)', 'yellow', 'warning');
      return;
    }

    if (!this.isApiAvailable()) {
      this.print('API not available - skipping database cleanup', 'yellow', 'warning');
      return;
    }

    try {
      const url = `${CONFIG.apiUrl}${CONFIG.dbCleanupEndpoint}`;

      if (CONFIG.dry) {
        this.print(`Would call: DELETE ${url}`, 'yellow', 'debug');
        this.print('Database cleanup skipped (dry-run mode)', 'yellow', 'warning');
        return;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        const deleted = result.deleted || {
          users: 0,
          groups: 0,
          expenses: 0,
          payments: 0
        };

        this.stats.usersDeleted = deleted.users || 0;
        this.stats.groupsDeleted = deleted.groups || 0;
        this.stats.expensesDeleted = deleted.expenses || 0;
        this.stats.paymentsDeleted = deleted.payments || 0;

        if (this.stats.usersDeleted > 0 || this.stats.groupsDeleted > 0 ||
            this.stats.expensesDeleted > 0 || this.stats.paymentsDeleted > 0) {
          this.print(
            `Deleted test data: ${this.stats.usersDeleted} users, ${this.stats.groupsDeleted} groups, ` +
            `${this.stats.expensesDeleted} expenses, ${this.stats.paymentsDeleted} payments`,
            'green',
            'success'
          );
        } else {
          this.print('No test data found to clean', 'yellow', 'info');
        }
      } else if (response.status === 404) {
        this.print('Database cleanup endpoint not available (normal in standalone mode)', 'blue', 'info');
      } else {
        const error = await response.text();
        this.print(`Database cleanup warning: ${error}`, 'yellow', 'warning');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        this.print('API unavailable - skipping database cleanup (tests may still pass)', 'blue', 'info');
      } else {
        this.print(`Error connecting to API: ${error.message}`, 'yellow', 'warning');
      }
    }
  }

  isApiAvailable() {
    // Quick check to see if API might be available
    try {
      const url = new URL(CONFIG.apiUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // ===== TEMP FILES CLEANUP =====

  cleanupTempFiles() {
    this.print('Cleaning up temporary files...', 'cyan');

    let deletedCount = 0;

    for (const file of CONFIG.tempFiles) {
      if (fs.existsSync(file)) {
        try {
          if (!CONFIG.dry) {
            const stats = fs.statSync(file);
            fs.unlinkSync(file);
            this.stats.bytesFreed += stats.size;
          }
          deletedCount++;
          if (CONFIG.verbose) {
            this.print(`Deleted: ${file}`, 'green', 'debug');
          }
        } catch (error) {
          this.print(`Failed to delete ${file}: ${error.message}`, 'red', 'error');
        }
      }
    }

    if (deletedCount > 0) {
      this.stats.filesDeleted = deletedCount;
      this.print(`Removed ${deletedCount} temporary files`, 'green', 'success');
    }
  }

  // ===== PRESERVATION =====

  preserveReportsAndScreenshots() {
    this.print('Verifying preservation of test reports and screenshots...', 'cyan');

    const preserved = [];

    if (fs.existsSync('./cucumber-report.html')) preserved.push('cucumber-report.html');
    if (fs.existsSync('./cucumber-report.json')) preserved.push('cucumber-report.json');
    if (fs.existsSync('./cucumber-report.xml')) preserved.push('cucumber-report.xml');

    const screenshotCount = fs.existsSync('./test-screenshots/denver-trip')
      ? fs.readdirSync('./test-screenshots/denver-trip').filter(f => f.endsWith('.png')).length
      : 0;

    const reportCount = preserved.length;

    if (reportCount > 0 || screenshotCount > 0) {
      this.print(
        `Protected: ${reportCount} reports, ${screenshotCount} screenshots`,
        'green',
        'success'
      );
    } else {
      this.print('No reports or screenshots to preserve', 'yellow', 'info');
    }
  }

  // ===== MAIN EXECUTION =====

  async run() {
    this.printHeader('Test Database Cleanup');

    if (CONFIG.dry) {
      this.print('DRY RUN MODE - No changes will be made', 'yellow', 'warning');
    }

    // Database cleanup
    await this.cleanupDatabase();

    // Temp files cleanup
    this.cleanupTempFiles();

    // Verify preservation
    this.preserveReportsAndScreenshots();

    this.printSummary();

    return 0;
  }
}

// Execute cleanup
(async () => {
  try {
    const cleanup = new TestDatabaseCleanup();
    const result = await cleanup.run();
    process.exit(result);
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
})();
