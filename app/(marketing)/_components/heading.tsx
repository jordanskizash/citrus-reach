"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="w-full">
      {/* Desktop Announcement Banner */}
      <div className="hidden sm:flex max-w-7xl mx-auto border border-black rounded-lg mb-12 p-4 items-center justify-center gap-1">
        <p className="text-lg">
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

      {/* Mobile Announcement Banner */}
      <div className="sm:hidden mx-4 border border-black rounded-lg mb-8 p-3 flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-center">
          Citrus is now live!{" "}
          <Link href="#" className="text-orange-500 hover:text-orange-600">
            Read more
          </Link>
        </p>
        <p className="text-sm text-center">
          Support our launch on Product Hunt{" "}
          <Link href="#" className="text-orange-500 hover:text-orange-600">
            here
          </Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
        <div className="flex flex-col">
          <div className="flex-1 max-w-5xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-8xl font-bold tracking-tight text-left leading-tight">
              Microsites that reach
            </h1>
            <div className="mt-4 text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-left text-orange-500">
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
              <div className="flex w-full sm:w-auto sm:justify-start gap-4">
                {isAuthenticated ? (
                  <MotionButton 
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-base"
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
                        className="bg-orange-50 hover:bg-orange-100 text-orange-500 text-base"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try Citrus Free
                      </MotionButton>
                    </SignInButton>
                    <MotionButton 
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-base"
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
}