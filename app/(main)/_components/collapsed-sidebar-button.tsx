"use client"

import { MenuIcon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function CollapsedSidebarButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className="fixed left-4 top-4 z-[100000] rounded-full shadow-md bg-background"
    >
      <MenuIcon className="h-5 w-5" />
      <span className="sr-only">Open sidebar</span>
    </Button>
  )
}

