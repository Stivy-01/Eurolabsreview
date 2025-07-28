import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        error: 'Supabase not configured',
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
        }
      }, { status: 503 })
    }

    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('reviews')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: connectionError.message,
        code: connectionError.code,
        hint: connectionError.code === 'PGRST116' ? 'Table "reviews" might not exist' : 'Check your Supabase configuration'
      }, { status: 500 })
    }

    // Test 2: Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'reviews' })
      .single()

    return NextResponse.json({
      status: 'Supabase connection successful',
      connectionTest: connectionTest,
      tableExists: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 