#!/usr/bin/env node

const playwright = require('@playwright/test');

async function checkAPIResponse() {
  console.log('🔍 Checking API response...\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Capture detailed API responses
  page.on('response', async (response) => {
    if (response.url().includes('/auth')) {
      console.log(`\n${response.status()} ${response.request().method()} ${response.url()}`);
      try {
        const body = await response.text();
        try {
          const json = JSON.parse(body);
          console.log('Response:', JSON.stringify(json, null, 2));
        } catch {
          console.log('Response:', body.substring(0, 500));
        }
      } catch (e) {
        console.log('(Could not read response)');
      }
    }
  });

  try {
    console.log('Loading signin page...');
    await page.goto('http://localhost:8081/auth/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('Filling and submitting form...\n');
    await page.fill('input[type="email"]', 'frank.denver@test.com');
    await page.fill('input[type="password"]', 'TestPass456!');
    await page.click('text=Sign In');

    console.log('\nWaiting for response...');
    await page.waitForTimeout(3000);

    console.log(`\nFinal URL: ${page.url()}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkAPIResponse();
