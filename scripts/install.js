#!/usr/bin/env node
/**
 * Install all workspace dependencies.
 *
 * The root workspace installs normally. Child workspaces that need special
 * flags (like the client's --legacy-peer-deps) are handled after.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cwd = process.cwd();
console.log('📦 Installing zBhaga dependencies...\n');

try {
  // Install root dependencies
  console.log('📍 Root workspace...');
  execSync('npm install', { cwd, stdio: 'inherit' });

  // Install client with legacy-peer-deps (for react-native-web 0.19)
  const clientPath = path.join(cwd, 'apps', 'client');
  if (fs.existsSync(clientPath)) {
    console.log('\n📍 Client workspace (with --legacy-peer-deps)...');
    execSync('npm install --legacy-peer-deps', { cwd: clientPath, stdio: 'inherit' });
  }

  console.log('\n✅ All dependencies installed successfully!\n');
  console.log('Next steps:');
  console.log('  npm run setup    # Initialize database (one-time)');
  console.log('  npm run dev      # Start API and web app together');
} catch (error) {
  console.error('\n❌ Installation failed');
  process.exit(1);
}
