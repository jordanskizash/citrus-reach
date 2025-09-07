"use client"
import { ChevronDown, LineChart, PlusCircle, Search, Settings, Trash } from "lucide-react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"
import { useUser } from "@clerk/clerk-react"
import { useSearch } from "@/hooks/use-search"
import { useSettings } from "@/hooks/use-settings"
import { DocumentList } from "./document-list"
import { ProfileList } from "./profile-list"
import { UserHeader } from "./user-header"
import { HelpButton } from "./help-button"
import { TrashBox } from "./trash-box"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"
import { useAction, useMutation } from "convex/react"
import toast from "react-hot-toast"

export function AppSidebar() {
  const router = useRouter()
  const search = useSearch()
  const settings = useSettings()
  const params = useParams()
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { user } = useUser()
  
  // Add the create document and profile actions
  const create = useAction(api.documents.create)
  const createProf = useMutation(api.profiles.create)

  const navigateToDashboard = () => {
    router.push("/dashboard")
  }

  const handleCreate = () => {
    const promise = create({ title: "Untitled" })
      .then((documentId) => router.push(`/documents/${documentId}`))
  
    toast.promise(promise, {
      loading: "Creating a new blog",
      success: "New Blog Created!",
      error: "Failed to create a new blog",
    })
  }

  const handlecreateProfile = async () => {
    const promise = createProf({
      displayName: "Untitled",
      authorFullName: "Untitled"
    })
    
    toast
      .promise(promise, {
        loading: "Creating a new profile...",
        success: "New profile created!",
        error: "Failed to create new profile.",
      })
      .then((profileId) => {
        router.push(`/profiles/${profileId}`)
      })
  }

  return (
    <Sidebar className="bg-[#0D1117] text-white border-r-0">
      <SidebarHeader className="p-0">
        <UserHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={navigateToDashboard}>
                  <a href="#" className="flex items-center sidebar-text">
                    <LineChart className="mr-2 h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={search.onOpen}>
                  <a href="#" className="flex items-center sidebar-text">
                    <Search className="mr-2 h-5 w-5" />
                    <span>Search</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={settings.onOpen}>
                  <a href="#" className="flex items-center sidebar-text">
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={handleCreate}>
                  <a href="#" className="flex items-center sidebar-text">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    <span>New Site</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Blogs Section */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between px-3 py-2">
                <span className="text-sm sidebar-text-secondary">Blogs</span>
                <div className="flex items-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation() // Prevent collapsible from toggling
                      handleCreate()
                    }} 
                    className="mr-1 hover:bg-sidebar-accent rounded-sm p-1"
                  >
                    <PlusCircle className="h-4 w-4 text-white" />
                  </button>
                  <ChevronDown className="h-4 w-4 sidebar-text-secondary transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <DocumentList />
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Profiles Section */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between px-3 py-2">
                <span className="text-sm sidebar-text-secondary">Profiles</span>
                <div className="flex items-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation() // Prevent collapsible from toggling
                      handlecreateProfile()
                    }} 
                    className="mr-1 hover:bg-sidebar-accent rounded-sm p-1"
                  >
                    <PlusCircle className="h-4 w-4 text-white" />
                  </button>
                  <ChevronDown className="h-4 w-4 sidebar-text-secondary transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ProfileList />
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Events Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-3 py-2">
            <span className="text-sm sidebar-text-secondary">Events</span>
            <span className="text-sm sidebar-text-secondary">Coming soon!</span>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Trash */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton className="w-full sidebar-text">
                      <Trash className="mr-2 h-5 w-5" />
                      <span>Trash</span>
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-72" side={isMobile ? "bottom" : "right"}>
                    <TrashBox />
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex justify-center">
        <HelpButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}