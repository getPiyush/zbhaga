#!/usr/bin/env node

const playwright = require('@playwright/test');

async function checkConsole() {
  console.log('🔍 Checking browser console for errors...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    if (msg.type().includes('error') || msg.type().includes('warn')) {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  try {
    console.log('Loading signin page...\n');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\nEntering credentials...');
    await page.fill('input[type="email"]', 'frank.denver@test.com');
    await page.fill('input[type="password"]', 'TestPass456!');

    console.log('Clicking Sign In button...\n');
    await page.click('text=Sign In');
    await page.waitForTimeout(3000);

    console.log('\n📝 Checking for error text on page...');
    const errorText = await page.$eval('body', el => el.innerText).catch(() => null);
    if (errorText && errorText.includes('error')) {
      console.log('Found error text:');
      console.log(errorText);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkConsole();
