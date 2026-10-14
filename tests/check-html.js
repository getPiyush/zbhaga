#!/usr/bin/env node

const playwright = require('@playwright/test');

async function checkHTML() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    // Go to login
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Get HTML
    let html = await page.content();

    // Find the Sign In button in HTML
    console.log('🔍 Searching for "Sign In" button in HTML...\n');

    const lines = html.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('Sign') && (line.includes('button') || line.includes('div') || line.includes('onclick'))) {
        console.log(`Line ${idx}: ${line.substring(0, 200)}`);
      }
    });

    console.log('\n\n🔍 All clickable divs:\n');
    const divs = await page.$$('div[role="button"], div[class*="button"]');
    console.log(`Found ${divs.length} button-like divs\n`);

    for (let i = 0; i < divs.length && i < 10; i++) {
      const text = await divs[i].textContent();
      const html = await divs[i].evaluate(el => el.outerHTML.substring(0, 200));
      console.log(`Div ${i}: "${text}"`);
      console.log(`  HTML: ${html}\n`);
    }

    // Try clicking Sign In button with text
    console.log('🔘 Trying to click "Sign In" button by text...');
    try {
      await page.click('text=Sign In');
      console.log('✅ Clicked "Sign In" text');
    } catch (e) {
      console.log(`❌ Failed to click by text: ${e.message}`);

      // Try other selectors
      const buttons = await page.$$('[role="button"], button, div[onclick]');
      console.log(`\nFound ${buttons.length} possible click targets`);

      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        if (text.includes('Sign')) {
          console.log(`✅ Found Sign button at index ${i}: "${text}"`);
          console.log(`   Clicking it...`);
          await buttons[i].click();
          break;
        }
      }
    }

    console.log('\n⏳ Waiting after click...');
    await page.waitForTimeout(2000);

    console.log(`📍 URL after click: ${page.url()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkHTML();
