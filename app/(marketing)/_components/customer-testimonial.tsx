"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface TestimonialProps {
  quote?: string
  name?: string
  role?: string
  company?: string
  imageUrl?: string
  className?: string
}

export default function CustomerTestimonial({
  quote = "Citrus transformed our sales team - we've increased meetings booked by 43% in just one quarter.",
  name = "Kazi Shoon",
  role = "Sales Manager",
  company = "Salesforce",
  imageUrl = "/kazi.jpg",
  className,
}: TestimonialProps) {
  return (
    <div className={cn("max-w-md mx-auto py-3 mb-12", className)}>
      {/* Custom font styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;500;600;700&display=swap');
        .zilla-slab {
          font-family: 'Zilla Slab', serif;
        }
      `}</style>

      <blockquote className="text-center">
        <p className="zilla-slab text-[#333333] text-2xl font-medium leading-tight mb-8">{quote}</p>
        
        <div className="flex flex-row items-center justify-center">
          <div className="w-14 h-14 overflow-hidden rounded-full mr-4">
            <Image src={imageUrl || "/placeholder.svg"} alt={name} width={56} height={56} className="object-cover" />
          </div>

          <div className="text-left">
            <p className="zilla-slab text-[#4a4a4a] text-xl font-bold">{name}</p>
            <p className="zilla-slab text-[#777777] text-base">
              {role}{company ? `, ${company}` : ''}
            </p>
          </div>
        </div>
      </blockquote>
    </div>
  )
}