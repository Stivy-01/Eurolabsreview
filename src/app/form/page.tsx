'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AutocompleteInput from '@/components//ui/AutocompleteInput'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i)

export default function FormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
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
    reviewText: '',
    isAnonymous: true,
    reviewerName: ''
  })
  const [moderationStatus, setModerationStatus] = useState<'idle' | 'checking' | 'approved' | 'rejected'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const averageRating = Object.values(formData.ratings).reduce((a, b) => a + b, 0) / 5

  const checkModeration = useCallback(async (text: string) => {
    setModerationStatus('checking')
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setModerationStatus(res.ok ? 'approved' : 'rejected')
    } catch {
      setModerationStatus('idle')
    }
  }, [])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSliderChange = (field: keyof typeof formData.ratings, value: number) => {
    setFormData(prev => ({ ...prev, ratings: { ...prev.ratings, [field]: value } }))
  }

  const handleReviewTextChange = (value: string) => {
    handleChange('reviewText', value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (value.length >= 50) checkModeration(value)
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (formData.reviewText.length < 50) newErrors.reviewText = 'Minimum 50 characters required'
    if (formData.piName.length < 2) newErrors.piName = 'Required'
    if (formData.institution.length < 2) newErrors.institution = 'Required'
    
    // Validate reviewer name if not anonymous
    if (!formData.isAnonymous && (!formData.reviewerName || formData.reviewerName.trim().length < 2)) {
      newErrors.reviewerName = 'Please enter your name or nickname'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to submit')
      // Redirect to success page or show success message
      router.push('/submit')
    } catch (err) {
      console.error('Submission error:', err)
      setErrors({ submit: 'Failed to submit review. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSuccess = () => {
    router.push('/submit')
  }

  const onError = (error: string) => {
    setErrors({ submit: error })
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-gradient-card backdrop-blur-lg shadow-strong rounded-2xl p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-foreground">🧪 Share Your Lab Experience</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="PI Name"
            required
            value={formData.piName}
            onChange={v => handleChange('piName', v)}
            type="pi_name"
            placeholder="Dr. Jane Smith"
          />
          <AutocompleteInput
            label="Institution"
            required
            value={formData.institution}
            onChange={v => handleChange('institution', v)}
            type="institution"
            placeholder="University of Cambridge"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Lab/Group Name"
            value={formData.labGroupName}
            onChange={v => handleChange('labGroupName', v)}
            type="lab_group"
            placeholder="Smith Research Group"
          />
          <AutocompleteInput
            label="Field"
            value={formData.field}
            onChange={v => handleChange('field', v)}
            type="field"
            placeholder="e.g., Biology, Physics"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Position</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              value={formData.position}
              onChange={e => handleChange('position', e.target.value)}
            >
              <option value="">Select Position</option>
              <option value="PhD">PhD Student</option>
              <option value="Postdoc">Postdoc</option>
              <option value="Intern">Intern</option>
              <option value="Visitor">Visiting Researcher</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Year</label>
            <select
              className="w-full border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              value={formData.year}
              onChange={e => handleChange('year', Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">Overall Rating</span>
          <span className="text-xl font-bold text-primary">{averageRating.toFixed(1)} / 5.0</span>
        </div>

        <div className="space-y-4 pt-4">
          {Object.entries(formData.ratings).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</label>
              <Slider
                defaultValue={[val]}
                max={5}
                step={1}
                onValueChange={([v]) => handleSliderChange(key as keyof typeof formData.ratings, v)}
              />
            </div>
          ))}
        </div>

        <div className="pt-6 space-y-2">
          <label className="text-sm font-semibold text-muted-foreground">Your Review</label>
          <Textarea
            value={formData.reviewText}
            onChange={e => handleReviewTextChange(e.target.value)}
            placeholder="Share your experience constructively..."
            rows={5}
          />
          <p className="text-xs text-right text-muted-foreground">{formData.reviewText.length} / 2000</p>
          {moderationStatus === 'rejected' && <p className="text-sm text-destructive">Please revise content</p>}
        </div>

        {/* Reviewer Identification Section */}
        <div className="pt-6 space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={e => handleChange('isAnonymous', e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/20"
            />
            <label htmlFor="anonymous" className="text-sm font-medium text-muted-foreground">
              Keep my review anonymous
            </label>
          </div>
          
          {!formData.isAnonymous && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Your Name or Nickname
              </label>
              <Input
                value={formData.reviewerName}
                onChange={e => handleChange('reviewerName', e.target.value)}
                placeholder="Enter your name or a nickname"
                className={`border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${errors.reviewerName ? 'border-destructive' : ''}`}
              />
              {errors.reviewerName && (
                <p className="text-xs text-destructive">{errors.reviewerName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                💡 Identified reviews are more trusted and can help you network with other researchers
              </p>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {formData.isAnonymous ? (
              <span>🔒 Your review will be posted anonymously</span>
            ) : (
              <span>👤 Your review will be posted with your name: <strong>{formData.reviewerName || 'Not specified'}</strong></span>
            )}
          </div>
        </div>

        {errors.submit && (
          <div className="text-destructive text-sm text-center">{errors.submit}</div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || moderationStatus === 'rejected'}
          className="w-full rounded-full bg-gradient-primary hover:opacity-90 transition-all duration-200 shadow-soft hover:shadow-medium text-white"
        >
          {isSubmitting ? 'Submitting...' : '🚀 Submit Review'}
        </Button>
      </motion.form>
    </div>
  )
}
