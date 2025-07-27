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

    // Get unique institutions
    const { data: institutions, error: institutionsError } = await supabase
      .from('reviews')
      .select('institution')
      .eq('is_approved', true)

    if (institutionsError) {
      console.error('Error fetching institutions:', institutionsError)
      return NextResponse.json(
        { error: 'Failed to fetch institutions' },
        { status: 500 }
      )
    }

    const uniqueInstitutions = [...new Set(institutions?.map(review => review.institution).filter(Boolean))].sort()

    // Get unique fields
    const { data: fields, error: fieldsError } = await supabase
      .from('reviews')
      .select('field')
      .eq('is_approved', true)
      .not('field', 'is', null)

    if (fieldsError) {
      console.error('Error fetching fields:', fieldsError)
      return NextResponse.json(
        { error: 'Failed to fetch fields' },
        { status: 500 }
      )
    }

    const uniqueFields = [...new Set(fields?.map(review => review.field).filter(Boolean))].sort()

    // Get unique positions
    const { data: positions, error: positionsError } = await supabase
      .from('reviews')
      .select('position')
      .eq('is_approved', true)

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return NextResponse.json(
        { error: 'Failed to fetch positions' },
        { status: 500 }
      )
    }

    const uniquePositions = [...new Set(positions?.map(review => review.position).filter(Boolean))].sort()

    // Detect countries from institutions
    const countryKeywords = {
      'Germany': ['germany', 'deutschland', 'berlin', 'munich', 'heidelberg', 'max planck', 'tübingen', 'freiburg'],
      'France': ['france', 'paris', 'curie', 'pasteur', 'cnrs', 'lyon', 'marseille'],
      'Netherlands': ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'delft', 'utrecht', 'leiden'],
      'Switzerland': ['switzerland', 'zurich', 'geneva', 'basel', 'eth', 'epfl', 'bern'],
      'UK': ['united kingdom', 'uk', 'england', 'london', 'cambridge', 'oxford', 'manchester', 'edinburgh'],
      'Italy': ['italy', 'rome', 'milan', 'turin', 'bologna', 'pisa'],
      'Spain': ['spain', 'madrid', 'barcelona', 'valencia', 'seville'],
      'Sweden': ['sweden', 'stockholm', 'uppsala', 'gothenburg', 'lund'],
      'Denmark': ['denmark', 'copenhagen', 'aarhus'],
      'Norway': ['norway', 'oslo', 'bergen', 'trondheim'],
      'Finland': ['finland', 'helsinki', 'tampere', 'turku'],
      'Belgium': ['belgium', 'brussels', 'leuven', 'ghent'],
      'Austria': ['austria', 'vienna', 'salzburg', 'innsbruck'],
      'Poland': ['poland', 'warsaw', 'krakow', 'wroclaw'],
      'Czech Republic': ['czech', 'prague', 'brno'],
      'Hungary': ['hungary', 'budapest', 'szeged'],
      'Portugal': ['portugal', 'lisbon', 'porto'],
      'Ireland': ['ireland', 'dublin', 'cork'],
      'Greece': ['greece', 'athens', 'thessaloniki']
    }

    const detectedCountries = new Set<string>()
    
    institutions?.forEach(review => {
      const institution = review.institution?.toLowerCase()
      if (institution) {
        for (const [country, keywords] of Object.entries(countryKeywords)) {
          if (keywords.some(keyword => institution.includes(keyword))) {
            detectedCountries.add(country)
            break
          }
        }
      }
    })

    const uniqueCountries = Array.from(detectedCountries).sort()

    return NextResponse.json({
      filterOptions: {
        countries: uniqueCountries,
        institutions: uniqueInstitutions,
        fields: uniqueFields,
        positions: uniquePositions
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