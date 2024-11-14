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
  title: "Citrus Reach - Microsites That Convert",
  description: "Publish one-page websites to market your brand",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        type: "image/svg+xml",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "Citrus Reach - Microsites That Convert",
    description: "Video and content powered outreach",
    url: "citrusreach.com",
    siteName: "Citrus Reach",
    images: [
      {
        url: "https://citrusreach.com/og-image.png", // Replace with the actual image URL
        width: 1200,
        height: 630,
        alt: "Citrus Reach Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Citrus Reach - Microsites That Convert",
    description: "Video and content powered outreach",
    images: ["https://citrusreach.com/og-image.png"],
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
