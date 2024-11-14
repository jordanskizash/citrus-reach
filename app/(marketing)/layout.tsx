import { Footer } from './_components/footer';
import { Navbar} from './_components/navbar';
import { Merriweather, Raleway, Zilla_Slab } from 'next/font/google';
import Script from 'next/script';

const raleway = Zilla_Slab({
    subsets: ['latin'],
    weight: ['400']
  })

const GA_MEASUREMENT_ID = 'G-M5LKWJ4EZ9';

export const dynamic = 'force-dynamic';

const MarketingLayout = ({
    children 
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <div className="min-h-full dark:bg-[#1F1F1F] bg-cover bg-center">
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>
            <main className={raleway.className}>
                <Navbar />
                <main className="h-full pt-40">
                    {children}
                </main>
                <Footer />
            </main>
        </div>
     );
}
 
export default MarketingLayout;