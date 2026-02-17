// CLI commands and utilities for development

export const commands = {
  dev: "npm run dev",
  build: "npm run build",
  start: "npm start",
  lint: "npm run lint",
  typeCheck: "npm run type-check",
  test: "npm test",
};

export const scripts = {
  installDeps: "npm install",
  updateDeps: "npm update",
  auditDeps: "npm audit",
  fixAudit: "npm audit fix",
};

// Development tips
export const tips = [
  "Remember to run 'npm run type-check' before committing changes",
  "Use 'npm run lint' to check for code style issues",
  "Check the mockData.ts for available test data",
  "Use the login credentials: EN2024001 / password123",
  "Install the VS Code extensions recommended in .vscode/extensions.json",
];
