// app/api/analytics/route.ts
import { google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const analytics = google.analyticsdata('v1beta');

// Define interface for the expected request body
interface AnalyticsRequestBody {
  startDate: string;
  endDate: string;
  pageId?: string;  // Optional - used when querying specific page analytics
  pageTitle?: string;  // Optional - used for tracking new page views
}

// Define interface for the analytics response data
interface AnalyticsResponseData {
  pageViews: number;
  uniqueVisitors: number;
  viewsOverTime: Array<{
    date: string;
    pagePath: string;
    views: number;
    users: number;
  }>;
}

async function getJWTClient() {
  const client = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });
  
  await client.authorize();
  return client;
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body and get GA4 property ID from environment
    const { startDate, endDate, pageId }: AnalyticsRequestBody = await req.json();
    const propertyId = process.env.GA4_PROPERTY_ID;

    const authClient = await getJWTClient();

    // Build the analytics query
    const viewsResponse = await analytics.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },  // Track which page was viewed
          { name: 'date' }       // Track when it was viewed
        ],
        metrics: [
          { name: 'screenPageViews' },  // Count of page views
          { name: 'totalUsers' }        // Count of unique users
        ],
        // Only add the filter if we're querying a specific page
        dimensionFilter: pageId ? {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: pageId,  // Filter for specific page if pageId is provided
            },
          },
        } : undefined,
      }
    });

    // Process the response data
    const viewsOverTime = viewsResponse.data.rows?.map(row => ({
      date: row.dimensionValues?.[1].value ?? '',
      pagePath: row.dimensionValues?.[0].value ?? '',
      views: parseInt(row.metricValues?.[0].value ?? '0'),
      users: parseInt(row.metricValues?.[1].value ?? '0')
    })) || [];

    // Calculate totals and return formatted response
    const responseData: AnalyticsResponseData = {
      pageViews: viewsOverTime.reduce((sum, day) => sum + day.views, 0),
      uniqueVisitors: viewsOverTime.reduce((sum, day) => sum + day.users, 0),
      viewsOverTime
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}