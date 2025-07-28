import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        error: 'Supabase not configured'
      }, { status: 503 })
    }

    const body = await request.json()
    console.log('Test review submission - received data:', body)
    
    // Validate required fields
    const { pi_name, institution, lab_group_name, field, position, year, ratings, review_text, is_anonymous, reviewer_name } = body
    
    if (!pi_name || !institution || !position || !year || !ratings) {
      return NextResponse.json({
        error: 'Missing required fields',
        missing: {
          pi_name: !pi_name,
          institution: !institution,
          position: !position,
          year: !year,
          ratings: !ratings
        }
      }, { status: 400 })
    }
    
    // Validate position
    const validPositions = ['PhD', 'Postdoc', 'Intern', 'Visitor']
    if (!validPositions.includes(position)) {
      return NextResponse.json({
        error: 'Invalid position',
        received: position,
        valid: validPositions
      }, { status: 400 })
    }
    
    // Validate year
    const currentYear = new Date().getFullYear()
    if (year < 2015 || year > currentYear) {
      return NextResponse.json({
        error: 'Invalid year',
        received: year,
        valid: '2015-' + currentYear
      }, { status: 400 })
    }
    
    // Validate ratings
    const requiredRatingKeys = ['supervision', 'communication', 'career_help', 'work_life_balance', 'lab_environment']
    const ratingErrors = []
    for (const key of requiredRatingKeys) {
      if (!ratings[key] || ratings[key] < 1 || ratings[key] > 5) {
        ratingErrors.push(`${key}: ${ratings[key]} (should be 1-5)`)
      }
    }
    
    if (ratingErrors.length > 0) {
      return NextResponse.json({
        error: 'Invalid ratings',
        details: ratingErrors
      }, { status: 400 })
    }
    
    // Test the actual insert
    const insertData = {
      pi_name: pi_name.trim(),
      institution: institution.trim(),
      lab_group_name: lab_group_name?.trim() || null,
      field: field?.trim() || null,
      position,
      year,
      ratings,
      review_text: review_text?.trim() || null,
      is_anonymous: is_anonymous !== false, // Default to true if not specified
      reviewer_name: is_anonymous === false ? reviewer_name.trim() : null,
      is_flagged: false,
      is_approved: true // Auto-approve for MVP, can be changed later
    }
    
    console.log('Test review submission - attempting insert with data:', insertData)
    
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert(insertData)
      .select()
      .single()
    
    if (insertError) {
      console.error('Test review submission - database insert error:', insertError)
      return NextResponse.json({
        error: 'Database insert failed',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.code === '23505' ? 'Duplicate entry' : 
              insertError.code === '23514' ? 'Constraint violation' : 'Unknown database error'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'Test review submission successful',
      review: review,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Test review submission - unexpected error:', error)
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 