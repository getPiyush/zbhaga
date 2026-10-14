#!/usr/bin/env node

const playwright = require('@playwright/test');

async function debug() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    // Go to auth page
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Get all input fields and try to find email field
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input fields\n`);

    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}"`);
    }

    // Try different selectors for email
    console.log('\nTrying different email selectors:');
    let emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      console.log('✅ Found: input[type="email"]');
      await emailInput.fill('frank.denver@test.com');
    } else {
      console.log('❌ input[type="email"] not found');
    }

    // Find password field
    let passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      console.log('✅ Found: input[type="password"]');
      await passwordInput.fill('TestPass456!');
    } else {
      console.log('❌ input[type="password"] not found');
    }

    // Find and click signin button
    const buttons = await page.$$('button');
    console.log(`\nFound ${buttons.length} buttons`);

    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      console.log(`  Button ${i}: "${text}"`);
      if (text.includes('Sign')) {
        console.log(`  → Clicking button ${i}`);
        await buttons[i].click();
        break;
      }
    }

    console.log('\n⏳ Waiting for navigation to home page...');
    await page.waitForTimeout(3000);

    console.log(`📍 URL: ${page.url()}\n`);

    // Check what's on home page
    const homeButtons = await page.$$('button');
    console.log(`Found ${homeButtons.length} buttons on home page:\n`);

    for (let i = 0; i < homeButtons.length; i++) {
      const text = await homeButtons[i].textContent();
      const testid = await homeButtons[i].getAttribute('testid');
      const onclick = await homeButtons[i].getAttribute('onclick');
      console.log(`Button ${i}:`);
      console.log(`  text: "${text}"`);
      console.log(`  testid: ${testid}`);
      if (onclick) console.log(`  onclick: ${onclick.substring(0, 50)}`);
    }

    // Try to find by testid
    console.log('\n🔎 Searching for [testid="create-group-button"]');
    const createBtn = await page.$('[testid="create-group-button"]');
    console.log(createBtn ? '✅ FOUND' : '❌ NOT FOUND');

    // Get entire page HTML to check
    const html = await page.content();
    const hasTestid = html.includes('testid="create-group-button"');
    console.log(`\nHTML contains 'testid="create-group-button"': ${hasTestid ? '✅ YES' : '❌ NO'}`);

    // Save screenshot
    await page.screenshot({ path: '/tmp/debug-home.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/debug-home.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debug();
