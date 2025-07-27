import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up your Supabase environment variables.' },
        { status: 503 }
      )
    }

    // Get total reviews count
    const { count: totalReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)

    if (reviewsError) {
      console.error('Error fetching reviews count:', reviewsError)
      return NextResponse.json(
        { error: 'Failed to fetch reviews count' },
        { status: 500 }
      )
    }

    // Get unique PIs count
    const { data: uniquePIs, error: pisError } = await supabase
      .from('reviews')
      .select('pi_name')
      .eq('is_approved', true)

    if (pisError) {
      console.error('Error fetching unique PIs:', pisError)
      return NextResponse.json(
        { error: 'Failed to fetch unique PIs' },
        { status: 500 }
      )
    }

    const uniquePICount = new Set(uniquePIs?.map(review => review.pi_name)).size

    // Get unique institutions count
    const { data: uniqueInstitutions, error: institutionsError } = await supabase
      .from('reviews')
      .select('institution')
      .eq('is_approved', true)

    if (institutionsError) {
      console.error('Error fetching unique institutions:', institutionsError)
      return NextResponse.json(
        { error: 'Failed to fetch unique institutions' },
        { status: 500 }
      )
    }

    const uniqueInstitutionCount = new Set(uniqueInstitutions?.map(review => review.institution)).size

    // Get unique countries count (from institutions)
    const { data: allInstitutions, error: countriesError } = await supabase
      .from('reviews')
      .select('institution')
      .eq('is_approved', true)

    if (countriesError) {
      console.error('Error fetching institutions for country count:', countriesError)
      return NextResponse.json(
        { error: 'Failed to fetch institutions for country count' },
        { status: 500 }
      )
    }

    // Simple country detection from institution names
    const countryKeywords = {
      'Germany': ['germany', 'deutschland', 'berlin', 'munich', 'heidelberg', 'max planck'],
      'France': ['france', 'paris', 'curie', 'pasteur', 'cnrs'],
      'Netherlands': ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'delft'],
      'Switzerland': ['switzerland', 'zurich', 'geneva', 'basel', 'eth'],
      'UK': ['united kingdom', 'uk', 'england', 'london', 'cambridge', 'oxford'],
      'Italy': ['italy', 'rome', 'milan', 'turin'],
      'Spain': ['spain', 'madrid', 'barcelona'],
      'Sweden': ['sweden', 'stockholm', 'uppsala'],
      'Denmark': ['denmark', 'copenhagen'],
      'Norway': ['norway', 'oslo'],
      'Finland': ['finland', 'helsinki'],
      'Belgium': ['belgium', 'brussels', 'leuven'],
      'Austria': ['austria', 'vienna'],
      'Poland': ['poland', 'warsaw'],
      'Czech Republic': ['czech', 'prague'],
      'Hungary': ['hungary', 'budapest'],
      'Portugal': ['portugal', 'lisbon'],
      'Ireland': ['ireland', 'dublin'],
      'Greece': ['greece', 'athens']
    }

    const detectedCountries = new Set<string>()
    
    allInstitutions?.forEach(review => {
      const institution = review.institution.toLowerCase()
      for (const [country, keywords] of Object.entries(countryKeywords)) {
        if (keywords.some(keyword => institution.includes(keyword))) {
          detectedCountries.add(country)
          break
        }
      }
    })

    const uniqueCountryCount = detectedCountries.size

    return NextResponse.json({
      stats: {
        totalReviews: totalReviews || 0,
        uniquePIs: uniquePICount,
        uniqueInstitutions: uniqueInstitutionCount,
        uniqueCountries: uniqueCountryCount
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 