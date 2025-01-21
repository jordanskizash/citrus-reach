"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Circle } from 'lucide-react'

interface Template {
  id: string
  title: string
  sections: {
    title: string
    type: 'text' | 'image' | 'button' | 'circle'
    items: number
  }[]
}

const templates: Record<string, Template> = {
  "cold-outreach": {
    id: "cold-outreach",
    title: "Cold Outreach",
    sections: [
      { title: "Personalized Intro", type: 'text', items: 1 },
      { title: "Company Overview", type: 'image', items: 1 },
      { title: "Value Proposition", type: 'text', items: 1 },
      { title: "Social Proof", type: 'text', items: 1 },
      { title: "Schedule a Call", type: 'button', items: 1 },
    ],
  },
  "one-pager": {
    id: "one-pager",
    title: "One-Pager",
    sections: [
      { title: "Product Showcase", type: 'image', items: 1 },
      { title: "Company Overview", type: 'text', items: 1 },
      { title: "Key Features", type: 'text', items: 2 },
      { title: "Contact Information", type: 'text', items: 1 },
      { title: "Request Demo", type: 'button', items: 1 },
    ],
  },
  "deal-room": {
    id: "deal-room",
    title: "Deal Room",
    sections: [
      { title: "Deal Summary", type: 'text', items: 1 },
      { title: "Key Documents", type: 'text', items: 2 },
      { title: "Financial Overview", type: 'image', items: 1 },
      { title: "Discussion Thread", type: 'text', items: 1 },
      { title: "E-Sign Agreement", type: 'button', items: 1 },
    ],
  },
  "event": {
    id: "event",
    title: "Event",
    sections: [
      { title: "Event Heading", type: 'image', items: 1 },
      { title: "Event Details", type: 'text', items: 1 },
      { title: "Agenda", type: 'text', items: 2 },
      { title: "Speakers", type: 'text', items: 4 },
      { title: "RSVP Now", type: 'button', items: 1 },
    ],
  },
  "file-share": {
    id: "file-share",
    title: "File Share",
    sections: [
      { title: "Shared Files", type: 'text', items: 2 },
      { title: "File Preview", type: 'image', items: 1 },
      { title: "Access Log", type: 'text', items: 1 },
      { title: "Get Access", type: 'button', items: 1 },
    ],
  },
}

export default function MeetingTemplates() {
  const [activeTemplate, setActiveTemplate] = useState<string>("cold-outreach")
  const [randomizedTemplates, setRandomizedTemplates] = useState<string[]>([])

  useEffect(() => {
    setRandomizedTemplates(Object.keys(templates).sort(() => Math.random() - 0.5))
  }, [])

  return (
    <div className="min-h-100 w-full bg-gradient-to-b from-white via-orange-50 to-orange-100 md:pb-8 lg:pb-20 px-8 pb-16 mt-8">
      <div className="mx-auto max-w-5xl h-full flex flex-col lg:flex-row lg:items-center">
        <div className="lg:w-1/2 lg:pr-8 mb-12 lg:mb-0">
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
            <div className="flex flex-wrap gap-1">
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

        <div className="lg:w-1/2 relative">
          <Card className="p-6 shadow-xl h-[600px] overflow-y-auto bg-white transform rotate-2 transition-transform">
            <div className="mb-3">
              <h2 className="text-xl font-semibold">{templates[activeTemplate].title}</h2>
            </div>

            {templates[activeTemplate].sections.map((section, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <h3 className="mb-2 font-medium">{section.title}</h3>
                <div className="space-y-1">
                  {Array.from({ length: section.items }).map((_, i) => {
                    switch (section.type) {
                      case 'text':
                        return (
                          <div
                            key={i}
                            className="h-4 bg-gray-200 rounded animate-pulse"
                            style={{
                              width: `${Math.random() * 30 + 70}%`,
                            }}
                          />
                        )
                      case 'image':
                        return (
                          <div
                            key={i}
                            className="bg-gray-300 rounded animate-pulse"
                            style={{
                              height: section.title === "File Preview" ? "180px" : "120px",
                            }}
                          />
                        )
                      case 'circle':
                        return (
                          <div key={i} className="inline-block mr-2 mb-2">
                            <Circle className="w-8 h-8 text-gray-300" fill="currentColor" />
                          </div>
                        )
                      case 'button':
                        return (
                          <button
                            key={i}
                            className="px-6 py-2 bg-orange-100 text-orange-500 rounded-full hover:bg-orange-200 transition-colors"
                          >
                            {section.title}
                          </button>
                        )
                      default:
                        return null
                    }
                  })}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

