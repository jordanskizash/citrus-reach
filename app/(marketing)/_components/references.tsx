import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export const CarouselSpacing = () => {
    return (
        <Carousel
          className="w-full max-w-4xl"
        >
          <CarouselContent>
            <CarouselItem>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">John Doe</h4>
                      <p className="text-muted-foreground text-sm">Software Engineer</p>
                    </div>
                  </div>
                  <blockquote className="text-lg font-medium leading-relaxed">
                    "The team at Acme Inc. has been incredible to work with. They\n delivered a high-quality product on time
                    and within budget."
                  </blockquote>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Jane Smith</h4>
                      <p className="text-muted-foreground text-sm">Product Manager</p>
                    </div>
                  </div>
                  <blockquote className="text-lg font-medium leading-relaxed">
                    "I've worked with many agencies, but Acme Inc. stands out for\n their attention to detail and commitment
                    to our success."
                  </blockquote>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Michael Johnson</h4>
                      <p className="text-muted-foreground text-sm">Marketing Manager</p>
                    </div>
                  </div>
                  <blockquote className="text-lg font-medium leading-relaxed">
                    "Acme Inc. has been a true partner in helping us achieve our\n marketing goals. Their team is
                    knowledgeable and responsive."
                  </blockquote>
                </div>
                <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Emily Davis</h4>
                      <p className="text-muted-foreground text-sm">UX Designer</p>
                    </div>
                  </div>
                  <blockquote className="text-lg font-medium leading-relaxed">
                    "I've been impressed by Acme Inc.'s ability to translate our\n vision into a user-friendly and visually
                    appealing design."
                  </blockquote>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
  )
}

