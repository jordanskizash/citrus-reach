import { Button } from "@/components/ui/button";
import { Heading } from "./_components/heading";
import { Heroes } from "./_components/heroes";
import { Footer } from "./_components/footer";
import { Car } from "lucide-react";
import { Hero } from "./_components/hero";
import { Suite } from "./_components/suite";
import { FAQ } from "./_components/faq";
import { Teams } from "./_components/teams";
import { CardFeatures } from "./_components/appfeatures";
import { Sections } from "./_components/sections";
import LogoCarousel from "./_components/references";
import Catcher from "./_components/catcher";
import WordScreen from "./_components/parallax";
import  HowItWorks  from "./_components/howitworks";
import MeetingTemplates from "./_components/siteoptions";
import ShareSites from "./_components/shareoptions";


const logos = [
  { src: '/IBMNew.png', alt: 'IBM Logo' },
  { src: '/FlexportLogo.png', alt: 'Flexport' },
  { src: '/TellaLogo.png', alt: 'Tella' },
  { src: '/LinkedInLogo.png', alt: 'LinkedIn' },
  { src: '/CoLabLogo.png', alt: 'CoLab' },
  { src: '/SalesforceLogo.png', alt: 'Salesforce' },
  { src: '/SlackLogo.png', alt: 'Slack' },
  { src: '/LendUpLogo.png', alt: 'LendUp' },

  // ... add up to 10 logos
];

const MarketingPage = () => {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex flex-col items-center justify-center md:justify-start text-center  flex-1 pb-10  ">
        <Heading />
        <LogoCarousel logos={logos} />
        <Catcher />
        {/* <Hero /> */}
        <HowItWorks />
        <MeetingTemplates />
        <ShareSites />
        {/* <CardFeatures /> */}
        {/* <Refs /> */}
        {/* <Suite /> */}
        {/* <Sections /> */}
        <FAQ />
      </div>
    </div>
  );
};

export default MarketingPage;
