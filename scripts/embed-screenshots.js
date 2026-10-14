#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = './test-screenshots/denver-trip';
const OUTPUT_FILE = './screenshot-report.html';

console.log('🎬 Creating embedded screenshot report...\n');

// Get all screenshots
const screenshots = fs.readdirSync(SCREENSHOTS_DIR)
  .filter(f => f.endsWith('.png'))
  .sort();

console.log(`✓ Found ${screenshots.length} screenshots\n`);

// Build HTML
let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Denver Trip E2E - Screenshot Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.95; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        .stat-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-number { font-size: 2.5em; font-weight: 700; color: #667eea; margin-bottom: 5px; }
        .stat-label { font-size: 0.9em; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 40px; }
        .section-title {
            font-size: 1.8em;
            font-weight: 700;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
            color: #333;
        }
        .screenshots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .screenshot-card {
            background: white;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .screenshot-card:hover {
            border-color: #667eea;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
            transform: translateY(-4px);
        }
        .screenshot-filename {
            padding: 12px 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            font-size: 0.85em;
            font-weight: 600;
            color: #495057;
            word-break: break-all;
            font-family: 'Courier New', monospace;
        }
        .screenshot-img {
            width: 100%;
            height: auto;
            display: block;
            background: #f0f0f0;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal.active { display: flex; }
        .modal-content {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
        }
        .modal-img { max-width: 100%; max-height: 100%; border-radius: 8px; }
        .modal-close {
            position: absolute;
            top: -45px;
            right: 0;
            color: white;
            font-size: 2em;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
            font-weight: 300;
        }
        .footer {
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            padding: 30px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.8em; }
            .screenshots-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 Denver Trip E2E Test - Screenshot Report</h1>
            <p>Complete screenshot documentation with embedded images</p>
        </div>

        <div class="stats">
            <div class="stat-box">
                <div class="stat-number">${screenshots.length}</div>
                <div class="stat-label">Screenshots</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">6</div>
                <div class="stat-label">Test Phases</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">50+</div>
                <div class="stat-label">UI Actions</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">✓</div>
                <div class="stat-label">Highlighting</div>
            </div>
        </div>

        <div class="content">
            <h2 class="section-title">🖼️ All Screenshots (${screenshots.length})</h2>
            <div class="screenshots-grid">
`;

// Add screenshots
screenshots.forEach(screenshot => {
  const filepath = path.join(SCREENSHOTS_DIR, screenshot);
  const buffer = fs.readFileSync(filepath);
  const base64 = buffer.toString('base64');
  const displayName = screenshot.replace('.png', '').replace(/T[\d-]+Z/, '');

  html += `
                <div class="screenshot-card" onclick="openModal('data:image/png;base64,${base64}', '${screenshot}')">
                    <div class="screenshot-filename">${displayName}</div>
                    <img src="data:image/png;base64,${base64}" alt="${screenshot}" class="screenshot-img">
                </div>
`;
});

html += `
            </div>
        </div>

        <div class="footer">
            <p>📊 Denver Trip E2E Test Suite - Screenshot Documentation</p>
            <p>All ${screenshots.length} screenshots embedded in this HTML file</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
    </div>

    <div class="modal" id="modal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <img class="modal-img" id="modalImg" src="" alt="Screenshot">
        </div>
    </div>

    <script>
        function openModal(src, filename) {
            document.getElementById('modalImg').src = src;
            document.getElementById('modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeModal() {
            document.getElementById('modal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        document.getElementById('modal').addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeModal();
        });
    </script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, html);

const sizeInMB = (html.length / 1024 / 1024).toFixed(2);
console.log(`✅ Report created: ${OUTPUT_FILE}`);
console.log(`📊 File size: ${sizeInMB} MB`);
console.log(`\n🚀 Open in browser:`);
console.log(`   open ${OUTPUT_FILE}`);
console.log(`\n   or manually open: /Users/piyush/Development/zrugal/zbhaga/${OUTPUT_FILE}`);
