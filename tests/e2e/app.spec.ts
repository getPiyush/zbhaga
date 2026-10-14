import { test } from '@playwright/test';

test('Show all console messages', async ({ page }) => {
  const consoleMessages: { type: string; text: string }[] = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('====== ALL CONSOLE MESSAGES ======');
  consoleMessages.forEach((msg, idx) => {
    console.log(`[${idx}] ${msg.type.toUpperCase()}: ${msg.text.substring(0, 200)}`);
  });

  console.log('\n====== ERRORS ONLY ======');
  const errors = consoleMessages.filter(m => m.type === 'error');
  errors.forEach(err => {
    console.log(`ERROR: ${err.text}`);
  });
});
