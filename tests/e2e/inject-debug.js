#!/usr/bin/env node

const playwright = require('@playwright/test');

async function injectDebug() {
  console.log('🔍 Injecting debug code to check handleSignIn...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Intercept fetch to see all requests
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('localhost:4000') || url.includes('auth')) {
      console.log(`📡 [${route.request().method()}] ${url}`);
    }
    route.continue();
  });

  try {
    console.log('Loading signin page...\n');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('Filling credentials...');
    await page.fill('input[type="email"]', 'frank.denver@test.com');
    await page.fill('input[type="password"]', 'TestPass456!');

    console.log('\nClicking Sign In...\n');

    // Before clicking, check if click handler exists
    const btnInfo = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const signBtn = allDivs.find(d => d.textContent?.includes('Sign In'));

      // Try to find the click handler
      return {
        found: !!signBtn,
        textContent: signBtn?.textContent?.substring(0, 50) || null,
        hasOnClick: signBtn?.onclick ? true : false,
        className: signBtn?.className || 'no class',
        dataAttrs: Object.fromEntries(
          Array.from(signBtn?.attributes || [])
            .filter(a => a.name.startsWith('data'))
            .map(a => [a.name, a.value])
        )
      };
    });

    console.log('Button info:', btnInfo);

    // Now click and monitor
    console.log('\nClicking button...');
    await page.click('text=Sign In', { force: true });
    await page.waitForTimeout(2000);

    console.log(`\nFinal URL: ${page.url()}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

injectDebug();
