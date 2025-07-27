'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReviewForm from '@/components/ReviewForm'

export default function SubmitReviewPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitSuccess = () => {
    router.push('/?submitted=true')
  }

  const handleSubmitError = (error: string) => {
    setSubmitError(error)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gradient-primary">EuroLabReviews</a>
            </div>
            <button
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Write a Review</h1>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">Review Guidelines</h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Be honest and constructive in your feedback</li>
                    <li>Focus on professional experiences and working conditions</li>
                    <li>Avoid personal attacks or identifying information</li>
                    <li>Your review will be moderated before publication</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <div className="mt-2 text-sm text-destructive">{submitError}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-card rounded-lg shadow-soft border">
          <ReviewForm 
            onSuccess={handleSubmitSuccess}
            onError={handleSubmitError}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      </main>
    </div>
  )
} 