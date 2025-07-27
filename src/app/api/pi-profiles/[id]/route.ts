import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up your Supabase environment variables.' },
        { status: 503 }
      )
    }

    const { id } = await params
    
    const { data: profile, error } = await supabase
      .from('pi_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'PI profile not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch PI profile' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ profile })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 