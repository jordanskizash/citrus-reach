import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export const Refs = () =>  {
  const companies = [
    { name: "Globex Corporation", logo: "/IBMLogo.png" },
    { name: "Soylent Corp", logo: "/IBMLogo.png" },
    { name: "Initech", logo: "/IBMLogo.png" },
    { name: "Umbrella Corporation", logo: "/IBMLogo.png" },
    { name: "Hooli", logo: "/IBMLogo.png" },
    { name: "Stark Industries", logo: "/IBMLogo.png" },
    { name: "Wayne Enterprises", logo: "/IBMLogo.png" },
  ]

  return (
    <section className="w-full py-12 background-color:transparent dark:bg-[#0b0b0b]">
      <div className="container px-4 sm:px-9 md:px-12">
        <h2 className="text-3xl font-bold text-center mb-8">Trusted by Industry Leaders</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-sm mx-auto md:max-w-4xl"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {companies.map((company, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
                <div className="p-1">
                    <CardContent className="flex items-center justify-center p-6">
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        width={160}
                        height={80}
                        className="max-w-[160px] max-h-[80px] object-contain"
                      />
                    </CardContent>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}