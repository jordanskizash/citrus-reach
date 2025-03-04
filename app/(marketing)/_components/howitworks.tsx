"use client"

import { Calendar, CircleDot, ContactRound, LayoutTemplate } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Zilla_Slab } from 'next/font/google';

const zilla = Zilla_Slab({
    subsets: ['latin'],
    weight: ['400']
  })

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-6 mb-8" >
      <h1 className="text-3xl md:text-4xl font-semibold text-center mb-6">
        How Citrus Works
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto"> 
        {/* First Card */}
        <Card className="p-4 shadow-md rounded-xl bg-gradient-to-b from-white via-orange-50 to-orange-500 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="space-y-2 flex-shrink-0">
              <h2 className="text-xl md:text-2xl font-medium text-left">
                Create micro-sites using our{" "}
                <span className="inline-flex items-center gap-1 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                  <LayoutTemplate className="w-4 h-4" />
                  templates
                </span>
                {" "}designed for your clients
              </h2>
            </div>
            
            <div className="border rounded-lg p-3 bg-white shadow-sm mt-3 flex-grow flex flex-col relative">
              <div className="absolute left-3 top-3 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              
              <img 
                    src="/profilesite.png"
                    alt="Profile Site Template"
                    className="w-full h-full object-contain rounded-lg mt-4"
                />
            </div>
          </div>
        </Card>

        {/* Second Card */}
        <Card className="p-4 shadow-md rounded-xl bg-gradient-to-b from-white via-orange-50 to-orange-500 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="space-y-2 flex-shrink-0">
              <h2 className="text-xl md:text-2xl font-medium text-left">
                As prospects interact with your sites {" "}
                <span className="inline-flex items-center gap-1 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                    <ContactRound className="w-4 h-4"  />
                    collect data
                </span>
                and improve pipeline
                {/* <span className="inline-flex items-center gap-1 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                  <Calendar className="w-4 h-4" />
                  book appointments
                </span> */}
                {" "}  
              </h2>
            </div>
            
            <div className="border rounded-lg p-3 bg-white shadow-sm mt-3 flex-grow flex flex-col relative">
              <div className="absolute left-3 top-3 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              
              <div className="flex-grow pt-6 flex items-center justify-center">
                <img 
                    src="/DashPicc.png"
                    alt="Collect respones and analytics"
                    className="w-full h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}