"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

interface Logo {
  src: string
  alt: string
}

export default function LogoCarousel({ logos = [] }: { logos?: Logo[] }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Duplicate the logos array to create a seamless loop
  const extendedLogos = [...logos, ...logos]

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden bg-white py-4 relative mt-10">
      {/* Left blur gradient */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-white to-transparent z-10" />
      
      <div className="relative">
        <div
          className="flex animate-scroll"
          style={{
            width: `${logos.length * 300}px`,
            animation: isClient ? `scroll ${logos.length * 5}s linear infinite` : 'none',
          }}
        >
          {extendedLogos.map((logo, index) => (
            <div
              key={index}
              className="w-[300px] flex items-center justify-center px-8"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100}
                height={50}
                className="max-w-[100px] max-h-[50px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right blur gradient */}
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  )
}