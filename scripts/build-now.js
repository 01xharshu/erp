#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('[v0] Building project from:', projectDir);
console.log('[v0] Current working directory:', process.cwd());

try {
  console.log('[v0] Running npm run build...');
  const output = execSync('npm run build', {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true
  });
  console.log('[v0] Build completed successfully!');
} catch (error) {
  console.error('[v0] Build failed:', error.message);
  process.exit(1);
}
