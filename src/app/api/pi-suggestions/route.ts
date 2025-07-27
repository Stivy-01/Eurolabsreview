import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isSupabaseConfigured() {
  return supabaseUrl && supabaseAnonKey
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'pi_name' // pi_name, institution, lab_group, field
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    let suggestions: string[] = []

    switch (type) {
      case 'pi_name':
        const { data: piData } = await supabase
          .from('pi_profiles')
          .select('name, institution')
          .ilike('name', `%${query}%`)
          .order('review_count', { ascending: false })
          .limit(limit)

        suggestions = piData?.map(pi => `${pi.name} (${pi.institution})`) || []
        break

      case 'institution':
        const { data: institutionData } = await supabase
          .from('pi_profiles')
          .select('institution')
          .ilike('institution', `%${query}%`)
          .order('review_count', { ascending: false })
          .limit(limit)

        const uniqueInstitutions = [...new Set(institutionData?.map(item => item.institution) || [])]
        suggestions = uniqueInstitutions.slice(0, limit)
        break

      case 'lab_group':
        const { data: labData } = await supabase
          .from('pi_profiles')
          .select('lab_group_name')
          .not('lab_group_name', 'is', null)
          .ilike('lab_group_name', `%${query}%`)
          .order('review_count', { ascending: false })
          .limit(limit)

        const uniqueLabGroups = [...new Set(labData?.map(item => item.lab_group_name).filter(Boolean) || [])]
        suggestions = uniqueLabGroups.slice(0, limit)
        break

      case 'field':
        const { data: fieldData } = await supabase
          .from('pi_profiles')
          .select('field')
          .not('field', 'is', null)
          .ilike('field', `%${query}%`)
          .order('review_count', { ascending: false })
          .limit(limit)

        const uniqueFields = [...new Set(fieldData?.map(item => item.field).filter(Boolean) || [])]
        suggestions = uniqueFields.slice(0, limit)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid suggestion type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      suggestions,
      query,
      type 
    })

  } catch (error) {
    console.error('PI suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
} 