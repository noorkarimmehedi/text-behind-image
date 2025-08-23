import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google'
import { GeistSans, GeistMono } from 'geist/font';
import "./globals.css";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/ui/footer-section";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Text Behind Objects",
  description: "Create text behind image designs in seconds",
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.ico' },
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Prefer SVG favicon; keep ICO as fallback. Cache-bust with v=2 */}
        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={GeistSans.className}>
        <SupabaseProvider>
            <UserProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <Analytics />
                  <SpeedInsights />
                  <Toaster />
                </div>
              </ThemeProvider>
            </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
