const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectPath = '/vercel/share/v0-next-shadcn';

console.log('[v0] Cleaning build cache...');

try {
  // Remove .next directory
  const nextDir = path.join(projectPath, '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[v0] Removed .next directory');
  }

  // Remove .vercel directory
  const vercelDir = path.join(projectPath, '.vercel');
  if (fs.existsSync(vercelDir)) {
    fs.rmSync(vercelDir, { recursive: true, force: true });
    console.log('[v0] Removed .vercel directory');
  }

  // Change to project directory and rebuild
  process.chdir(projectPath);
  console.log('[v0] Changed to:', projectPath);
  
  console.log('[v0] Running: npm run dev');
  // Note: npm run dev starts the dev server, not a production build
  // The dev server will auto-rebuild on file changes
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.log('[v0] Error during rebuild:', error.message);
  process.exit(1);
}
