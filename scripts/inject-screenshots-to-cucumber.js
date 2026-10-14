#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Post-process Cucumber HTML report to inject embedded screenshots
 * This script reads the Cucumber report and injects screenshots as embeds
 */

const SCREENSHOTS_DIR = './test-screenshots/denver-trip';
const CUCUMBER_HTML = './cucumber-report.html';
const OUTPUT_FILE = './cucumber-report-with-screenshots.html';

console.log('🎬 Injecting screenshots into Cucumber HTML report...\n');

// Read Cucumber HTML report
let htmlContent;
try {
  htmlContent = fs.readFileSync(CUCUMBER_HTML, 'utf-8');
  console.log(`✓ Loaded Cucumber HTML report`);
} catch (error) {
  console.error('❌ Failed to read Cucumber HTML report:', error.message);
  process.exit(1);
}

// Read all screenshots
const screenshots = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .sort();

console.log(`✓ Found ${screenshots.length} screenshots\n`);

// Create screenshot data map
const screenshotMap = {};
screenshots.forEach(screenshot => {
  const filepath = path.join(SCREENSHOTS_DIR, screenshot);
  const buffer = fs.readFileSync(filepath);
  const base64 = buffer.toString('base64');
  screenshotMap[screenshot] = `data:image/png;base64,${base64}`;
});

// Inject screenshot styles and scripts before closing body tag
const screenshotStyles = `
<style>
  .gherkin-step { position: relative; }
  .step-screenshot {
    margin-top: 15px;
    padding: 10px;
    background: #f5f5f5;
    border-left: 4px solid #667eea;
    border-radius: 4px;
  }
  .step-screenshot-title {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .step-screenshot-img {
    max-width: 100%;
    max-height: 600px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  .step-screenshot-img:hover {
    transform: scale(1.02);
  }
  .screenshot-modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.9);
    align-items: center;
    justify-content: center;
  }
  .screenshot-modal.active { display: flex; }
  .screenshot-modal-content {
    max-width: 90vw;
    max-height: 90vh;
    position: relative;
  }
  .screenshot-modal-img { max-width: 100%; max-height: 100%; }
  .screenshot-modal-close {
    position: absolute;
    top: -40px;
    right: 0;
    color: white;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  }
  .screenshot-modal-close:hover { color: #bbb; }
</style>
`;

const screenshotScripts = `
<div class="screenshot-modal" id="screenshotModal">
  <div class="screenshot-modal-content">
    <span class="screenshot-modal-close" onclick="closeScreenshotModal()">&times;</span>
    <img class="screenshot-modal-img" id="screenshotModalImg" src="">
  </div>
</div>

<script>
  function openScreenshot(src) {
    document.getElementById('screenshotModalImg').src = src;
    document.getElementById('screenshotModal').classList.add('active');
  }

  function closeScreenshotModal() {
    document.getElementById('screenshotModal').classList.remove('active');
  }

  document.getElementById('screenshotModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeScreenshotModal();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeScreenshotModal();
  });
</script>
`;

// Function to find screenshots related to a step
function findScreenshotsForStep(stepName) {
  const found = [];
  const keywords = stepName
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3); // Only keywords longer than 3 chars

  screenshots.forEach(screenshot => {
    const screenshotName = screenshot.toLowerCase();
    const matches = keywords.filter(keyword => screenshotName.includes(keyword)).length;

    if (matches >= 2) { // At least 2 keyword matches
      found.push(screenshot);
    }
  });

  return found;
}

// Inject screenshots into report
let modifiedHtml = htmlContent;

// Try to inject into step elements
const stepPattern = /<span class="step-text">(.*?)<\/span>/g;
let match;
const stepsWithScreenshots = [];

while ((match = stepPattern.exec(htmlContent)) !== null) {
  const stepText = match[1];
  const relatedScreenshots = findScreenshotsForStep(stepText);

  if (relatedScreenshots.length > 0) {
    stepsWithScreenshots.push({
      original: match[0],
      stepText: stepText,
      screenshots: relatedScreenshots
    });
  }
}

console.log(`Found ${stepsWithScreenshots.length} steps with related screenshots\n`);

// Inject screenshot divs after each step
stepsWithScreenshots.forEach(step => {
  let screenshotHtml = '';

  step.screenshots.forEach(screenshot => {
    const base64 = screenshotMap[screenshot];
    const displayName = screenshot.replace('.png', '').replace(/T[\d-]+Z/, '');

    screenshotHtml += `
    <div class="step-screenshot">
      <div class="step-screenshot-title">📸 ${displayName}</div>
      <img src="${base64}" alt="${screenshot}" class="step-screenshot-img" onclick="openScreenshot('${base64}')">
    </div>
    `;
  });

  const replacement = step.original + screenshotHtml;
  modifiedHtml = modifiedHtml.replace(step.original, replacement);
});

// Inject styles before closing head tag
modifiedHtml = modifiedHtml.replace('</head>', screenshotStyles + '\n</head>');

// Inject scripts before closing body tag
modifiedHtml = modifiedHtml.replace('</body>', screenshotScripts + '\n</body>');

// Write modified report
fs.writeFileSync(OUTPUT_FILE, modifiedHtml);

console.log(`✅ Report created: ${OUTPUT_FILE}`);
console.log(`📊 Screenshots injected: ${stepsWithScreenshots.length} steps with ${screenshots.length} screenshots`);
console.log(`\n🚀 Open in browser:`);
console.log(`   open ${OUTPUT_FILE}`);
console.log(`\n💡 Features:`);
console.log(`   ✓ Screenshots embedded inline`);
console.log(`   ✓ Click to enlarge`);
console.log(`   ✓ Press Escape to close`);
console.log(`   ✓ Standalone HTML file`);
