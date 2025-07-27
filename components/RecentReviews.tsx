'use client'

import { useEffect, useState } from 'react'
import { Review } from '@/lib/supabase'
import ReviewCard from './ReviewCard'

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentReviews()
  }, [])

  const fetchRecentReviews = async () => {
    try {
      const response = await fetch('/api/reviews?limit=6')
      
      if (response.status === 503) {
        // Database not configured
        setError('database_not_configured')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error === 'database_not_configured') {
    return (
      <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.083 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Database Setup Required</h3>
        <div className="text-sm text-yellow-700">
          <p className="mb-4">To see reviews, please configure your Supabase database:</p>
          <ol className="text-left max-w-md mx-auto space-y-2">
            <li>1. Create a Supabase account and project</li>
            <li>2. Run the SQL schema from <code className="bg-yellow-100 px-2 py-1 rounded">supabase/schema.sql</code></li>
            <li>3. Copy your project URL and API key to <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code></li>
          </ol>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading reviews</div>
        <button 
          onClick={fetchRecentReviews}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No reviews yet</div>
        <a 
          href="/submit" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Write the first review
        </a>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
} 