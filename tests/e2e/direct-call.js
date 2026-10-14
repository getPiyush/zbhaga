#!/usr/bin/env node

const playwright = require('@playwright/test');

async function testDirectCall() {
  console.log('🧪 Testing if button works with different click methods...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Track API calls
  let apiCalled = false;
  page.on('response', async (response) => {
    if (response.url().includes('/auth/signin')) {
      apiCalled = true;
      console.log(`\n✅ API CALL DETECTED: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('Loading signin page...\n');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('Filling credentials...');
    await page.fill('input[type="email"]', 'frank.denver@test.com');
    await page.fill('input[type="password"]', 'TestPass456!');

    console.log('\n🧪 Method 1: Regular click()\n');
    let clicked = false;
    try {
      await page.click('text=Sign In', { force: true });
      clicked = true;
      console.log('  ✓ Click succeeded');
    } catch (e) {
      console.log(`  ✗ Click failed: ${e.message}`);
    }
    await page.waitForTimeout(2000);
    console.log(`  API call made: ${apiCalled ? '✅ YES' : '❌ NO'}`);

    if (!apiCalled) {
      console.log('\n🧪 Method 2: Press Enter\n');
      await page.press('input[type="password"]', 'Enter');
      await page.waitForTimeout(2000);
      console.log(`  API call made: ${apiCalled ? '✅ YES' : '❌ NO'}`);
    }

    if (!apiCalled) {
      console.log('\n🧪 Method 3: Double click\n');
      await page.dblclick('text=Sign In');
      await page.waitForTimeout(2000);
      console.log(`  API call made: ${apiCalled ? '✅ YES' : '❌ NO'}`);
    }

    if (!apiCalled) {
      console.log('\n🧪 Method 4: evaluate() to check onClick handler\n');
      const hasOnClick = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('div'));
        const signBtn = buttons.find(btn => btn.textContent?.includes('Sign In'));
        return {
          found: !!signBtn,
          onclick: signBtn?.onclick ? 'YES' : 'NO',
          html: signBtn?.outerHTML.substring(0, 200) || 'NOT FOUND'
        };
      });
      console.log('  Button info:', hasOnClick);
    }

    if (apiCalled) {
      console.log('\n\n✅ SUCCESS! Found working click method.');
    } else {
      console.log('\n\n❌ FAILED! Button is not responding.');
      console.log('This is likely a React Native Web issue with event handlers.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testDirectCall();
