"use client";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Zilla_Slab } from "next/font/google";
import Typewriter from 'typewriter-effect';

const roboto = Zilla_Slab({
  subsets: ['latin'],
  weight: ['400']
});

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="px-4 sm:px-6 md:px-8"> {/* Add padding here */}
      <div className="max-w-4xl space-y-4 justify-center items-center mx-auto"> {/* Added mx-auto for centering */}
        <main className={roboto.className}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8">
            Video powered microsites to help you reach {" "}
            <main className="text-3xl sm:text-4xl md:text-5xl font-semibold text-orange-500 mt-8 mb-8">
              <Typewriter
                options={{
                  strings: [
                    'Prospects',
                    'Clients',
                    'Investors',
                    'Your Team',
                    'Quota'
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </main>
          </h1>
          <h3 className="text-base sm:text-lg md:text-xl font-normal mb-10">
            Citrus Reach helps you craft interactive microsites featuring video, marketing content, forms and calendars to elevate your professional outreach and secure more meetings. 
          </h3>
        </main>
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {isAuthenticated && !isLoading && (
          <Button asChild>
            <Link href="/dashboard">
              Enter Citrus Reach
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
        {!isAuthenticated && !isLoading && (
          <div className="flex justify-center space-x-2 mb-10">
            <SignInButton mode="modal">
              <Button className="py-5 px-5 text-lg rounded">
                Get Citrus free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SignInButton>
          </div>
        )}
      </div>
      <h2 className="mt-16 text-2xl sm:text-3xl md:text-4xl font-extrabold">
        Check out how <span className="font-bold text-orange-500 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">200+</span> users are increasing engagement rates
      </h2>
    </div>
  );
};