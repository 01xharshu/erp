import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/brand";
import { cookies } from "next/headers";
import { decodeSessionToken } from "@/lib/session";
import { AuthSynchronizer } from "@/components/auth-synchronizer";

const googleSans = localFont({
  src: [
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
      path: "../public/fonts/Google_Sans/static/GoogleSans-MediumItalic.ttf",
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
  ],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND.name} - Student Dashboard`,
  description: BRAND.description,
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F8A66",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("erp_auth_token")?.value || null;
  const session = token ? decodeSessionToken(token) : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={googleSans.variable}
    >
      <body className="font-sans antialiased">
        <AuthSynchronizer session={session} token={token}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster 
              position="bottom-left" 
              closeButton 
              richColors 
              theme="system" 
              expand={true}
              visibleToasts={6}
              toastOptions={{
                className: "liquid-glass rounded-2xl border-white/10 shadow-2xl saturate-[1.5] brightness-[1.05]",
                style: {
                  background: "rgba(255, 255, 255, 0.45)",
                  backdropFilter: "blur(32px) saturate(190%)",
                }
              }}
            />
          </ThemeProvider>
        </AuthSynchronizer>
      </body>
    </html>
  );
}
