import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";  // ← Add this import
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const googleSans = localFont({
  src: [
    // Base versions (these match your non-17pt files – use them primarily)
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-MediumItalic.ttf",  // Fix typo if your file is actually "MediumItalic.ttf" (no extra 'l')
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Google_Sans/static/GoogleSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },

    // Optional: Add 17pt optical size variants only if you need them for small text
    // These are optimized for ~16-17px sizes (thinner strokes, better legibility at small px)
    // Skip for now unless you're using very small fonts (e.g., captions, UI labels)
    // {
    //   path: "../public/fonts/Google_Sans/static/GoogleSans_17pt-Regular.ttf",
    //   weight: "400",
    //   style: "normal",
    // },
    // ... add others similarly if desired
  ],
  variable: "--font-google-sans",
  display: "swap",
  // Optional: preload: true,  // default is true anyway
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={googleSans.variable}  // Applies the font var globally
    >
      <body className="font-sans antialiased">  {/* font-sans now uses Google Sans via var */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}