"use client"

import { useUser } from "@clerk/clerk-react"
import { Search, SquarePen, SquarePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import toast from "react-hot-toast"
import { useSearch } from "@/hooks/use-search"

import { UserDropdown } from "./user-dropdown"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function UserHeader() {
  const router = useRouter()
  const { user } = useUser()
  const search = useSearch()

  const create = useAction(api.documents.create)

  const handleCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) => router.push(`/documents/${documentId}`))

    toast.promise(promise, {
      loading: "Creating a new blog",
      success: "New Blog Created!",
      error: "Failed to create a new blog",
    })
  }

  if (!user) return null

  return (
    <div className="flex items-center justify-between p-2 w-full">
      {/* User info - using the existing UserDropdown but styled differently */}
      <div className="flex-1 max-w-[75%]">
        <style jsx global>{`
          /* Override UserDropdown styles to make it more compact */
          .user-header-dropdown .flex.items-center.p-3 {
            padding: 0 !important;
          }
          
          /* Hide the plan badge */
          .user-header-dropdown .px-4.py-0.5.rounded-full,
          .user-header-dropdown div[class*="rounded-full text-xs"] {
            display: none !important;
          }
          
          .user-header-dropdown .text-sm.font-medium.mt-1 {
            margin-top: 0 !important;
          }
        `}</style>
        <div className="user-header-dropdown">
          <UserDropdown />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={search.onOpen}
                className="rounded-full bg-gray-100/10 hover:bg-gray-100/20 text-white h-7 w-7 p-0"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreate}
                className="rounded-full bg-gray-100/20 hover:bg-gray-100/30 text-white h-7 w-7 p-0"
              >
                <SquarePen className="h-3.5 w-3.5" />
                <span className="sr-only">New page</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create new page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

