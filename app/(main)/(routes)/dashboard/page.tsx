"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import { useCallback, useEffect, useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"

// Sample data for charts (now using percentages)
const chartData = [
  { name: "Jan", responseRate: 40, openRate: 60, opportunities: 20 },
  { name: "Feb", responseRate: 50, openRate: 70, opportunities: 25 },
  { name: "Mar", responseRate: 60, openRate: 80, opportunities: 30 },
  { name: "Apr", responseRate: 70, openRate: 75, opportunities: 35 },
  { name: "May", responseRate: 80, openRate: 90, opportunities: 40 },
]

interface ChartDataItem {
  name: string;
  pageViews: number;
}

interface Document {
  _id: Id<"documents">;
  _creationTime: number;
  content?: string;
  authorFullName?: string;
  authorImageUrl?: string;
  slug?: string;
  title: string;
  isPublished: boolean;
  // Add any other fields from your Convex schema
}

interface Profile {
  _id: Id<"profiles">;
  displayName: string;
  userId: string;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
}

interface PageViewsData {
  [key: string]: number;
}

interface AnalyticsResult {
  slug: string;
  views: number;
}

export default function Dashboard() {
  const documents = useQuery(api.documents.getPublishedDocuments) || []
  const profiles = useQuery(api.profiles.getPublishedProfiles) || []
  const { user } = useUser();
  const [blogViews, setBlogViews] = useState<PageViewsData>({});
  const [profileViews, setProfileViews] = useState<PageViewsData>({});
  const [totalViewsData, setTotalViewsData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const pollInterval = 30000; 
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics at:', new Date().toISOString());

      // Single request for all blog views
      const blogResponse = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '7daysAgo',
          endDate: 'today',
          pageId: '/blog/',
        }),
      });

      if (!blogResponse.ok) {
        throw new Error(`HTTP error! status: ${blogResponse.status}`);
      }

      const blogData = await blogResponse.json();
      console.log('Blog analytics response:', blogData);

      // Create a map of blog views by path
      const viewsByPath: Record<string, number> = {};
      blogData.viewsOverTime.forEach((view: any) => {
        const path = view.pagePath;
        viewsByPath[path] = (viewsByPath[path] || 0) + view.views;
      });

      // Match blog views with documents based on slug
      const blogViewsMap = documents.reduce((acc: PageViewsData, doc) => {
        if (doc.slug) {
          const fullPath = `/blog/${doc.slug}`;
          acc[doc.slug] = viewsByPath[fullPath] || 0;
        }
        return acc;
      }, {});

      // Fetch profile views (keeping your existing implementation)
      const profileViewsPromises = profiles.map(async (profile: Profile) => {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: '7daysAgo',
            endDate: 'today',
            pageId: `/profile/${profile._id}`,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Profile analytics for ${profile._id}:`, data);
        return { id: profile._id, views: data.pageViews || 0 };
      });

      // Process profile views
      const profileResults = await Promise.all(profileViewsPromises);
      const profileViewsMap = profileResults.reduce((acc: PageViewsData, result) => {
        if (result.id) {
          acc[result.id] = result.views;
        }
        return acc;
      }, {});

      // Fetch total views for charts (keeping your existing implementation)
      const totalResponse = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '30daysAgo',
          endDate: 'today',
        }),
      });

      if (!totalResponse.ok) {
        throw new Error(`HTTP error! status: ${totalResponse.status}`);
      }

      const totalData = await totalResponse.json();

      // Process chart data
      const chartData = totalData.viewsOverTime.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageViews: item.views,
      }));

      // Log processed data for debugging
      console.log('Processed Views:', {
        blogs: blogViewsMap,
        profiles: profileViewsMap,
        totalViews: chartData.reduce((sum: number, item: ChartDataItem) => sum + item.pageViews, 0)
      });

      // Update state
      setBlogViews(blogViewsMap);
      setProfileViews(profileViewsMap);
      setTotalViewsData(chartData);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [documents, profiles]);

  // Keep your existing useEffects
  useEffect(() => {
    if (documents.length > 0 || profiles.length > 0) {
      fetchAnalytics();
    }
  }, [documents, profiles, fetchAnalytics]);

  useEffect(() => {
    const interval = setInterval(fetchAnalytics, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mt-8">
        <h1 className="text-3xl font-bold">{user?.fullName}&apos;s Dashboard</h1>
        <Button 
          onClick={() => fetchAnalytics()}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Analytics'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
            <CardDescription>Average response rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ responseRate: { label: "Response Rate", color: "hsl(24, 95%, 60%)" } }} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="responseRate" stroke="hsl(24, 95%, 60%)" fill="hsl(24, 95%, 60%)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Rate</CardTitle>
            <CardDescription>Average open rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ openRate: { label: "Open Rate", color: "hsl(32, 95%, 60%)" } }} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="openRate" stroke="hsl(32, 95%, 60%)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities Created</CardTitle>
            <CardDescription>Number of opportunities over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ opportunities: { label: "Opportunities", color: "hsl(40, 95%, 60%)" } }} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="opportunities" fill="hsl(40, 95%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Blogs</CardTitle>
            <CardDescription>List of all published blogs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, index) => (
                    <TableRow key={doc._id}>
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>
                        {loading ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : (
                          // Safely access pageViews with optional chaining and string key
                          doc.slug ? blogViews[doc.slug] || 0 : 0
                        )}
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 50)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>List of all published profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prospect Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Meetings Booked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile, index) => (
                    <TableRow key={profile._id}>
                      <TableCell>{profile.displayName}</TableCell>
                      <TableCell>Citadel</TableCell>
                      {/* <TableCell>{profile.role || 'N/A'}</TableCell> */}
                      <TableCell>
                        {loading ? (
                            <span className="text-gray-400">Loading...</span>
                          ) : (
                            profileViews[profile._id] || 0
                          )}
                      </TableCell>
                      <TableCell>{(Math.random() * (5 - 3) + 3).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="text-center text-gray-500 mt-8">
          Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  )
}