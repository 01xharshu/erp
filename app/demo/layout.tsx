import type { ReactNode } from 'react';
import { BRAND } from "@/lib/brand";

// Optional: metadata (keep this if you want page-specific title/description in demo mode)
export const metadata = {
  title: `Demo Mode - ${BRAND.name}`,
  description: `Explore the ${BRAND.name} system by role`,
};

// Required: Default export – the actual layout component
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="demo-layout min-h-screen bg-background text-foreground">
      {/* Optional: Add demo-specific UI here, e.g., a header/banner for demo mode */}
      <header className="border-b p-4 text-center bg-muted/50">
        <h1 className="text-2xl font-bold">Demo Mode</h1>
        <p className="text-sm text-muted-foreground">
          Exploring {BRAND.name} roles - changes won&apos;t be saved
        </p>
      </header>

      {/* Render the child page/content */}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
