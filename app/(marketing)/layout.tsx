import { Footer } from './_components/footer';
import { Navbar} from './_components/navbar';
import { Merriweather, Raleway, Zilla_Slab } from 'next/font/google';

const raleway = Zilla_Slab({
    subsets: ['latin'],
    weight: ['400']
  })

const MarketingLayout = ({
    children 
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <div className="min-h-full bg-orange-50 dark:bg-[#1F1F1F] bg-cover bg-center">
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