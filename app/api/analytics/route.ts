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
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing required Google credentials');
      throw new Error('Missing Google credentials');
    }
  
    try {
      const client = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
      });
      
      await client.authorize();
      return client;
    } catch (error) {
      console.error('Error authorizing Google client:', error);
      throw error;
    }
  }

  export async function POST(req: NextRequest) {
    try {
      const { userId } = getAuth(req);
      const { startDate, endDate, pageId } = await req.json();
      const propertyId = process.env.GA4_PROPERTY_ID;
  
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      if (!propertyId) {
        console.error('Missing GA4_PROPERTY_ID');
        throw new Error('Missing GA4 property ID');
      }
  
      const authClient = await getJWTClient();
      
      console.log('Analytics Request:', {
        pageId,
        startDate,
        endDate,
        timestamp: new Date().toISOString()
      });
  
      const viewsResponse = await analytics.properties.runReport({
        auth: authClient,
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: 'pagePath' },
            { name: 'date' }
          ],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' }
          ],
          dimensionFilter: pageId ? {
            filter: {
              fieldName: 'pagePath',
              stringFilter: {
                matchType: 'CONTAINS',
                value: pageId,
              },
            },
          } : undefined,
        }
      });
  
      console.log('GA4 Response:', {
        pageId,
        hasData: !!viewsResponse.data.rows?.length,
        rowCount: viewsResponse.data.rows?.length,
        firstRow: viewsResponse.data.rows?.[0],
        allRows: viewsResponse.data.rows
      });
  
      const viewsOverTime = viewsResponse.data.rows?.map(row => ({
        date: row.dimensionValues?.[1].value ?? '',
        pagePath: row.dimensionValues?.[0].value ?? '',
        views: parseInt(row.metricValues?.[0].value ?? '0'),
        users: parseInt(row.metricValues?.[1].value ?? '0')
      })) || [];
  
      return NextResponse.json({
        pageViews: viewsOverTime.reduce((sum, day) => sum + day.views, 0),
        uniqueVisitors: viewsOverTime.reduce((sum, day) => sum + day.users, 0),
        viewsOverTime
      });
  
    } catch (error) {
      console.error('Analytics Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return NextResponse.json({ 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }