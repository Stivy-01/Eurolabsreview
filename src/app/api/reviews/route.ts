import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up your Supabase environment variables.' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const piName = searchParams.get('pi_name')
    const institution = searchParams.get('institution')
    const labGroupName = searchParams.get('lab_group_name')
    const field = searchParams.get('field')
    const position = searchParams.get('position')
    const yearFrom = searchParams.get('year_from')
    const yearTo = searchParams.get('year_to')
    const minRating = searchParams.get('min_rating')
    
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Add filters if provided
    if (piName) {
      query = query.ilike('pi_name', `%${piName}%`)
    }
    
    if (institution) {
      query = query.ilike('institution', `%${institution}%`)
    }
    
    if (labGroupName) {
      query = query.ilike('lab_group_name', `%${labGroupName}%`)
    }
    
    if (field) {
      query = query.ilike('field', `%${field}%`)
    }
    
    if (position) {
      query = query.eq('position', position)
    }
    
    if (yearFrom) {
      query = query.gte('year', parseInt(yearFrom))
    }
    
    if (yearTo) {
      query = query.lte('year', parseInt(yearTo))
    }
    
    // For minimum rating, we need to calculate the average rating per review
    // This is a simplified approach - in production you might want to use a view or function
    let { data: reviews, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }
    
    // Apply minimum rating filter if specified
    if (minRating && reviews) {
      const minRatingNum = parseFloat(minRating)
      reviews = reviews.filter(review => {
        const avgRating = (
          review.ratings.supervision +
          review.ratings.communication +
          review.ratings.career_help +
          review.ratings.work_life_balance +
          review.ratings.lab_environment
        ) / 5
        return avgRating >= minRatingNum
      })
    }
    
    return NextResponse.json({ reviews: reviews || [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured. Environment variables missing.')
      return NextResponse.json(
        { 
          error: 'Database not configured. Please set up your Supabase environment variables.',
          details: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
          }
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    console.log('Received review data:', body)
    
    // Validate required fields
    const { pi_name, institution, lab_group_name, field, position, year, ratings, review_text, is_anonymous, reviewer_name } = body
    
    if (!pi_name || !institution || !position || !year || !ratings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate reviewer identification
    if (is_anonymous === false && (!reviewer_name || reviewer_name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'Reviewer name is required when not anonymous' },
        { status: 400 }
      )
    }
    
    // Validate position
    const validPositions = ['PhD', 'Postdoc', 'Intern', 'Visitor']
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      )
    }
    
    // Validate year
    const currentYear = new Date().getFullYear()
    if (year < 2015 || year > currentYear) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      )
    }
    
    // Validate ratings
    const requiredRatingKeys = ['supervision', 'communication', 'career_help', 'work_life_balance', 'lab_environment']
    for (const key of requiredRatingKeys) {
      if (!ratings[key] || ratings[key] < 1 || ratings[key] > 5) {
        return NextResponse.json(
          { error: `Invalid rating for ${key}` },
          { status: 400 }
        )
      }
    }
    
    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
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
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      console.error('Attempted to insert data:', {
        pi_name: pi_name.trim(),
        institution: institution.trim(),
        lab_group_name: lab_group_name?.trim() || null,
        field: field?.trim() || null,
        position,
        year,
        ratings,
        review_text: review_text?.trim() || null,
        is_anonymous: is_anonymous !== false,
        reviewer_name: is_anonymous === false ? reviewer_name.trim() : null,
        is_flagged: false,
        is_approved: true
      })
      return NextResponse.json(
        { error: `Failed to submit review: ${insertError.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Review submitted successfully',
      review 
    }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 