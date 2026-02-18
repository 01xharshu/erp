const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// The actual project being served
const projectRoot = '/vercel/share/v0-next-shadcn';
const nextDir = path.join(projectRoot, '.next');
const vercelDir = path.join(projectRoot, '.vercel');

console.log("[v0] Rebuilding from:", projectRoot);

if (fs.existsSync(nextDir)) {
  console.log("[v0] Removing .next directory...");
  fs.rmSync(nextDir, { recursive: true, force: true });
}

if (fs.existsSync(vercelDir)) {
  console.log("[v0] Removing .vercel directory...");
  fs.rmSync(vercelDir, { recursive: true, force: true });
}

try {
  console.log("[v0] Running npm run build from", projectRoot);
  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
  console.log("[v0] Build completed successfully!");
} catch (err) {
  console.error("[v0] Build failed:", err.message);
}
