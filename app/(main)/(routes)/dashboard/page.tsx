"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/clerk-react"

// Sample data for charts (now using percentages)
const chartData = [
  { name: "Jan", responseRate: 40, openRate: 60, opportunities: 20 },
  { name: "Feb", responseRate: 50, openRate: 70, opportunities: 25 },
  { name: "Mar", responseRate: 60, openRate: 80, opportunities: 30 },
  { name: "Apr", responseRate: 70, openRate: 75, opportunities: 35 },
  { name: "May", responseRate: 80, openRate: 90, opportunities: 40 },
]

export default function Dashboard() {
  const documents = useQuery(api.documents.getPublishedDocuments) || []
  const profiles = useQuery(api.profiles.getPublishedProfiles) || []
  const { user } = useUser();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold mt-4">{user?.fullName}&apos;s Dashboard</h1>
      
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
                      <TableCell>{Math.floor(Math.random() * 1000)}</TableCell>
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
                      <TableCell>{Math.floor(Math.random() * 10)}</TableCell>
                      <TableCell>{(Math.random() * (5 - 3) + 3).toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}