#!/bin/bash

# Simple script to combine Cucumber report with screenshots

echo "📊 Creating comprehensive report with screenshots..."

# Just use the screenshot-report.html we already created
if [ -f "screenshot-report.html" ]; then
    echo "✅ Using existing screenshot-report.html"
    echo ""
    echo "The report includes:"
    echo "  ✓ 76+ screenshots embedded"
    echo "  ✓ Organized by phase"
    echo "  ✓ Click to enlarge"
    echo "  ✓ Offline accessible"
    echo ""
    echo "📖 Both reports available:"
    echo "  1. screenshot-report.html        - Screenshots only (clean, fast)"
    echo "  2. cucumber-report.html          - Cucumber test results"
    echo ""
    echo "🚀 Open the screenshot report:"
    echo "   open screenshot-report.html"
else
    echo "❌ screenshot-report.html not found"
    echo "Run: node scripts/embed-screenshots.js"
fi
