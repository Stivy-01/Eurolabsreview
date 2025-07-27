// ImmersiveReviewForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReviewForm from '@/components/ReviewForm'
import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import AutocompleteInput from '../src/components/ui/AutocompleteInput'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface ReviewFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i)

export default function ImmersiveReviewForm({ onSuccess, onError, isSubmitting, setIsSubmitting }: ReviewFormProps) {
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
    reviewText: ''
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
    if (formData.reviewText.length < 50 || formData.piName.length < 2 || formData.institution.length < 2) {
      setErrors({ reviewText: 'Minimum 50 characters required', piName: 'Required', institution: 'Required' })
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
      onSuccess()
    } catch (err) {
      onError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 space-y-6"
    >
      <h1 className="text-2xl font-bold text-center text-indigo-900">🧪 Share Your Lab Experience</h1>

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
          <label className="text-sm font-medium text-gray-700 mb-1 block">Position</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500"
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
          <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-indigo-500"
            value={formData.year}
            onChange={e => handleChange('year', Number(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-900">Overall Rating</span>
        <span className="text-xl font-bold text-indigo-700">{averageRating.toFixed(1)} / 5.0</span>
      </div>

      <div className="space-y-4 pt-4">
        {Object.entries(formData.ratings).map(([key, val]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 capitalize">{key.replace(/_/g, ' ')}</label>
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
        <label className="text-sm font-semibold text-gray-700">Your Review</label>
        <Textarea
          value={formData.reviewText}
          onChange={e => handleReviewTextChange(e.target.value)}
          placeholder="Share your experience constructively..."
          rows={5}
        />
        <p className="text-xs text-right text-gray-500">{formData.reviewText.length} / 2000</p>
        {moderationStatus === 'rejected' && <p className="text-sm text-red-500">Please revise content</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || moderationStatus === 'rejected'}
        className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isSubmitting ? 'Submitting...' : '🚀 Submit Review'}
      </Button>
    </motion.form>
  )
}
