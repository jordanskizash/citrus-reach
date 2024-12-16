"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link, Mail, Users, NotebookPen, Pointer, Share } from 'lucide-react'

interface ShareOption {
  id: string
  label: string
  icon: JSX.Element
  position: string
  className?: string
}

const shareOptions: ShareOption[] = [
    {
      id: "public-link",
      label: "Public link",
      icon: <Link className="w-4 h-4" />,
      position: "top-0 left-[15%]"
    },
    {
      id: "user-feedback",
      label: "#team-channel",
      icon: <NotebookPen className="w-4 h-4" />,
      position: "top-[15%] left-0",
      className: "hidden md:block" // Hide on mobile
    },
    {
      id: "email",
      label: "Email Outreach",
      icon: <Mail className="w-4 h-4" />,
      position: "top-[40%] left-[-5%]"
    },
    {
      id: "crm",
      label: "CRM",
      icon: <Users className="w-4 h-4" />,
      position: "bottom-[20%] left-[15%]",
      className: "hidden md:block" // Hide on mobile
    },
    {
      id: "project-updates",
      label: "Project updates",
      icon: <NotebookPen className="w-4 h-4" />,
      position: "top-0 right-[15%]"
    },
    {
      id: "ats-notes",
      label: "Hiring Cover Website",
      icon: <Users className="w-4 h-4" />,
      position: "top-[25%] right-0",
      className: "hidden md:block" // Hide on mobile
    },
    {
      id: "one-on-one",
      label: "Product Documentation",
      icon: <NotebookPen className="w-4 h-4" />,
      position: "bottom-[30%] right-[5%]",
      className: "hidden md:block" // Hide on mobile
    },
    {
      id: "meeting-notes",
      label: "#account-notes",
      icon: <NotebookPen className="w-4 h-4" />,
      position: "bottom-[10%] right-[20%]"
    },
  ]

export default function ShareSites() {
  return (
    <div className="w-full bg-gradient-to-b from-orange-100 to-white px-8  lg:pt-2 pt-4 pb-8"> {/* adjusted padding */}
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">
          Share your sites with one click
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-xl text-gray-500">
          Citrus makes it easy to share sites on the platforms you already use
        </p>

        <div className="relative mx-auto max-w-[800px] aspect-[16/9]">
          <style jsx>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
          {shareOptions.map((option, index) => (
        <div
            key={option.id}
            className={`absolute ${option.position} animate-float ${option.className || ''}`}
            style={{ animationDelay: `${index * 0.2}s` }}
        >
            <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-lg">
            {option.icon}
            <span>{option.label}</span>
            </div>
        </div>
        ))}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] hidden md:block">
           
                <Button className="w-full text-lg rounded-full bg-orange-600 hover:bg-orange-700">
                Share site
                <Share className="h-4 w-4 ml-5" />
                </Button>
            
            </div>
        </div>
      </div>
    </div>
  )
}

