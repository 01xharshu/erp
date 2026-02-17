#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting fresh npm installation...');

try {
  // Change to project directory
  process.chdir('/vercel/share/v0-project');
  
  // Remove node_modules and package-lock if they exist
  if (fs.existsSync('node_modules')) {
    console.log('Removing existing node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('Removing existing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  
  // Fresh npm install
  console.log('Running npm install...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installation completed successfully!');
  
  // Verify next is installed
  if (fs.existsSync('node_modules/next')) {
    console.log('Next.js verified in node_modules');
  }
  
} catch (error) {
  console.error('Installation failed:', error.message);
  process.exit(1);
}
