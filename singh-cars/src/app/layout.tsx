import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import { AppInstallBanner } from "@/components/app/app-install-banner";
import { PwaRegister } from "@/components/app/pwa-register";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://singhcarbazar.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Singh Car Bazar Files",
  title: "Singh Car Bazar",
  description:
    "Singh Car Bazar used car website with live inventory, inquiry capture, and dealer management backed by Supabase.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon?size=192", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "SCB Files",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <PwaRegister />
        <AppInstallBanner />
        {children}
      </body>
    </html>
  );
}
