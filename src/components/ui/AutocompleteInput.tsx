'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  type: 'pi_name' | 'institution' | 'lab_group' | 'field'
  className?: string
  error?: string
  label?: string
  required?: boolean
}

interface Suggestion {
  suggestions: string[]
  query: string
  type: string
}

export default function AutocompleteInput({
  value,
  onChange,
  onBlur,
  placeholder,
  type,
  className = '',
  error,
  label,
  required = false
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/pi-suggestions?q=${encodeURIComponent(query)}&type=${type}&limit=8`)
      if (response.ok) {
        const data: Suggestion = await response.json()
        setSuggestions(data.suggestions)
        setIsOpen(data.suggestions.length > 0)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [type])

  // Debounce the suggestions fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value, fetchSuggestions])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    // For PI names, extract just the name without institution
    const finalValue = type === 'pi_name' ? suggestion.split(' (')[0] : suggestion
    onChange(finalValue)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle input blur
  const handleBlur = () => {
    // Delay to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
      onBlur?.()
    }, 150)
  }

  const baseClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 text-black placeholder-gray-500 ${
    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
  }`

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${baseClassName} ${className}`}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === selectedIndex
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              {type === 'pi_name' ? (
                <div className="flex flex-col">
                  <span className="font-medium">{suggestion.split(' (')[0]}</span>
                  <span className="text-xs text-gray-500">
                    {suggestion.includes('(') ? suggestion.split(' (')[1]?.replace(')', '') : ''}
                  </span>
                </div>
              ) : (
                <span>{suggestion}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
} 