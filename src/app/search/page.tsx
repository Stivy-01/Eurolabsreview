'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Review, PIProfile } from '@/lib/supabase'
import ReviewCard from '@/components/ReviewCard'
import SearchBar from '@/components/SearchBar'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [piProfiles, setPiProfiles] = useState<PIProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reviews' | 'pis'>('reviews')
  
  // Filters
  const [filters, setFilters] = useState({
    institution: '',
    position: '',
    yearFrom: '',
    yearTo: '',
    minRating: ''
  })

  useEffect(() => {
    if (query) {
      searchContent()
    }
  }, [query])

  const searchContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Search reviews
      const reviewParams = new URLSearchParams({
        limit: '20',
        ...(query && { pi_name: query }),
        ...(filters.institution && { institution: filters.institution }),
        ...(filters.position && { position: filters.position }),
        ...(filters.yearFrom && { year_from: filters.yearFrom }),
        ...(filters.yearTo && { year_to: filters.yearTo }),
        ...(filters.minRating && { min_rating: filters.minRating })
      })
      
      const reviewResponse = await fetch(`/api/reviews?${reviewParams}`)
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json()
        setReviews(reviewData.reviews || [])
      }
      
      // Search PI profiles
      const piResponse = await fetch(`/api/pi-profiles?q=${encodeURIComponent(query)}`)
      if (piResponse.ok) {
        const piData = await piResponse.json()
        setPiProfiles(piData.profiles || [])
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    searchContent()
  }

  const clearFilters = () => {
    setFilters({
      institution: '',
      position: '',
      yearFrom: '',
      yearTo: '',
      minRating: ''
    })
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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Search Results {query && `for "${query}"`}
          </h1>
          <div className="max-w-2xl">
            <SearchBar />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-card rounded-lg shadow-soft border p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-foreground">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-4">
                {/* Institution Filter */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={filters.institution}
                    onChange={(e) => setFilters({...filters, institution: e.target.value})}
                    placeholder="e.g. Cambridge"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground"
                  />
                </div>

                {/* Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Position
                  </label>
                  <select
                    value={filters.position}
                    onChange={(e) => setFilters({...filters, position: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground"
                  >
                    <option value="">All positions</option>
                    <option value="PhD">PhD Student</option>
                    <option value="Postdoc">Postdoc</option>
                    <option value="Intern">Intern</option>
                    <option value="Visitor">Visiting Researcher</option>
                  </select>
                </div>

                {/* Year Range */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Year Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.yearFrom}
                      onChange={(e) => setFilters({...filters, yearFrom: e.target.value})}
                      placeholder="From"
                      min="2015"
                      max={new Date().getFullYear()}
                      className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground"
                    />
                    <input
                      type="number"
                      value={filters.yearTo}
                      onChange={(e) => setFilters({...filters, yearTo: e.target.value})}
                      placeholder="To"
                      min="2015"
                      max={new Date().getFullYear()}
                      className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground"
                  >
                    <option value="">Any rating</option>
                    <option value="4">4+ stars</option>
                    <option value="3">3+ stars</option>
                    <option value="2">2+ stars</option>
                    <option value="1">1+ stars</option>
                  </select>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-gradient-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('pis')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'pis'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                PIs ({piProfiles.length})
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Searching...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">{error}</p>
                <button 
                  onClick={searchContent}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'reviews' && (
                  <div>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No reviews found matching your criteria.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pis' && (
                  <div>
                    {piProfiles.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No PI profiles found matching your criteria.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {piProfiles.map((profile) => (
                          <div key={profile.id} className="bg-gradient-card rounded-lg shadow-soft border p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold text-foreground mb-1">
                                  {profile.name}
                                </h3>
                                <p className="text-muted-foreground mb-2">{profile.institution}</p>
                                {profile.field && (
                                  <p className="text-sm text-muted-foreground mb-3">{profile.field}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  {profile.average_rating?.toFixed(1) || 'N/A'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {profile.review_count} review{profile.review_count !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-sm text-muted-foreground">
                                Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                              </span>
                              <Link
                                href={`/pi/${profile.id}`}
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                              >
                                View Profile →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-subtle">
        <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-soft border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-gradient-primary">
                EuroLabReviews
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading search...</p>
          </div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
} 