"use client";

import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link";
import { Poly } from '@next/font/google';

import { Badge } from "@/components/ui/badge";



const roboto = Poly({
    subsets: ['latin'],
    weight: ['400']
  })

export const Teams = () => {
    return (
      <div className={roboto.className} style={{ 
        backgroundColor: '#FFC493', // Set the background color to orange 
          width: '100vw', // Width to cover full viewport width
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: 0 // Remove default margin
        }}>
        <div className="flex flex-col items-center justify-center text-center max-w-3xl space-y-4 mt-8 mb-8">
            <h3 className="text-xl sm:text-lg md:text-xl font-serif text-orange-900 mt-4">
              For Teams
            </h3>
            <h2 className="text-base sm:text-xl md:text-5xl font-serif mb-4">
              Team & organizational plans
            </h2>
            <h2 className="text-base sm:text-xl md:text-xl font-serif mb-4">
              Collaborate with team members, drive higher conversion rates across the board
            </h2>
        </div>
        <div className="mb-16 mt-8">
            <Button className="text-xl px-8 py-8 bg-orange-500 text-white font-bold rounded-lg">Learn More</Button>
        </div>
    </div>
    );
}