'use client'

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { Toaster } from "react-hot-toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
  )
}