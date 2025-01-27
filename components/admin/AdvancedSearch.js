'use client'
import { useState } from 'react'
import { BiSearch, BiFilter } from 'react-icons/bi'

export default function AdvancedSearch({ onSearch, filters = [] }) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [suggestions, setSuggestions] = useState([])

  const handleSearch = () => {
    onSearch({
      query,
      filters: activeFilters
    })
  }

  const handleFilterChange = (filterId, value) => {
    setActiveFilters({
      ...activeFilters,
      [filterId]: value
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara..."
            className="w-full p-2 border rounded"
          />
          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border rounded-b mt-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <BiSearch className="inline-block mr-1" />
          Ara
        </button>
      </div>

      {filters.length > 0 && (
        <div className="flex gap-4">
          {filters.map(filter => (
            <div key={filter.id}>
              <label className="block text-sm mb-1">{filter.label}</label>
              <select
                value={activeFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Tümü</option>
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 