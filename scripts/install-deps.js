import { execSync } from 'child_process';

console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}
