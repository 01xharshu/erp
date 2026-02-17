#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[v0] Checking project status...');

const projectDir = '/vercel/share/v0-project';
const nodeModulesPath = path.join(projectDir, 'node_modules');
const packageJsonPath = path.join(projectDir, 'package.json');

console.log('[v0] Project directory:', projectDir);
console.log('[v0] Package.json exists:', fs.existsSync(packageJsonPath));
console.log('[v0] node_modules exists:', fs.existsSync(nodeModulesPath));

if (!fs.existsSync(nodeModulesPath)) {
  console.log('[v0] Installing dependencies...');
  try {
    const result = execSync('cd /vercel/share/v0-project && npm install', {
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    console.log('[v0] npm install completed');
  } catch (error) {
    console.error('[v0] npm install failed:', error.message);
    process.exit(1);
  }
}

console.log('[v0] Checking if next is available...');
try {
  const nextPath = path.join(projectDir, 'node_modules/.bin/next');
  if (fs.existsSync(nextPath)) {
    console.log('[v0] next binary found at:', nextPath);
  } else {
    console.log('[v0] next binary not found, attempting to build anyway...');
  }
} catch (error) {
  console.error('[v0] Error checking next:', error.message);
}

console.log('[v0] Setup complete!');
