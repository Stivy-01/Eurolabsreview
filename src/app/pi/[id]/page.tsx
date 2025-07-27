'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Review, PIProfile } from '@/lib/supabase'
import ReviewCard from '@/components/ReviewCard'

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">({rating.toFixed(1)})</span>
    </div>
  )
}

export default function PIProfilePage() {
  const params = useParams()
  const piId = params.id as string
  
  const [profile, setProfile] = useState<PIProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  useEffect(() => {
    if (piId) {
      fetchPIData()
    }
  }, [piId])

  const fetchPIData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch PI profile
      const profileResponse = await fetch(`/api/pi-profiles/${piId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }
      
      // Fetch reviews for this PI
      const reviewsResponse = await fetch(`/api/reviews?pi_id=${piId}&limit=50`)
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        setReviews(reviewsData.reviews || [])
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PI data')
    } finally {
      setLoading(false)
    }
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest':
        const avgA = (a.ratings.supervision + a.ratings.communication + a.ratings.career_help + a.ratings.work_life_balance + a.ratings.lab_environment) / 5
        const avgB = (b.ratings.supervision + b.ratings.communication + b.ratings.career_help + b.ratings.work_life_balance + b.ratings.lab_environment) / 5
        return avgB - avgA
      case 'lowest':
        const avgA2 = (a.ratings.supervision + a.ratings.communication + a.ratings.career_help + a.ratings.work_life_balance + a.ratings.lab_environment) / 5
        const avgB2 = (b.ratings.supervision + b.ratings.communication + b.ratings.career_help + b.ratings.work_life_balance + b.ratings.lab_environment) / 5
        return avgA2 - avgB2
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">EuroLabReviews</Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">EuroLabReviews</Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchPIData}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">EuroLabReviews</Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">PI profile not found</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium mt-4 inline-block">
              ← Back to search
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gradient-primary">
              EuroLabReviews
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/submit" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Write Review
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PI Profile Header */}
        <div className="bg-gradient-card rounded-lg shadow-soft border p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {profile.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">{profile.institution}</p>
              {profile.field && (
                <p className="text-lg text-muted-foreground mb-6">{profile.field}</p>
              )}
              
              <div className="flex items-center space-x-8">
                <div>
                  <StarRating rating={profile.average_rating || 0} />
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">{profile.review_count}</span> review{profile.review_count !== 1 ? 's' : ''}
                </div>
                {profile.country && (
                  <div className="text-muted-foreground">
                    📍 {profile.country}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <Link
                href="/submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
              >
                Write Review
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Reviews ({reviews.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gradient-card rounded-lg shadow-soft border">
            <p className="text-muted-foreground mb-4">No reviews yet for this PI</p>
            <Link
              href="/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
            >
              Write the first review
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 