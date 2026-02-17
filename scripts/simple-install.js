const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = '/vercel/share/v0-project';

console.log('Starting npm installation...');
console.log('Current directory:', process.cwd());
console.log('Project directory:', projectDir);

try {
  // Check if package.json exists
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found at:', packageJsonPath);
    process.exit(1);
  }

  console.log('Found package.json');

  // Run npm install with absolute path
  console.log('Running npm install...');
  const result = execSync('cd ' + projectDir + ' && npm install', {
    stdio: 'inherit',
    shell: '/bin/bash'
  });

  console.log('npm install completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Installation error:', error.message);
  process.exit(1);
}
