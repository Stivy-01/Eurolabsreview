'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type SearchType = 'all' | 'pi_name' | 'institution' | 'lab_group' | 'field'

interface Suggestion {
  suggestions: string[]
  query: string
  type: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions based on search type
  const fetchSuggestions = useCallback(async (searchQuery: string, type: SearchType) => {
    if (searchQuery.length < 2 || type === 'all') {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/pi-suggestions?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=6`)
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
  }, [])

  // Debounce suggestions fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query, searchType)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchType, fetchSuggestions])

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    const finalValue = searchType === 'pi_name' ? suggestion.split(' (')[0] : suggestion
    setQuery(finalValue)
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // Perform search immediately
    performSearch(finalValue, searchType)
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
        } else {
          performSearch(query, searchType)
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

  // Perform the actual search
  const performSearch = (searchQuery: string, type: SearchType) => {
    if (!searchQuery.trim()) return

    const params = new URLSearchParams()
    params.set('q', searchQuery.trim())
    
    if (type !== 'all') {
      params.set('type', type)
    }

    router.push(`/search?${params.toString()}`)
  }

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query, searchType)
      setIsOpen(false)
    }
  }

  const searchTypeLabels = {
    all: 'All',
    pi_name: 'PI Name',
    institution: 'Institution',
    lab_group: 'Lab Group',
    field: 'Field'
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        {/* Search type dropdown */}
        <div className="flex">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="flex-shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            {Object.entries(searchTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Search input container */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search for ${searchTypeLabels[searchType].toLowerCase()}...`}
              className="block w-full pl-10 pr-3 py-3 border-t border-b border-gray-300 leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-black"
              autoComplete="off"
            />

            {isLoading && (
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="flex-shrink-0 px-6 text-white bg-indigo-600 hover:bg-indigo-700 rounded-r-lg transition-colors font-medium border border-indigo-600"
          >
            Search
          </button>
        </div>

        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            style={{ left: '89px' }} // Offset to align with input field
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
                {searchType === 'pi_name' ? (
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
      </div>
    </form>
  )
} 