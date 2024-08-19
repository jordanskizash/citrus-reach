"use client"
import Image from "next/image";

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const Hero = () => {
  const [activeTab, setActiveTab] = useState('0')
  const features = [
    {
      title: "Rich Text Editor",
      description: "Built-in full-stack text editor with everything you need to deliver written messaging.",
      image: "/writebetter.png",
    },
    {
      title: "File Upload",
      description:
        "Upload files, including video to enhance your site. ",
      image: "/filesupload.png",
    },
    {
      title: "Personalization",
      description:
        "Create multiple sites and tailor each one to your specific needs. Publish all or none.",
      image: "/personalizee.png",
    },
    {
      title: "Custom Domain",
      description:
        "Add your domain. Or use ours at yourcompany.citrusreach.com",
      image: "/domain.png",
    },
    {
      title: "Publish",
      description:
        "Publish your site, and get better content over to your clients.",
      image: "/publishnow.png",
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