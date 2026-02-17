import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "geist/font";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-sans" });
const geistMono = Geist_Mono({ variable: "--font-mono" });

export const metadata: Metadata = {
  title: "College ERP Portal - Student Dashboard",
  description:
    "Modern College ERP Student Portal for managing academics, attendance, fees, and more",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
