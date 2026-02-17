#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Building Next.js application...');
  const nextPath = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
  execSync(`${nextPath} build`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
