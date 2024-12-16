"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Template {
  id: string
  title: string
  time?: string
  participants?: string
  sections: {
    title: string
    items: number
  }[]
}

const templates: Record<string, Template> = {
  "customer-discovery": {
    id: "customer-discovery",
    title: "Customer discovery",
    time: "Today 10:10 PM",
    participants: "Alex, Sarah +3",
    sections: [
      { title: "About them", items: 3 },
      { title: "Key takeaways", items: 2 },
      { title: "Decision-making insights", items: 2 },
      { title: "Budget & Timeline", items: 2 },
      { title: "Next Steps", items: 2 },
    ],
  },
  "1-on-1": {
    id: "1-on-1",
    title: "1 on 1",
    time: "Tomorrow 2:00 PM",
    participants: "John",
    sections: [
      { title: "Wins & Challenges", items: 2 },
      { title: "Goals Progress", items: 3 },
      { title: "Action Items", items: 2 },
    ],
  },
  "user-interview": {
    id: "user-interview",
    title: "User Interview",
    sections: [
      { title: "Background", items: 2 },
      { title: "Pain Points", items: 3 },
      { title: "Feature Feedback", items: 2 },
      { title: "Next Steps", items: 1 },
    ],
  },
  "pitch": {
    id: "pitch",
    title: "Pitch",
    sections: [
      { title: "Company Overview", items: 2 },
      { title: "Product Demo", items: 2 },
      { title: "Market Analysis", items: 3 },
      { title: "Q&A Notes", items: 2 },
    ],
  },
  "standup": {
    id: "standup",
    title: "Standup",
    sections: [
      { title: "Yesterday", items: 3 },
      { title: "Today", items: 3 },
      { title: "Blockers", items: 2 },
    ],
  },
}

export default function MeetingTemplates() {
  const [activeTemplate, setActiveTemplate] = useState<string>("customer-discovery")
  const [randomizedTemplates, setRandomizedTemplates] = useState<string[]>([])

  useEffect(() => {
    setRandomizedTemplates(Object.keys(templates).sort(() => Math.random() - 0.5))
  }, [])

  return (
    <div className="min-h-100 w-full bg-gradient-to-b from-white via-orange-50 to-orange-100 md:pb-8 lg:pb-20 px-8 pb-16 mt-8"> {/* reduced mt-8 to mt-4 */}
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
                      : "hover:bg-orange-50"
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
                      : "hover:bg-orange-50"
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
              {templates[activeTemplate].time && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>{templates[activeTemplate].time}</span>
                  <span>•</span>
                  <span>{templates[activeTemplate].participants}</span>
                </div>
              )}
            </div>

            {templates[activeTemplate].sections.map((section, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <h3 className="mb-3 font-medium">{section.title}</h3>
                <div className="space-y-2">
                  {Array.from({ length: section.items }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded animate-pulse"
                      style={{
                        width: `${Math.random() * 40 + 60}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}

