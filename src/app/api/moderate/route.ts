import { NextRequest, NextResponse } from 'next/server'
import { moderateContent, isAcademicContext } from '@/lib/moderationUtils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Moderation API is working',
    message: 'Use POST method with JSON body: { "text": "your review text" }',
    methods: ['GET', 'POST'],
    features: [
      'Content moderation with naughty-words',
      'Obfuscation detection',
      'Academic context awareness',
      'Length validation (10-2000 chars)'
    ]
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { status: 'REJECTED', reason: 'Invalid input text' },
        { status: 400 }
      )
    }

    // Step 1: Try advanced content moderation with error handling
    let moderationResult
    try {
      moderationResult = moderateContent(text)
    } catch (moderationError) {
      console.error('Moderation function failed:', moderationError)
      // Fallback to basic checks
      moderationResult = {
        isClean: text.length >= 10 && text.length <= 2000,
        reason: text.length < 10 ? 'Review is too short' : 
                text.length > 2000 ? 'Review is too long' : undefined,
        severity: 'clean' as const
      }
    }

    const academic = isAcademicContext(text)
    
    if (!moderationResult.isClean) {
      // Log the moderation decision
      const severity = moderationResult.severity === 'hard' ? 'REJECTED_HARD' : 'REJECTED_SOFT'
      try {
        await logModerationDecision(text, severity, moderationResult.reason || 'Content moderation triggered', 'AUTO')
      } catch (logError) {
        console.error('Failed to log moderation decision:', logError)
      }
      
      // Be more lenient for academic content with soft violations
      if (academic && moderationResult.severity === 'soft') {
        // Allow academic content with soft violations but log it
        try {
          await logModerationDecision(text, 'ACCEPTED', 'Academic context override for soft violation', 'AUTO')
        } catch (logError) {
          console.error('Failed to log academic override:', logError)
        }
      } else {
        return NextResponse.json(
          { 
            status: 'REJECTED', 
            reason: moderationResult.reason || 'Please revise your content and try again.'
          },
          { status: 400 }
        )
      }
    }

    // Step 2: Length check
    if (text.length < 10) {
      return NextResponse.json(
        { status: 'REJECTED', reason: 'Review is too short' },
        { status: 400 }
      )
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { status: 'REJECTED', reason: 'Review is too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Note: Caps and spam checking now handled in moderateContent function

    // Step 4: LLM moderation (optional, can be enabled with environment variable)
    if (process.env.ENABLE_LLM_MODERATION === 'true') {
      try {
        const llmResult = await checkWithLLM(text)
        if (llmResult.isRejected) {
          try {
            await logModerationDecision(text, 'REJECTED_SOFT', llmResult.reason, 'LLM')
          } catch (logError) {
            console.error('Failed to log LLM rejection:', logError)
          }
          
          return NextResponse.json(
            { status: 'REJECTED', reason: llmResult.reason },
            { status: 400 }
          )
        }
      } catch (llmError) {
        console.error('LLM moderation failed:', llmError)
        // Continue without LLM moderation if it fails
      }
    }

    // If all checks pass
    try {
      await logModerationDecision(text, 'ACCEPTED', 'Passed all moderation checks', 'AUTO')
    } catch (logError) {
      console.error('Failed to log acceptance:', logError)
    }
    
    return NextResponse.json({ status: 'ACCEPTED' })

  } catch (error) {
    console.error('Moderation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { status: 'ERROR', reason: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// Helper function for LLM moderation (can be implemented later)
async function checkWithLLM(text: string): Promise<{ isRejected: boolean; reason: string }> {
  // This can be implemented with OpenAI, local Ollama, or other LLM services
  // For now, return accepted to avoid blocking
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a content moderator for academic reviews. Classify the following review as ACCEPTABLE or REJECTABLE. Reply with only ACCEPTABLE or REJECTABLE followed by a brief reason if rejectable.'
            },
            {
              role: 'user',
              content: `Review text: "${text}"`
            }
          ],
          max_tokens: 50,
          temperature: 0
        })
      })
      
      const data = await response.json()
      const result = data.choices?.[0]?.message?.content?.toLowerCase() || 'acceptable'
      
      if (result.includes('rejectable')) {
        return { isRejected: true, reason: 'Content flagged by AI moderation' }
      }
    } catch (error) {
      console.error('OpenAI moderation error:', error)
    }
  }
  
  return { isRejected: false, reason: '' }
}

// Helper function to log moderation decisions
async function logModerationDecision(
  inputText: string, 
  decision: string, 
  reason: string, 
  method: string
) {
  try {
    // This will be implemented when we add the database integration
    // For now, just log to console
    console.log('Moderation Log:', {
      decision,
      reason,
      method,
      textLength: inputText.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log moderation decision:', error)
  }
} 