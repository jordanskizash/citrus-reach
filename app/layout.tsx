import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

import { EdgeStoreProvider } from "@/lib/edgestore";

const inter = Inter({ subsets: ["latin"] });

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
    description: "Publish one-page websites to market your brand",
    url: "citrusreach.com", // Replace with your actual domain
    siteName: "Citrus Reach",
    images: [
      {
        url: "https://citrusreach.com.com/og-image.png", // Replace with the actual image URL
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
    description: "Publish one-page websites to market your brand",
    images: ["https://citrusreach.com.com/og-image.png"], // Replace with the actual image URL
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              <Toaster position="bottom-center"/>
              <ModalProvider />
              {children}
            </ThemeProvider>
          </EdgeStoreProvider>
        </ConvexClientProvider>
        </body>
    </html>
  );
}
