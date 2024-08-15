"use client"
import Image from "next/image";

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const Hero = () => {
  const [activeTab, setActiveTab] = useState('0')
  const features = [
    {
      title: "Rich Text Editor",
      description: "Make collaboration seamless with built-in code review tools and real-time updates.",
      image: "/writebetter.png",
    },
    {
      title: "File Upload",
      description:
        "Automate your workflow with continuous integration and delivery, so your team can focus on shipping features.",
      image: "/medianow.png",
    },
    {
      title: "Personalization",
      description:
        "Deploy to the cloud with a single click and scale your infrastructure as needed, without managing it yourself.",
      image: "/placeholder.svg",
    },
    {
      title: "Custom Domain",
      description:
        "Get granular, first-party, real-user metrics on site performance per deployment, so you can optimize for your users.",
      image: "/placeholder.svg",
    },
    {
      title: "Publish",
      description:
        "Deliver dynamic, personalized content to your users, while ensuring they only see the best version of your site.",
      image: "/publish.png",
    },
  ]
  return (
    <div className="w-full max-w-4xl mx-auto py-12 md:py-24 lg:py-32">
      <Tabs value={activeTab} onValueChange={(newTab) => setActiveTab(String(newTab))} className="mb-8">
        <TabsList className="grid grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <TabsTrigger key={index} value={String(index)} className="transition-all duration-300 ease-in-out">
              {feature.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {features.map((feature, index) => (
          <TabsContent key={index} value={String(index)} className="transition-all duration-300 ease-in-out">
            <div className="flex flex-col gap-4">
              <div className="border rounded-lg p-6 bg-muted">
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden' }}>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};