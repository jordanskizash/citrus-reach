'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'
import { pageview } from '@/lib/analytics'

export function AnalyticsProvider({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + searchParams.toString()
      
      // Get page type from URL structure
      let pageType = 'other'
      if (pathname.includes('/homepage')) pageType = 'homepage'
      if (pathname.includes('/preview')) pageType = 'preview'
      if (pathname.includes('/profile')) pageType = 'profile'
      
      // You can extract userId from your auth context or URL if needed
      const userId = '' // Add your user ID extraction logic here
      
      pageview(url, { userId, pageType })
    }
  }, [pathname, searchParams])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {children}
    </>
  )
}