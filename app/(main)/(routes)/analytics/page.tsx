"use client";

import { useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { CalendarIcon } from "lucide-react"
import { addDays, format, eachDayOfInterval } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data for the dashboard
const overviewData = [
  { name: "Total Page Views", value: "45,231" },
  { name: "Unique Visitors", value: "21,320" },
  { name: "Avg. Time on Site", value: "3m 42s" },
  { name: "Leads Generated", value: "1,543" },
]

// Function to generate mock daily data for each page
const generatePageViewData = (startDate: Date, endDate: Date) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  return days.map(day => ({
    date: format(day, "MMM dd"),
    Home: Math.floor(Math.random() * 1000) + 500,
    Products: Math.floor(Math.random() * 800) + 300,
    About: Math.floor(Math.random() * 500) + 200,
    Contact: Math.floor(Math.random() * 300) + 100,
    Blog: Math.floor(Math.random() * 600) + 250,
  }))
}

const pageDetailsData = [
  { name: "Home", views: 12000, uniqueViews: 10000, responses: 500, leads: 200, contacts: 150 },
  { name: "Products", views: 8000, uniqueViews: 7000, responses: 400, leads: 180, contacts: 120 },
  { name: "About", views: 5000, uniqueViews: 4500, responses: 200, leads: 80, contacts: 60 },
  { name: "Contact", views: 4000, uniqueViews: 3800, responses: 300, leads: 150, contacts: 100 },
  { name: "Blog", views: 6000, uniqueViews: 5500, responses: 250, leads: 100, contacts: 75 },
]

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const pageViewData = dateRange?.from && dateRange?.to
    ? generatePageViewData(dateRange.from, dateRange.to)
    : []

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Website Analytics</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {overviewData.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>
            Compare page views across different pages for the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={pageViewData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Home" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="Products" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="About" stroke="#ffc658" strokeWidth={2} />
              <Line type="monotone" dataKey="Contact" stroke="#ff7300" strokeWidth={2} />
              <Line type="monotone" dataKey="Blog" stroke="#a4de6c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Performance Details</CardTitle>
          <CardDescription>
            Detailed metrics for each page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Unique Views</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Contacts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageDetailsData.map((page) => (
                <TableRow key={page.name}>
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell>{page.views.toLocaleString()}</TableCell>
                  <TableCell>{page.uniqueViews.toLocaleString()}</TableCell>
                  <TableCell>{page.responses.toLocaleString()}</TableCell>
                  <TableCell>{page.leads.toLocaleString()}</TableCell>
                  <TableCell>{page.contacts.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}