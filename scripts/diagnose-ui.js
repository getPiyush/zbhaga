#!/usr/bin/env node

/**
 * UI Diagnostic Tool
 * Fetches the actual login page and identifies element selectors
 */

const http = require('http');
const https = require('https');

const appUrl = process.env.APP_URL || 'http://localhost:8081';

console.log(`\n🔍 Diagnosing UI at: ${appUrl}\n`);

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

function extractElements(html) {
  const elements = {};

  // Find input elements
  const inputRegex = /<input[^>]*(?:data-testid="([^"]*)")?[^>]*(?:name="([^"]*)")?[^>]*(?:id="([^"]*)")?[^>]*(?:type="([^"]*)")?[^>]*>/g;
  let match;

  console.log('📝 Found Input Elements:');
  while ((match = inputRegex.exec(html)) !== null) {
    const [fullMatch, testid, name, id, type] = match;
    console.log(`  • ${fullMatch.substring(0, 80)}...`);
    console.log(`    └─ data-testid: ${testid || '(none)'}`);
    console.log(`    └─ name: ${name || '(none)'}`);
    console.log(`    └─ id: ${id || '(none)'}`);
    console.log(`    └─ type: ${type || '(none)'}\n`);
  }

  // Find buttons
  const buttonRegex = /<button[^>]*(?:data-testid="([^"]*)")?[^>]*>([^<]*)</g;
  console.log('🔘 Found Button Elements:');
  while ((match = buttonRegex.exec(html)) !== null) {
    const [fullMatch, testid, text] = match;
    console.log(`  • ${text.trim()}`);
    console.log(`    └─ data-testid: ${testid || '(none)'}`);
    console.log(`    └─ HTML: ${fullMatch.substring(0, 60)}...\n`);
  }

  // Extract forms
  const formRegex = /<form[^>]*>[\s\S]*?<\/form>/g;
  console.log('📋 Found Forms:');
  while ((match = formRegex.exec(html)) !== null) {
    const form = match[0];
    // Look for inputs in this form
    const formInputs = form.match(/<input[^>]*/g) || [];
    console.log(`  • Form with ${formInputs.length} inputs`);
    formInputs.forEach(input => {
      console.log(`    └─ ${input.substring(0, 60)}...`);
    });
  }

  return elements;
}

async function main() {
  try {
    console.log(`🌐 Fetching page: ${appUrl}/auth/signin\n`);

    const html = await fetchPage(`${appUrl}/auth/signin`);

    if (!html || html.length === 0) {
      console.log('❌ No content received. Is the app running?');
      console.log('\nTo start the app:');
      console.log('  npm run dev:web');
      process.exit(1);
    }

    if (html.includes('cannot GET')) {
      console.log('❌ Page not found (404)');
      console.log('App is running but /auth/signin route not found');
      process.exit(1);
    }

    console.log('✅ Page fetched successfully\n');
    console.log(`📊 Page size: ${html.length} bytes\n`);

    extractElements(html);

    // Save HTML for inspection
    const fs = require('fs');
    fs.writeFileSync('/tmp/login-page.html', html);
    console.log('\n💾 Full page saved to: /tmp/login-page.html');
    console.log('   (Open in browser to inspect elements)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the web app is running:');
    console.log('   npm run dev:web');
    console.log('\n2. Check if the app is on port 8081:');
    console.log('   curl http://localhost:8081');
    console.log('\n3. Try a different port:');
    console.log('   APP_URL=http://localhost:3000 node scripts/diagnose-ui.js');
    process.exit(1);
  }
}

main();
