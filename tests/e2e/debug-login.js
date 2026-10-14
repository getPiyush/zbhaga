#!/usr/bin/env node

const playwright = require('@playwright/test');

async function debugLogin() {
  console.log('🔍 Debugging login flow...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Capture all network requests and responses
  page.on('response', async (response) => {
    if (response.url().includes('/auth') || response.url().includes('4000')) {
      console.log(`\n📡 ${response.status()} ${response.request().method()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log(`   Response: ${body.substring(0, 200)}`);
      } catch (e) {
        console.log(`   (Could not read body)`);
      }
    }
  });

  page.on('request', (request) => {
    if (request.url().includes('/auth') || request.url().includes('4000')) {
      console.log(`\n→ ${request.method()} ${request.url()}`);
      try {
        const postData = request.postData();
        if (postData) console.log(`   Body: ${postData.substring(0, 200)}`);
      } catch (e) {
        // ignore
      }
    }
  });

  try {
    console.log('📱 Loading signin page...\n');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n📝 Entering credentials...\n');
    await page.fill('input[type="email"]', 'frank.denver@test.com');
    await page.fill('input[type="password"]', 'TestPass456!');

    console.log('🔘 Clicking Sign In button...\n');

    // Click by text since testID doesn't work with React Native Web
    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }).catch(() => console.log('(No navigation detected)')),
      page.click('text=Sign In'),
    ]);

    await page.waitForTimeout(2000);

    console.log(`\n\n✅ Current URL: ${page.url()}`);
    console.log(`User logged in: ${page.url().includes('/auth') ? '❌ NO' : '✅ YES'}`);

    if (page.url().includes('/auth')) {
      console.log('\n❌ Login failed! Still on auth page.');
      console.log('Check above for error messages in responses.');
    } else {
      console.log('\n✅ Login successful! Can now test group creation.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugLogin();
