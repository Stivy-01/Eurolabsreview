'use client'

import { useState, useCallback } from 'react'
import AutocompleteInput from '@/components/ui/AutocompleteInput'

interface ReviewFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
}

interface FormData {
  piName: string
  institution: string
  labGroupName: string
  field: string
  position: 'PhD' | 'Postdoc' | 'Intern' | 'Visitor' | ''
  year: number
  ratings: {
    supervision: number
    communication: number
    career_help: number
    work_life_balance: number
    lab_environment: number
  }
  reviewText: string
}

interface FormErrors {
  piName?: string
  institution?: string
  labGroupName?: string
  field?: string
  position?: string
  reviewText?: string
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i)

export default function ReviewForm({ onSuccess, onError, isSubmitting, setIsSubmitting }: ReviewFormProps) {
  const [formData, setFormData] = useState<FormData>({
    piName: '',
    institution: '',
    labGroupName: '',
    field: '',
    position: '',
    year: currentYear,
    ratings: {
      supervision: 3,
      communication: 3,
      career_help: 3,
      work_life_balance: 3,
      lab_environment: 3
    },
    reviewText: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [moderationStatus, setModerationStatus] = useState<'idle' | 'checking' | 'approved' | 'rejected'>('idle')

  // Real-time validation
  const validateField = useCallback((field: keyof FormData, value: any) => {
    const newErrors: FormErrors = {}
    
    switch (field) {
      case 'piName':
        if (!value.trim()) {
          newErrors.piName = 'PI name is required'
        } else if (value.trim().length < 2) {
          newErrors.piName = 'PI name must be at least 2 characters'
        } else if (value.trim().length > 100) {
          newErrors.piName = 'PI name must be less than 100 characters'
        }
        break
        
      case 'institution':
        if (!value.trim()) {
          newErrors.institution = 'Institution is required'
        } else if (value.trim().length < 2) {
          newErrors.institution = 'Institution name must be at least 2 characters'
        } else if (value.trim().length > 200) {
          newErrors.institution = 'Institution name must be less than 200 characters'
        }
        break
        
      case 'labGroupName':
        // Lab group name is optional, but if provided, validate length
        if (value.trim() && value.trim().length > 100) {
          newErrors.labGroupName = 'Lab group name must be less than 100 characters'
        }
        break
        
      case 'field':
        // Field is optional, but if provided, validate length
        if (value.trim() && value.trim().length > 100) {
          newErrors.field = 'Field name must be less than 100 characters'
        }
        break
        
      case 'position':
        if (!value) {
          newErrors.position = 'Position is required'
        }
        break
        
      case 'reviewText':
        if (value.length < 50) {
          newErrors.reviewText = 'Review must be at least 50 characters'
        } else if (value.length > 2000) {
          newErrors.reviewText = 'Review must be less than 2000 characters'
        }
        break
    }
    
    return newErrors
  }, [])

  const handleFieldChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation for touched fields
    if (touched[field] && field in { piName: '', institution: '', labGroupName: '', field: '', position: '', reviewText: '' }) {
      const fieldErrors = validateField(field, value)
      setErrors(prev => ({ ...prev, ...fieldErrors }))
    }
  }

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const fieldErrors = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, ...fieldErrors }))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    
    // Only validate fields that can have errors
    const fieldsToValidate: (keyof FormData)[] = ['piName', 'institution', 'labGroupName', 'field', 'position', 'reviewText']
    
    fieldsToValidate.forEach(field => {
      const fieldErrors = validateField(field, formData[field])
      Object.assign(newErrors, fieldErrors)
    })
    
    setErrors(newErrors)
    setTouched({ piName: true, institution: true, labGroupName: true, field: true, position: true, reviewText: true })
    return Object.keys(newErrors).length === 0
  }

  // Check moderation in real-time as user types
  const checkModeration = useCallback(async (text: string) => {
    if (text.length < 10) {
      setModerationStatus('idle')
      return
    }
    
    setModerationStatus('checking')
    
    try {
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setModerationStatus('approved')
      } else {
        setModerationStatus('rejected')
      }
    } catch (error) {
      setModerationStatus('idle')
    }
  }, [])

  // Debounced moderation check
  const handleReviewTextChange = (value: string) => {
    handleFieldChange('reviewText', value)
    
    // Debounce moderation check
    const timeoutId = setTimeout(() => {
      if (value.length >= 10) {
        checkModeration(value)
      } else {
        setModerationStatus('idle')
      }
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // First, moderate the content
      const moderationResponse = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.reviewText })
      })
      
      const moderationData = await moderationResponse.json()
      
      if (!moderationResponse.ok) {
        throw new Error(moderationData.reason || 'Content moderation failed')
      }
      
      if (moderationData.status === 'REJECTED') {
        onError(moderationData.reason || 'Your review contains inappropriate content. Please revise and try again.')
        return
      }
      
      // Submit the review
      const reviewResponse = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pi_name: formData.piName,
          institution: formData.institution,
          lab_group_name: formData.labGroupName || null,
          field: formData.field || null,
          position: formData.position,
          year: formData.year,
          ratings: formData.ratings,
          review_text: formData.reviewText
        })
      })
      
      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }
      
      onSuccess()
      
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const RatingSlider = ({ 
    label, 
    value, 
    onChange,
    description 
  }: { 
    label: string
    value: number
    onChange: (value: number) => void
    description?: string
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-primary mb-2">
        {label}: <span className="text-primary font-semibold">{value}/5</span>
      </label>
      {description && (
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
      )}
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, oklch(0.488 0.243 264.376) 0%, oklch(0.488 0.243 264.376) ${((value-1)/4)*100}%, oklch(0.97 0.001 106.424) ${((value-1)/4)*100}%, oklch(0.97 0.001 106.424) 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Poor (1)</span>
        <span>Fair (2)</span>
        <span>Good (3)</span>
        <span>Very Good (4)</span>
        <span>Excellent (5)</span>
      </div>
    </div>
  )

  const averageRating = (
    formData.ratings.supervision +
    formData.ratings.communication +
    formData.ratings.career_help +
    formData.ratings.work_life_balance +
    formData.ratings.lab_environment
  ) / 5

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* PI Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="PI Name"
          required
          value={formData.piName}
          onChange={(value) => handleFieldChange('piName', value)}
          onBlur={() => handleBlur('piName')}
          type="pi_name"
          placeholder="Dr. Jane Smith"
          error={errors.piName}
        />
        
        <AutocompleteInput
          label="Institution"
          required
          value={formData.institution}
          onChange={(value) => handleFieldChange('institution', value)}
          onBlur={() => handleBlur('institution')}
          type="institution"
          placeholder="University of Cambridge"
          error={errors.institution}
        />
      </div>
      
      {/* Lab Group and Field Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <AutocompleteInput
          label="Lab/Group Name"
          value={formData.labGroupName}
          onChange={(value) => handleFieldChange('labGroupName', value)}
          onBlur={() => handleBlur('labGroupName')}
          type="lab_group"
          placeholder="e.g., Computational Biology Lab, Smith Research Group"
          error={errors.labGroupName}
        />
        
        <AutocompleteInput
          label="Academic Field"
          value={formData.field}
          onChange={(value) => handleFieldChange('field', value)}
          onBlur={() => handleBlur('field')}
          type="field"
          placeholder="e.g., Computer Science, Biology, Physics"
          error={errors.field}
        />
      </div>
      
      {/* Position and Year */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Your Position *
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleFieldChange('position', e.target.value as FormData['position'])}
            onBlur={() => handleBlur('position')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-primary bg-background ${
              errors.position ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary focus:border-primary'
            }`}
          >
            <option value="">Select position</option>
            <option value="PhD">PhD Student</option>
            <option value="Postdoc">Postdoc</option>
            <option value="Intern">Intern</option>
            <option value="Visitor">Visiting Researcher</option>
          </select>
          {errors.position && <p className="mt-1 text-sm text-destructive">{errors.position}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Year
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleFieldChange('year', Number(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-primary bg-background"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Overall Rating Display */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">Overall Rating:</span>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-primary ml-1">/5.0</span>
          </div>
        </div>
      </div>
      
      {/* Ratings */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-primary mb-6">Rate Your Experience</h3>
        <div className="space-y-4">
          <RatingSlider
            label="Supervision Quality"
            description="How well did the PI guide and mentor you?"
            value={formData.ratings.supervision}
            onChange={(value) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, supervision: value }
            })}
          />
          
          <RatingSlider
            label="Communication"
            description="How effectively did the PI communicate with you?"
            value={formData.ratings.communication}
            onChange={(value) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, communication: value }
            })}
          />
          
          <RatingSlider
            label="Career Support"
            description="How much did the PI help with your career development?"
            value={formData.ratings.career_help}
            onChange={(value) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, career_help: value }
            })}
          />
          
          <RatingSlider
            label="Work-Life Balance"
            description="How reasonable were the work expectations and hours?"
            value={formData.ratings.work_life_balance}
            onChange={(value) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, work_life_balance: value }
            })}
          />
          
          <RatingSlider
            label="Lab Environment"
            description="How positive and productive was the lab atmosphere?"
            value={formData.ratings.lab_environment}
            onChange={(value) => setFormData({
              ...formData,
              ratings: { ...formData.ratings, lab_environment: value }
            })}
          />
        </div>
      </div>
      
      {/* Review Text */}
      <div className="border-t border-border pt-6">
        <label className="block text-sm font-medium text-primary mb-2">
          Your Review * (50-2000 characters)
        </label>
        <textarea
          value={formData.reviewText}
          onChange={(e) => handleReviewTextChange(e.target.value)}
          onBlur={() => handleBlur('reviewText')}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-primary bg-background placeholder-muted-foreground ${
            errors.reviewText ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary focus:border-primary'
          }`}
          placeholder="Share your experience working in this lab. Be honest and constructive..."
        />
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-4">
            {errors.reviewText && <p className="text-sm text-destructive">{errors.reviewText}</p>}
            {moderationStatus === 'checking' && (
              <div className="flex items-center text-sm text-yellow-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1"></div>
                Checking content...
              </div>
            )}
            {moderationStatus === 'approved' && (
              <div className="flex items-center text-sm text-green-600">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Content approved
              </div>
            )}
            {moderationStatus === 'rejected' && (
              <div className="flex items-center text-sm text-destructive">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Please revise content
              </div>
            )}
          </div>
          
          <p className={`text-sm ml-auto ${
            formData.reviewText.length < 50 ? 'text-destructive' : 
            formData.reviewText.length > 2000 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {formData.reviewText.length} / 50-2000
          </p>
        </div>
      </div>
      
      {/* Submit */}
      <div className="border-t border-border pt-6">
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0 || moderationStatus === 'rejected'}
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        
        {Object.keys(errors).length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Please fix the errors above before submitting
          </p>
        )}
      </div>
    </form>
  )
} 