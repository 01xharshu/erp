#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[v0] Cleaning build cache...');

// Remove .next directory
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('[v0] Removed .next directory');
}

// Remove .turbo directory if exists
const turboDir = path.join(process.cwd(), '.turbo');
if (fs.existsSync(turboDir)) {
  fs.rmSync(turboDir, { recursive: true, force: true });
  console.log('[v0] Removed .turbo directory');
}

console.log('[v0] Verifying layout.tsx imports...');
const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');

if (layoutContent.includes('from "geist/font"')) {
  console.error('[v0] ERROR: layout.tsx still has geist/font import!');
  process.exit(1);
} else if (layoutContent.includes('from "next/font/google"')) {
  console.log('[v0] ✓ layout.tsx correctly imports from next/font/google');
}

console.log('[v0] Checking package.json...');
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const hasInterFont = pkg.dependencies && Object.keys(pkg.dependencies).some(
  dep => dep.includes('inter') || dep.includes('font')
);
console.log(`[v0] Package has font dependencies: ${hasInterFont || 'using next/font/google'}`);

console.log('[v0] Build cache cleanup complete!');
console.log('[v0] Restart your dev server with: npm run dev');
