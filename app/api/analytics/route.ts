// app/api/analytics/route.ts
import { google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const analytics = google.analyticsdata('v1beta');

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
    const { userId } = getAuth(req);
    const { startDate, endDate } = await req.json();
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authClient = await getJWTClient();

    // Updated query without user filtering for initial test
    const viewsResponse = await analytics.properties.runReport({
      auth: authClient,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'date' },
          { name: 'eventName' }
        ],
        metrics: [
          { name: 'eventCount' },
          { name: 'totalUsers' }
        ]
      }
    });

    // For debugging
    console.log('GA4 Response:', JSON.stringify(viewsResponse.data, null, 2));

    const viewsOverTime = viewsResponse.data.rows?.map(row => ({
      date: row.dimensionValues?.[0].value,
      eventName: row.dimensionValues?.[1].value,
      count: parseInt(row.metricValues?.[0].value || '0'),
      users: parseInt(row.metricValues?.[1].value || '0')
    })) || [];

    return NextResponse.json({
      pageViews: viewsOverTime.reduce((sum, day) => sum + day.count, 0),
      uniqueVisitors: viewsOverTime.reduce((sum, day) => sum + day.users, 0),
      interactions: {
        email: viewsOverTime.filter(v => v.eventName === 'email_click').reduce((sum, v) => sum + v.count, 0),
        calendar: viewsOverTime.filter(v => v.eventName === 'calendar_open').reduce((sum, v) => sum + v.count, 0),
        linkedin: viewsOverTime.filter(v => v.eventName === 'linkedin_click').reduce((sum, v) => sum + v.count, 0),
        share: viewsOverTime.filter(v => v.eventName === 'share_profile').reduce((sum, v) => sum + v.count, 0)
      },
      viewsOverTime,
      debug: viewsResponse.data // Added for debugging
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}