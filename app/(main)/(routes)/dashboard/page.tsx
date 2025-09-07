"use client"

import * as React from "react"
import { Search } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/clerk-react"

type Site = {
  date: string | number | Date
  id: string;
  name: string;
  type: "blog" | "profile" | "event";
  views: number;
  likes: number;
  published: string;
}

interface PageViewsData {
  [key: string]: number;
}

export default function Dashboard() {
  // State management
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("personal")
  const [selectedSites, setSelectedSites] = React.useState<string[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalViews, setTotalViews] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const itemsPerPage = 7
  const { theme } = useTheme()
  const router = useRouter()
  const create = useAction(api.documents.create)
  const createProf = useMutation(api.profiles.create)
  const { user } = useUser();
  
  // Fetch data from Convex
  const documents = useQuery(api.documents.getPublishedDocuments) || []
  const profiles = useQuery(api.profiles.getPublishedProfiles) || []
  const [blogViews, setBlogViews] = useState<PageViewsData>({});
  const [profileViews, setProfileViews] = useState<PageViewsData>({});

  // Analytics fetching
  const fetchAnalytics = useCallback(async () => {
    try {

      // Fetch blog views
      const blogResponse = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '365daysAgo',
          endDate: 'today',
          pageId: '/blog/',
        }),
      });

      if (!blogResponse.ok) throw new Error(`HTTP error! status: ${blogResponse.status}`);
      const blogData = await blogResponse.json();

      // Process blog views
      const viewsByPath: Record<string, number> = {};
      blogData.viewsOverTime.forEach((view: any) => {
        const path = view.pagePath;
        viewsByPath[path] = (viewsByPath[path] || 0) + view.views;
      });

      // Match blog views with documents
      const blogViewsMap = documents.reduce((acc: PageViewsData, doc) => {
        if (doc.slug) {
          const fullPath = `/blog/${doc.slug}`;
          acc[doc.slug] = viewsByPath[fullPath] || 0;
        }
        return acc;
      }, {});

      // Fetch profile views
      const profileViewsPromises = profiles.map(async (profile) => {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: '365daysAgo',
            endDate: 'today',
            pageId: `/profile/${profile._id}`,
          }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return { id: profile._id, views: data.pageViews || 0 };
      });

      const profileResults = await Promise.all(profileViewsPromises);
      const profileViewsMap = profileResults.reduce((acc: PageViewsData, result) => {
        if (result.id) {
          acc[result.id] = result.views;
        }
        return acc;
      }, {});

      // Calculate total views
      const totalBlogViews = Object.values(blogViewsMap).reduce((sum, views) => sum + views, 0);
      const totalProfileViews = Object.values(profileViewsMap).reduce((sum, views) => sum + views, 0);
      setTotalViews(totalBlogViews + totalProfileViews);

      setBlogViews(blogViewsMap);
      setProfileViews(profileViewsMap);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [documents, profiles]);


  // Convert Convex data to Sites
  const sites: Site[] = [
    ...documents.map(doc => ({
      id: doc._id,
      name: doc.title,
      type: 'blog' as const,
      views: doc.slug ? blogViews[doc.slug] || 0 : 0,
      likes: doc.likeCount || 0,
      published: new Date(doc._creationTime).toISOString(),
      date: new Date(doc._creationTime).toISOString() // Add date field
    })),
    ...profiles.map(profile => ({
      id: profile._id,
      name: profile.displayName,
      type: 'profile' as const,
      views: profileViews[profile._id] || 0,
      likes: Math.floor(Math.random() * 100),
      published: new Date(profile._creationTime || Date.now()).toISOString(),
      date: new Date(profile._creationTime || Date.now()).toISOString() // Add date field
    }))
  ];

  // Fetch analytics on mount and when documents/profiles change
  useEffect(() => {
    if (documents.length > 0 || profiles.length > 0) {
      fetchAnalytics();
    }
  }, [documents, profiles, fetchAnalytics]);




  const filterData = (data: Site[]) => {
    return data.filter(item => {
      const passesSearchFilter = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      return passesSearchFilter
    })
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

  const handleCreateProfile = async () => {
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

  const sortData = (data: Site[]) => {
    return [...data].sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  }

  // Filter sites based on active tab (assume all existing sites are personal)
  const tabFilteredSites = activeTab === "personal" ? sites : []
  const filteredAndSortedData = sortData(filterData(tabFilteredSites))
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getTagStyles = (type: string) => {
    switch (type) {
      case "blog":
        return "bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full"
      case "profile":
        return "bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full"
      case "event":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full"
    }
  }


  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">{user?.fullName}&apos;s Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{sites.length}</div>
            <p className="text-sm text-muted-foreground">Total Published Sites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{totalViews.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">0</div>
            <p className="text-sm text-muted-foreground">Meetings (30 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">0</div>
            <p className="text-sm text-muted-foreground">Opportunities (30 days)</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-6">My Sites</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "personal"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("personal")}
                >
                  Personal Sites
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "team"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab("team")}
                >
                  Team Sites
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{filteredAndSortedData.length}</span> Sites
              </div>
            </div>
            
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search Sites"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="w-12 text-left pl-6">
                    <Checkbox
                      checked={selectedSites.length === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSites([...selectedSites, ...paginatedData.map(site => site.id)])
                        } else {
                          setSelectedSites(selectedSites.filter(id => !paginatedData.map(site => site.id).includes(id)))
                        }
                      }}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </TableHead>
                  <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100 pl-6">
                    Name
                  </TableHead>
                  <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100 pl-4">Type</TableHead>
                  <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100 pl-4">Views</TableHead>
                  <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100 pl-4">Likes</TableHead>
                  <TableHead className="text-left font-medium text-gray-900 dark:text-gray-100 pl-4">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((site) => (
                    <TableRow key={site.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="pl-6 py-4">
                        <Checkbox
                          checked={selectedSites.includes(site.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSites([...selectedSites, site.id])
                            } else {
                              setSelectedSites(selectedSites.filter(id => id !== site.id))
                            }
                          }}
                          className="border-gray-300 dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100 pl-6 py-4">{site.name}</TableCell>
                      <TableCell className="pl-4 py-4">
                        <span className={getTagStyles(site.type)}>
                          {site.type.charAt(0).toUpperCase() + site.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300 pl-4 py-4">{site.views.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300 pl-4 py-4">{site.likes.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300 pl-4 py-4">{new Date(site.published).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-96">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Image
                          src={theme === 'dark' ? '/empty-dark.png' : '/empty.png'}
                          alt="Empty state"
                          width={200}
                          height={150}
                          className="opacity-50"
                        />
                        {activeTab === "team" ? (
                          <Button disabled className="bg-gray-300 text-gray-500 cursor-not-allowed">
                            Team Sites Coming Soon
                          </Button>
                        ) : (
                          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                              <Button onClick={() => setIsCreateDialogOpen(true)}>
                                New Site
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Create New Site</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <button
                                  onClick={() => {
                                    handleCreate()
                                    setIsCreateDialogOpen(false)
                                  }}
                                  className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-2 9h2m-2 0V9.5m0 10.5H9" />
                                    </svg>
                                  </div>
                                  <span className="font-medium text-gray-900">Blog</span>
                                  <span className="text-sm text-gray-500 text-center">Create articles and posts</span>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    handleCreateProfile()
                                    setIsCreateDialogOpen(false)
                                  }}
                                  className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium text-gray-900">Profile</span>
                                  <span className="text-sm text-gray-500 text-center">Personal or company page</span>
                                </button>
                                
                                <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium text-gray-400">Event</span>
                                  <span className="text-sm text-gray-400 text-center">Coming soon</span>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                  <span className="font-medium text-gray-400">Deal Room</span>
                                  <span className="text-sm text-gray-400 text-center">Coming soon</span>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} sites
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="text-sm"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

