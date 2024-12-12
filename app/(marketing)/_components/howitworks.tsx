"use client"

import { Calendar, CircleDot, ContactRound, LayoutTemplate } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { useState } from 'react'
import { Zilla_Slab } from 'next/font/google';

const zilla = Zilla_Slab({
    subsets: ['latin'],
    weight: ['400']
  })

export default function HowItWorks() {
  const [activeScreen, setActiveScreen] = useState(0)

  const screens = [
    { content: "/profilesite.png" },
    { content: "/bloghere.png" },
    { content: "/eventstwo.png" }
  ]

  return (
    <div className="container mx-auto px-4 py-12" >
      <h1 className="text-6xl md:text-6xl font-semibold text-center text-[#0B3B2D] mb-12">
        How Citrus Works
      </h1>
      
      <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* First Card */}
        <Card className="p-8 shadow-lg rounded-2xl bg-gradient-to-b from-white via-orange-50 to-orange-100 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="space-y-4 flex-shrink-0">
              <h2 className="text-2xl md:text-3xl font-medium text-left">
                Create micro-sites using our{" "}
                <span className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                  <LayoutTemplate className="w-5 h-5" />
                  templates
                </span>
                {" "}designed for your clients
              </h2>
            </div>
            
            <div className="border rounded-xl p-4 bg-white shadow-sm mt-4 flex-grow flex flex-col relative">
              <div className="absolute left-4 top-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              
              <img 
                    src={screens[activeScreen].content}
                    alt={`Screen ${activeScreen + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                />
              
              <div className="mt-8 flex justify-center gap-2">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      activeScreen === index ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                    onClick={() => setActiveScreen(index)}
                    aria-label={`Switch to screen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Second Card */}
        <Card className="p-8 shadow-lg rounded-2xl bg-gradient-to-b from-white via-orange-50 to-orange-100 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="space-y-4 flex-shrink-0">
              <h2 className="text-2xl md:text-3xl font-medium text-left">
                As prospects interact with your sites {" "}
                <span className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                    <ContactRound className="w-5 h-5"  />
                    collect data
                </span>
                and
                <span className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#FF8A00] px-2 py-1 rounded-md">
                  <Calendar className="w-5 h-5" />
                  book appointments
                </span>
                {" "}  
              </h2>
            </div>
            
            <div className="border rounded-xl p-4 bg-white shadow-sm mt-4 flex-grow relative">
              <div className="absolute left-4 top-4 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              
              <div className="flex-grow pt-8 flex items-center justify-center">
                <img 
                    src="/dashpic.png"
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

