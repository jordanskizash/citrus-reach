"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Template {
  id: string
  title: string
  image: string
  description: string
}

const templates: Record<string, Template> = {
  "newsletter": {
    id: "newsletter",
    title: "Newsletter",
    image: "/NewsletterPic.png",
    description: "Share regular updates and insights with your prospects and customers"
  },
  "video-profile": {
    id: "video-profile",
    title: "Video Profile",
    image: "/VideoSite.png",
    description: "Create an engaging video landing page to showcase your product"
  },
  "event": {
    id: "event",
    title: "Event",
    image: "/EventsNice.png",
    description: "Generate excitement and registrations for your upcoming events"
  },
  "announcement": {
    id: "announcement",
    title: "Announcement",
    image: "/Announcement.png",
    description: "Share important news and product launches with your audience"
  },
  "deal-room": {
    id: "deal-room",
    title: "Deal Room",
    image: "/DealRoom.png",
    description: "Create a secure space for sharing documents and closing deals"
  },
}

export default function SiteOptions() {
  const [activeTemplate, setActiveTemplate] = useState<string>("newsletter")
  const [randomizedTemplates, setRandomizedTemplates] = useState<string[]>([])

  useEffect(() => {
    setRandomizedTemplates(Object.keys(templates).sort(() => Math.random() - 0.5))
  }, [])

  return (
    <div className="min-h-100 w-full bg-gradient-to-b from-white via-orange-50 to-orange-100 md:pb-8 lg:pb-20 px-8 pb-16 mt-8">
      <div className="mx-auto max-w-6xl h-full flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="lg:w-1/2 mb-12 lg:mb-0 flex-shrink-0">
          <h1 className="mb-8 text-3xl text-left font-bold tracking-tight text-gray-900 lg:text-5xl">
            Customizable sites for any stage in the sales cycle
          </h1>
          <p className="mb-8 text-left text-xl text-gray-500">
            Create sites to support your opportunity from identification to close
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {randomizedTemplates.slice(0, 3).map((templateId) => (
                <Button
                  key={templateId}
                  variant={activeTemplate === templateId ? "default" : "outline"}
                  className={`rounded-full px-6 ${
                    activeTemplate === templateId
                      ? "bg-orange-500 hover:bg-orange-500"
                      : "hover:bg-orange-200"
                  }`}
                  onClick={() => setActiveTemplate(templateId)}
                >
                  {templates[templateId].title}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {randomizedTemplates.slice(3).map((templateId) => (
                <Button
                  key={templateId}
                  variant={activeTemplate === templateId ? "default" : "outline"}
                  className={`rounded-full px-6 ${
                    activeTemplate === templateId
                      ? "bg-orange-500 hover:bg-orange-500"
                      : "hover:bg-orange-200"
                  }`}
                  onClick={() => setActiveTemplate(templateId)}
                >
                  {templates[templateId].title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 md:w-1/2 flex-shrink-0">
          <img 
            src={templates[activeTemplate].image} 
            alt={templates[activeTemplate].title} 
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  )
}