#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('[v0] Clearing Next.js build cache...');

try {
  // Remove .next directory
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[v0] Removed .next directory');
  }

  // Remove .vercel directory if exists
  const vercelDir = path.join(process.cwd(), '.vercel');
  if (fs.existsSync(vercelDir)) {
    fs.rmSync(vercelDir, { recursive: true, force: true });
    console.log('[v0] Removed .vercel directory');
  }

  console.log('[v0] Build cache cleared successfully!');
  console.log('[v0] Next.js will rebuild on next access');
  process.exit(0);
} catch (error) {
  console.error('[v0] Error clearing cache:', error.message);
  process.exit(1);
}
