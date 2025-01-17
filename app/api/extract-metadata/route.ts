// app/api/extract-metadata/route.ts
import { NextResponse } from 'next/server'
import getMetadata from 'metadata-scraper'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const metadata = await getMetadata(url)

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
    })
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return NextResponse.json(
      { error: 'Failed to extract metadata' },
      { status: 500 }
    )
  }
}