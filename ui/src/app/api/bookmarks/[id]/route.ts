// app/api/bookmarks/fetch-title/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch webpage')
    }

    const html = await response.text()
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error fetching title:', error)
    return NextResponse.json(
      { error: 'Failed to fetch title' },
      { status: 500 }
    )
  }
}