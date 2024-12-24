"use client"

import * as React from "react"
import { Search, X, ArrowUpDown, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [timeFilter, setTimeFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortColumn, setSortColumn] = React.useState<keyof Site>("name")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalViews, setTotalViews] = useState(0)
  const [totalMeetings, setTotalMeetings] = useState(0)
  const [totalOpportunities, setTotalOpportunities] = useState(0)
  const itemsPerPage = 6
  const { user } = useUser();
  
  // Fetch data from Convex
  const documents = useQuery(api.documents.getPublishedDocuments) || []
  const profiles = useQuery(api.profiles.getPublishedProfiles) || []
  const [blogViews, setBlogViews] = useState<PageViewsData>({});
  const [profileViews, setProfileViews] = useState<PageViewsData>({});
  const [loading, setLoading] = useState(true);

  // Analytics fetching
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }, [documents, profiles]);

  type Activity = {
    id: number;
    content: string;
    timestamp: string;
    siteId: string; // Add this property for the link reference
    siteName: string; // Add this property for displaying the site name
  }
  
  const activities: Activity[] = [
    { 
      id: 1, 
      content: "John Smith registered for", 
      timestamp: "2024-03-15T14:30:00Z", 
      siteId: "12", 
      siteName: "Cloud Computing Summit"
    },
    { 
      id: 2, 
      content: "Sarah Williams liked", 
      timestamp: "2024-03-15T13:45:00Z", 
      siteId: "7", 
      siteName: "AI Research Blog"
    },
    { 
      id: 3, 
      content: "Mike Chen replied to", 
      timestamp: "2024-03-15T12:20:00Z", 
      siteId: "15", 
      siteName: "Python Programming Blog"
    },
    { 
      id: 4, 
      content: "Emma Davis shared", 
      timestamp: "2024-03-15T11:15:00Z", 
      siteId: "8", 
      siteName: "Design Workshop Event"
    },
    { 
      id: 5, 
      content: "Alex Johnson registered for", 
      timestamp: "2024-03-15T10:30:00Z", 
      siteId: "6", 
      siteName: "Local Hackathon"
    },
    { 
      id: 6, 
      content: "Lisa Brown liked", 
      timestamp: "2024-03-15T09:45:00Z", 
      siteId: "10", 
      siteName: "Mobile Dev Conference"
    },
    { 
      id: 7, 
      content: "Tom Wilson replied to", 
      timestamp: "2024-03-15T09:00:00Z", 
      siteId: "11", 
      siteName: "React Tips & Tricks"
    },
    { 
      id: 8, 
      content: "Rachel Green shared", 
      timestamp: "2024-03-15T08:15:00Z", 
      siteId: "5", 
      siteName: "Jane Smith's Portfolio"
    }
  ];

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


  const typeOptions = [
    { value: "blog", label: "Blog" },
    { value: "profile", label: "Profile" },
    { value: "event", label: "Event" },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' at')
  }

  const filterData = (data: Site[]) => {
    return data.filter(item => {
      const now = new Date()
      const itemDate = new Date(item.date)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

      const passesTimeFilter = (() => {
        switch (timeFilter) {
          case "week":
            return itemDate >= weekAgo
          case "month":
            return itemDate >= monthAgo
          case "3months":
            return itemDate >= threeMonthsAgo
          case "year":
            return itemDate >= yearAgo
          default:
            return true
        }
      })()

      const passesTypeFilter = typeFilter.length === 0 || typeFilter.includes(item.type)
      const passesSearchFilter = item.name.toLowerCase().includes(searchTerm.toLowerCase())

      return passesTimeFilter && passesTypeFilter && passesSearchFilter
    })
  }

  const sortData = (data: Site[]) => {
    return [...data].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  const filteredAndSortedData = sortData(filterData(sites))
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getTagStyles = (type: string) => {
    switch (type) {
      case "blog":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "profile":
        return "bg-orange-50 text-orange-700 border border-orange-200"
      case "event":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const handleSort = (column: keyof Site) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
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
            <div className="text-2xl font-bold text-orange-500">{totalMeetings}</div>
            <p className="text-sm text-muted-foreground">Meetings (30 days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{totalOpportunities}</div>
            <p className="text-sm text-muted-foreground">Opportunities (30 days)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>All Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative w-[300px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sites..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {(searchTerm || typeFilter.length > 0) && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm("")
                        setTypeFilter([])
                      }}
                      className="h-8 px-2 lg:px-3"
                    >
                      Reset
                      <X className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={typeFilter.join(",")}
                    onValueChange={(value) => {
                      const selectedTypes = value.split(",").filter(Boolean)
                      setTypeFilter(selectedTypes)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type">
                        {typeFilter.length > 0 
                          ? `${typeFilter.length} selected`
                          : "Select type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${option.value}`}
                              checked={typeFilter.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTypeFilter([...typeFilter, option.value])
                                } else {
                                  setTypeFilter(typeFilter.filter(t => t !== option.value))
                                }
                              }}
                            />
                            <label htmlFor={`type-${option.value}`}>{option.label}</label>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="week">Past week</SelectItem>
                      <SelectItem value="month">Past month</SelectItem>
                      <SelectItem value="3months">Past 3 months</SelectItem>
                      <SelectItem value="year">Past year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] text-left">
                      <Button variant="ghost" onClick={() => handleSort("name")} className="text-left">
                        Name
                        {sortColumn === "name" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-left">Type</TableHead>
                    <TableHead className="text-left">
                      <Button variant="ghost" onClick={() => handleSort("views")} className="text-left">
                        Views
                        {sortColumn === "views" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-left">
                      <Button variant="ghost" onClick={() => handleSort("likes")} className="text-left">
                        Likes
                        {sortColumn === "likes" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-left">
                      <Button variant="ghost" onClick={() => handleSort("published")} className="text-left">
                        Published
                        {sortColumn === "published" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedData.map((site) => (
                    <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>
                        <Badge variant="secondary" className={`${getTagStyles(site.type)} font-normal`}>
                        {site.type}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-left">{site.views.toLocaleString()}</TableCell>
                    <TableCell className="text-left">{site.likes.toLocaleString()}</TableCell>
                    <TableCell className="text-left">{new Date(site.published).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}</TableCell>
                    </TableRow>
                ))}
                {/* Add empty rows to maintain consistent height */}
                {Array.from({ length: Math.max(0, itemsPerPage - paginatedData.length) }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                    <TableCell className="h-[56px]">&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    </TableRow>
                ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex flex-col space-y-1">
                    <p className="text-sm">
                      {activity.content}{" "}
                      <a href={`#site-${activity.siteId}`} className="text-amber-500 hover:underline">
                        {activity.siteName}
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
function setTotalViews(arg0: number) {
  throw new Error("Function not implemented.")
}

