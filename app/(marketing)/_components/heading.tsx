"use client";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EB_Garamond } from '@next/font/google';
import { Lato, Oswald, Poly, Raleway, Roboto } from "next/font/google";
import Typewriter from 'typewriter-effect';



const roboto = Raleway({
  subsets: ['latin'],
  weight: ['400']
})

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();


  return (
    <div>
      <div className="max-w-3xl space-y-4  justify-center items-center ">
        <main className={roboto.className}>
          <h1 className="text-4xl sm:text-4xl md:text-7xl font-extrabold mb-8">
            Professional Microsites that help you reach {" "}
            <main className="text-5xl sm:text-3xl md:text-6xl font-semibold text-orange-500 mt-8 mb-8">
              <Typewriter
                options={{
                  strings: [
                    'Prospects',
                    'Clients',
                    'Employers',
                    'Investors',
                    'Your Team'
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </main>
          </h1>
          <h3 className="text-base sm:text-xl md:text-2xl font-small mb-10">
            Citrus Reach helps you create professional microsites utilizing video, files, and field input to more effectively communicate professionally.
          </h3>
        </main>
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {isAuthenticated && !isLoading &&(
          <Button asChild>
            <Link href="/documents">
              Enter Citrus Reach
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
        {!isAuthenticated && !isLoading && (
          <div className="flex justify-center space-x-2">
            <SignInButton mode="modal">
              <Button style={{
                padding: '20px 20px',
                fontSize: '18px',
                border: 'none',
                borderRadius: '5px'
              }}>
                Get Citrus free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SignInButton>
          </div>
        ) }
      </div>
    </div>
  );
};
