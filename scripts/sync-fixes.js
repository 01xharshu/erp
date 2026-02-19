#!/usr/bin/env node

/**
 * This script syncs the corrected files from v0-project to v0-next-shadcn
 * to fix the Geist font error and add the new features
 * 
 * Run this from the root directory: node scripts/sync-fixes.js
 */

const fs = require('fs');
const path = require('path');

const sourceDir = '/vercel/share/v0-project';
const targetDir = '/vercel/share/v0-next-shadcn';

// Files to copy/sync
const filesToSync = [
  'package.json',
  'app/layout.tsx',
  'app/page.tsx',
  'tailwind.config.ts',
  'app/demo/page.tsx',
  'app/demo/layout.tsx',
  'components/landing-page.tsx',
  'components/theme-toggle.tsx',
  'components/mode-switcher.tsx',
  'components/mode-aware-content.tsx',
  'lib/mode-context.tsx',
];

console.log('Syncing corrected files from v0-project to v0-next-shadcn...\n');

filesToSync.forEach((file) => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  Source file not found: ${file}`);
      return;
    }
    
    // Create directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Synced: ${file}`);
  } catch (error) {
    console.error(`❌ Error syncing ${file}:`, error.message);
  }
});

console.log('\n✅ Sync complete!');
console.log('\nNext steps:');
console.log('1. rm -rf .next (clear build cache)');
console.log('2. npm install (install missing dependencies)');
console.log('3. npm run dev (restart dev server)');
console.log('4. Hard refresh browser (Ctrl+Shift+R)');
