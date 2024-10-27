import { Button } from "@/components/ui/button";
import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";
import { Footer } from "./_components/footer";
import { Car } from "lucide-react";
import { Hero } from "./_components/hero";
import { Suite } from "./_components/suite";
import { Refs } from "./_components/references"; 
import { FAQ } from "./_components/faq";
import { Teams } from "./_components/teams";
import { CardFeatures } from "./_components/appfeatures";
import { Sections } from "./_components/sections";


const MarketingPage = () => {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 pb-10  ">
        <Heading />
        <Hero />
        <CardFeatures />
        {/* <Refs /> */}
        {/* <Suite /> */}
        <Sections />
        <FAQ />
      </div>
    </div>
  );
};

export default MarketingPage;
