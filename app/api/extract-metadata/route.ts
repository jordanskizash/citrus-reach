// app/api/extract-metadata/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let requestUrl = '';
  
  try {
    const { url } = await req.json()
    requestUrl = url;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract metadata using regex
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const ogDescriptionMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);

    // Assemble metadata with fallbacks
    const metadata = {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || requestUrl.split('/').pop() || 'Untitled',
      description: ogDescriptionMatch?.[1] || descriptionMatch?.[1] || '',
      image: ogImageMatch?.[1] || '',
    };

    console.log('Metadata extracted successfully:', metadata);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error in metadata extraction:', error);
    
    // Return basic metadata if extraction fails
    return NextResponse.json({
      title: requestUrl.split('/').pop() || 'Untitled',
      description: '',
      image: '',
    });
  }
}

// Configure CORS
export const runtime = 'edge'

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}