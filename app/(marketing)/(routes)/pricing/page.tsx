import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { FAQ } from '../../_components/faq';
import LogoCarousel from '../../_components/references';
import { SignInButton } from '@clerk/clerk-react';

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

const PricingPage = () => {
  return (
    <div className="w-full ">
      {/* Header Section */}
      <div className="text-center mb-16">
        <p className="text-zinc-500 mb-4">Pricing</p>
        <h1 className="text-5xl font-bold mb-6">
          Let's Find the Right<br />Plan For Your<br />Business
        </h1>
        <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
          Unlimited Sites. Unlimited Content. Any format. No Hidden Fees. No Exceptions.
        </p>
      </div>

      {/* Pricing Cards Container */}
      <div className="relative max-w-5xl mx-auto mt-8">
        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-0 border rounded-2xl relative">
          {/* Most Popular Badge - Positioned relative to the grid */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-9999">
            <div className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm whitespace-nowrap">
              Most Popular
            </div>
          </div>

          {/* Free Tier */}
          <Card className="border-0 rounded-none px-8 py-12 flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Free</h2>
                  <p className="text-zinc-600 mb-8">
                    For individuals interested in improving their reach
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>10 free sites</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Up to 3 minute videos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Direct to personal email and calendar link</span>
                    </li>
                  </ul>
                </div>
                <a href="accounts.citrusreach.com/sign-up">
                    <Button variant="secondary" className="w-full bg-orange-100 hover:bg-orange-200 text-orange-900">
                    Try Citrus Free
                    </Button>
                </a>
              </CardContent>
              
            </Card>

          {/* Pro Tier */}
          <Card className="border-0 rounded-none px-8 py-12 bg-orange-50 flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Pro</h2>
                  <p className="text-zinc-600 mb-8">
                    For individuals or small teams creating content at scale
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Unlimited Micro-Sites</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Custom Branding</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Embedded calendar and forms</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-500 text-white">
                  Try Citrus Free
                </Button>
              </CardContent>
            </Card>

          {/* Enterprise Tier */}
          <Card className="border-0 rounded-none px-8 py-12 flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
                  <p className="text-zinc-600 mb-8">
                    For organizations serious about driving pipeline
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Consolidated Billing & Admin</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Integrate with CRM</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                      <span>Support and feature requests</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-500 text-white">
                  Try Citrus Free
                </Button>
              </CardContent>
            </Card>
            
        </div>
        
      </div>
      <div className="my-20">
        <h2 className="text-center text-2xl font-bold mb-12">Supporting Some of the Best Sales Teams</h2>
        <div className="mb-20 items-center justify-center">
          <LogoCarousel logos={logos} />
        </div>
        <FAQ />
      </div>
    </div>
  );
};

export default PricingPage;