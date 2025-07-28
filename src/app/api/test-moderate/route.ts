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

    // Test 1: Basic import test
    let importStatus = 'unknown'
    try {
      // @ts-ignore - naughty-words may not have perfect TypeScript support
      const { en } = await import('naughty-words')
      importStatus = 'success'
    } catch (importError) {
      importStatus = 'failed'
      console.error('Import error:', importError)
    }

    // Test 2: Simple moderation without naughty-words
    const simpleModeration = {
      isClean: text.length > 0,
      reason: text.length === 0 ? 'Empty text' : undefined,
      severity: text.length === 0 ? 'hard' : 'clean' as const
    }
    
    return NextResponse.json({
      status: 'Moderation test completed',
      importStatus,
      simpleModeration,
      inputLength: text.length,
      inputText: text.substring(0, 50) + (text.length > 50 ? '...' : '')
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