import { Navbar} from './_components/navbar';
import { Raleway } from 'next/font/google';

const raleway = Raleway({
    subsets: ['latin'],
    weight: ['400']
  })

const MarketingLayout = ({
    children 
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <div className="h-full dark:bg-[#1F1F1F]">
            <main className={raleway.className}>
                <Navbar />
                <main className="h-full pt-40">
                    {children}
                </main>
            </main>
        </div>
     );
}
 
export default MarketingLayout;