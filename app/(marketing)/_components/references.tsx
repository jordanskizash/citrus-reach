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
    <div className="w-full overflow-hidden mt-10 bg-white py-4">
      <div className="relative">
        <div
          className="flex animate-scroll"
          style={{
            width: `${logos.length * 300}px`, // Increased spacing between logos
            animation: isClient ? `scroll ${logos.length * 5}s linear infinite` : 'none', // Reduced time for faster animation
          }}
        >
          {extendedLogos.map((logo, index) => (
            <div
              key={index}
              className="w-[300px] flex items-center justify-center px-8" // Increased width and padding
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={100} // Reduced from 150
                height={50} // Reduced from 75
                className="max-w-[100px] max-h-[50px] object-contain" // Reduced max dimensions
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}