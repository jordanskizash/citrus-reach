import { Navbar} from './_components/navbar';

const MarketingLayout = ({
    children 
}: {
    children: React.ReactNode;
}) => {
    return ( 
        <div className="h-full dark:bg-[#1F1F1F] absolute inset-0 -z-10 w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] ">
            <Navbar />
            <main className="h-full pt-40">
                {children}
            </main>
        </div>
     );
}
 
export default MarketingLayout;