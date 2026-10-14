#!/usr/bin/env node

const playwright = require('@playwright/test');

async function debugPage() {
  console.log('🔍 Debugging page content...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });

    // Wait a bit for page to load
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded\n');

    // Take screenshot of login page
    await page.screenshot({ path: '/tmp/debug-01-login.png', fullPage: true });
    console.log('📸 Screenshot saved: /tmp/debug-01-login.png\n');

    // Log in
    console.log('📝 Logging in as Frank...');
    await page.fill('input[placeholder*="email"], input[name*="email"]', 'frank.denver@test.com');
    await page.fill('input[placeholder*="password"], input[name*="password"]', 'TestPass456!');

    // Find and click signin button
    const signinButtons = await page.$$('button, [role="button"]');
    console.log(`Found ${signinButtons.length} buttons on login page\n`);

    for (let i = 0; i < signinButtons.length; i++) {
      const text = await signinButtons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
    }

    // Click first button (should be signin)
    await signinButtons[0].click();
    console.log('\n🔘 Clicked signin button');

    // Wait for navigation
    console.log('⏳ Waiting for navigation...');
    await page.waitForTimeout(3000);

    console.log(`📍 Current URL: ${page.url()}\n`);

    // Take screenshot of home page
    await page.screenshot({ path: '/tmp/debug-02-home.png', fullPage: true });
    console.log('📸 Screenshot saved: /tmp/debug-02-home.png\n');

    // Check all buttons on home page
    console.log('🔍 Buttons on home page:');
    const homeButtons = await page.$$('button, [role="button"]');
    console.log(`Found ${homeButtons.length} buttons\n`);

    for (let i = 0; i < homeButtons.length; i++) {
      const text = await homeButtons[i].textContent();
      const testid = await homeButtons[i].getAttribute('testid');
      const dataTestid = await homeButtons[i].getAttribute('data-testid');
      console.log(`  Button ${i}:`);
      console.log(`    text: "${text}"`);
      console.log(`    testid: ${testid}`);
      console.log(`    data-testid: ${dataTestid}`);
    }

    // Check for testid="create-group-button"
    console.log('\n🔎 Searching for create-group-button...');
    try {
      const createBtn = await page.$('[testid="create-group-button"]');
      if (createBtn) {
        console.log('✅ Found: [testid="create-group-button"]');
        const text = await createBtn.textContent();
        console.log(`   Text: "${text}"`);
      } else {
        console.log('❌ NOT found: [testid="create-group-button"]');
      }
    } catch (e) {
      console.log(`❌ Error searching: ${e.message}`);
    }

    // Check page content
    console.log('\n📄 Page HTML (first 2000 chars):');
    const html = await page.content();
    console.log(html.substring(0, 2000));

    console.log('\n\n📄 Page HTML (searching for "Create" or "Group"):');
    const lines = html.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('Create') || line.includes('create') || line.includes('Group') || line.includes('group')) {
        console.log(`Line ${idx}: ${line.substring(0, 150)}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugPage();
