import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";

import { EdgeStoreProvider } from "@/lib/edgestore";
import Script from "next/script";

// Add this line to prevent static generation
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

// Use environment variable for GA ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "Citrus Reach - Create High-Converting Microsites for Your Brand | Elevated Outreach",
  description: "Transform your brand's online presence with Citrus Reach's powerful microsite builder. Create stunning, conversion-optimized landing pages with embedded videos, analytics, and customizable templates for maximum impact.",
  alternates: {
    canonical: 'https://citrusreach.com'
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icon-modern.svg", //prev: /logo.svg
        type: "image/svg+xml",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icon-modern.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Citrus Reach - Create High-Converting Microsites for Your Brand",
    description: "Transform your brand's online presence with Citrus Reach's powerful microsite builder. Create stunning, conversion-optimized landing pages with embedded videos and analytics.",
    url: "citrusreach.com",
    siteName: "Citrus Reach",
    images: [
      {
        url: "https://citrusreach.com/og-image-gradient.png", 
        width: 1200,
        height: 630,
        alt: "Citrus Reach - Build Custom Microsites",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Citrus Reach: Create High-Converting Microsites for Your Brand",
    description: "Transform your brand's online presence with Citrus Reach's powerful microsite builder. Create stunning, conversion-optimized landing pages",
    images: ["https://citrusreach.com/og-image-gradient.png"],
    site: "@CitrusReach",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics Scripts */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script 
          id="google-analytics" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <ConvexClientProvider>
          <EdgeStoreProvider>
            <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="jotion-theme-2"
            >
              <AnalyticsProvider>
              <Toaster position="bottom-center"/>
              <ModalProvider />
              {children}
              </AnalyticsProvider>
            </ThemeProvider>
          </EdgeStoreProvider>
        </ConvexClientProvider>
        </body>
    </html>
  );
}
