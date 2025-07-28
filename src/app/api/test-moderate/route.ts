import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Moderation test endpoint is working',
    message: 'Use POST method with JSON body: { "text": "your test text" }',
    methods: ['GET', 'POST']
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({
        error: 'No text provided',
        message: 'Send JSON with "text" field'
      }, { status: 400 })
    }

    // Test 1: Check if "flower" is being flagged
    const hasFlower = text.toLowerCase().includes('flower')
    const flowerWords = text.toLowerCase().split(/\s+/).filter((word: string) => word.includes('flower'))
    
    // Test 2: Check the actual moderation API
    let moderationResult = null
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      moderationResult = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      }
    } catch (error) {
      moderationResult = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return NextResponse.json({
      status: 'Moderation test completed',
      inputText: text,
      inputLength: text.length,
      hasFlower,
      flowerWords,
      moderationResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Moderation test error:', error)
    return NextResponse.json({
      error: 'Moderation test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 