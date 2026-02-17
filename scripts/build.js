import { execSync } from 'child_process';

console.log('Building Next.js application...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
