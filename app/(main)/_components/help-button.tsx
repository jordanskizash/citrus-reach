"use client"

import { ExternalLink, HelpCircle, MessageSquare, Newspaper, Users } from "lucide-react"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-sidebar-accent text-gray-400 hover:text-white"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-52 p-2">
          <div className="space-y-1.5">
            <a
              href="https://support.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-1 px-1.5 text-xs hover:bg-muted rounded-sm transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <span>Support</span>
              </div>
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
            </a>

            <a
              href="https://releases.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-1 px-1.5 text-xs hover:bg-muted rounded-sm transition-colors"
            >
              <div className="flex items-center">
                <Newspaper className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <span>Release notes</span>
              </div>
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
            </a>

            <a
              href="https://community.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-1 px-1.5 text-xs hover:bg-muted rounded-sm transition-colors"
            >
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <span>Community</span>
              </div>
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
            </a>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

