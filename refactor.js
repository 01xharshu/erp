const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TS/TSX files
const files = execSync('find app components -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // We want to replace getAuthToken, getStudentData, getUserData, getUserRole, isAuthenticated

  // Fix imports
  if (content.includes('from "@/lib/auth"')) {
    const originalContent = content;
    
    // Check if the file is a client component, if not and it uses these, we might have an issue, but let's assume they are.
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
       // Only add "use client" if it uses auth functions
       if (content.match(/\b(getAuthToken|getStudentData|getUserData|getUserRole|isAuthenticated)\b/)) {
          content = '"use client";\n' + content;
       }
    }

    // Add useAuth import if auth functions are used
    if (content.match(/\b(getAuthToken|getStudentData|getUserData|getUserRole|isAuthenticated)\b/)) {
      if (!content.includes('useAuth')) {
         content = content.replace(/(import .* from ["']@\/lib\/auth["'];?)/, "import { useAuth } from \"@/components/auth-provider\";\n$1");
      }
    }

    // Since hooks must be called inside the component body, we have to inject `const { session } = useAuth();`
    // inside the default export or the main component. This is tricky with regex.
    // Let's just do a hack: define useSession hooks that can be called inline? No, hooks can't be called inside nested callbacks.
  }
});
