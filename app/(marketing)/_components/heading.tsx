"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

const MotionButton = motion(Button);

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className={`${inter.className} w-full`}>
      {/* Announcement Banner */}
      <div className="hidden sm:flex max-w-3xl mx-auto border border-black rounded-lg mb-12 p-4 items-center justify-center gap-1">
        <p className="text-sm">
          Citrus is now live!{" "}
          <Link href="#" className="text-orange-500 hover:text-orange-600">
            Read more
          </Link>
          .{"         "}|{"         "}You can support our launch on Product Hunt{" "}
          <Link href="#" className="text-orange-500 hover:text-orange-600">
            here
          </Link>
          .
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col">
          <div className="flex-1 max-w-5xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-left leading-tight">
              Microsites that reach
            </h1>
            <div className="mt-4 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-left text-orange-500">
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
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8">
            <p className="text-lg sm:text-xl text-left font-medium text-gray-900 max-w-4xl mb-4 sm:mb-0">
              Citrus Reach is where thoughtfully crafted microsites deliver quota-crushing results
            </p>

            {isLoading ? (
              <div className="w-full sm:w-auto flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="flex">
                {isAuthenticated ? (
                  <MotionButton 
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    asChild
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/dashboard">
                      Enter Citrus
                    </Link>
                  </MotionButton>
                ) : (
                  <>
                    <SignInButton>
                      <MotionButton 
                        size="sm"
                        className="bg-orange-50 hover:bg-orange-100 text-orange-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try Citrus Free
                      </MotionButton>
                    </SignInButton>
                    <MotionButton 
                      size="sm" 
                      className="ml-4 bg-orange-500 hover:bg-orange-600 text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Book a Demo
                    </MotionButton>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};