// app/(main)/analytics-test/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AnalyticsTest() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get data for last 7 days
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalyticsData(data)
      console.log('Analytics Data:', data) // For debugging
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Test function to trigger some events
  const triggerTestEvents = () => {
    // Trigger a few test events using our analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'test_event', {
        event_category: 'testing',
        event_label: 'test_label'
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Test Dashboard</h1>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button 
            onClick={fetchAnalytics}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Fetch Analytics'}
          </Button>

          <Button 
            variant="outline"
            onClick={triggerTestEvents}
          >
            Trigger Test Events
          </Button>
        </div>

        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-md">
            Error: {error}
          </div>
        )}

        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.pageViews}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analyticsData.uniqueVisitors}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Email Clicks: {analyticsData.interactions.email}</p>
                  <p>Calendar Opens: {analyticsData.interactions.calendar}</p>
                  <p>LinkedIn Clicks: {analyticsData.interactions.linkedin}</p>
                  <p>Profile Shares: {analyticsData.interactions.share}</p>
                </div>
              </CardContent>
            </Card>

            {analyticsData.viewsOverTime && (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>Raw Data (for debugging)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(analyticsData, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}