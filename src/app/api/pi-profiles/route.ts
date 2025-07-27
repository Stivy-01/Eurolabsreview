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
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const institution = searchParams.get('institution')
    const minRating = searchParams.get('min_rating')
    
    let profileQuery = supabase
      .from('pi_profiles')
      .select('*')
      .order('review_count', { ascending: false })
      .limit(limit)
    
    // Add search filters
    if (query) {
      profileQuery = profileQuery.or(`name.ilike.%${query}%,institution.ilike.%${query}%`)
    }
    
    if (institution) {
      profileQuery = profileQuery.ilike('institution', `%${institution}%`)
    }
    
    if (minRating) {
      profileQuery = profileQuery.gte('average_rating', parseFloat(minRating))
    }
    
    const { data: profiles, error } = await profileQuery
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch PI profiles' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ profiles: profiles || [] })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 