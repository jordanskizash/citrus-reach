"use client";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Poly} from '@next/font/google';



const roboto = Poly({
  subsets: ['latin'],
  weight: ['400']
})

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div>
      <div className="max-w-3xl space-y-4">
        <main className={roboto.className}>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-8">
            Professional microsites made simple. Welcome to{" "}
            <span className="underline">Citrus Reach</span>
          </h1>
          <h3 className="text-base sm:text-xl md:text-2xl font-medium mb-10">
            Citrus Reach helps you generate unique content-powered microsites for your clients
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
          <div className="flex space-x-2">
            <SignInButton mode="modal">
              <Button>
                Get Citrus free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </SignInButton>
            <Button className="hover:shadow-bottom-right">
              Try it Live
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ) }
      </div>
    </div>
  );
};
