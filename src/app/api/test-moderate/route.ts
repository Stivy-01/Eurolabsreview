import { NextRequest, NextResponse } from 'next/server'
import { moderateContent } from '@/lib/moderationUtils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({
        error: 'No text provided'
      }, { status: 400 })
    }

    // Test moderation
    const result = moderateContent(text)
    
    return NextResponse.json({
      status: 'Moderation test successful',
      result: result,
      inputLength: text.length
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Moderation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 