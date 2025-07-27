import { useState } from 'react'
import { Review } from '@/lib/supabase'

interface ReviewCardProps {
  review: Review
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const averageRating = Math.round(
    (review.ratings.supervision +
     review.ratings.communication +
     review.ratings.career_help +
     review.ratings.work_life_balance +
     review.ratings.lab_environment) / 5
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="bg-gradient-card rounded-lg shadow-soft border hover:shadow-medium transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {review.pi_name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{review.institution}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StarRating rating={averageRating} />
              <span className="text-sm text-muted-foreground">({averageRating}/5)</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {review.position} • {review.year}
            </span>
          </div>
        </div>

        {/* Ratings breakdown */}
        <div className="mb-4 space-y-1">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supervision:</span>
              <span className="font-medium text-foreground">{review.ratings.supervision}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Communication:</span>
              <span className="font-medium text-foreground">{review.ratings.communication}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Career help:</span>
              <span className="font-medium text-foreground">{review.ratings.career_help}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Work-life:</span>
              <span className="font-medium text-foreground">{review.ratings.work_life_balance}/5</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">Lab environment:</span>
              <span className="font-medium text-foreground">{review.ratings.lab_environment}/5</span>
            </div>
          </div>
        </div>

        {/* Review text */}
        {review.review_text && (
          <div className="mb-4">
            <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-3'}`}>
              {review.review_text}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <span>{formatDate(review.created_at)}</span>
            {!review.is_anonymous && review.reviewer_name && (
              <div className="flex items-center space-x-1">
                <span className="text-primary">👤</span>
                <span className="font-medium text-primary">{review.reviewer_name}</span>
              </div>
            )}
            {review.is_anonymous && (
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">🔒</span>
                <span className="text-muted-foreground">Anonymous</span>
              </div>
            )}
          </div>
          {review.review_text && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 