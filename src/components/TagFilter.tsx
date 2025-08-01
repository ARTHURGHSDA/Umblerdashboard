import React, { useState } from 'react'
import { ChevronDown, Tag, X } from 'lucide-react'
import type { Tag as TagType } from '../types'

interface TagFilterProps {
  tags: TagType[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagFilter({ tags, selectedTags, onTagsChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const clearAll = () => {
    onTagsChange([])
  }

  const selectedTagsData = tags.filter(tag => selectedTags.includes(tag.id))

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <Tag className="h-4 w-4 mr-2" />
        Filtrar por Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Filtrar por Tags</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map(tag => (
                <label
                  key={tag.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className="flex-1 text-sm font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTagsData.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color
              }}
            >
              {tag.name}
              <button
                onClick={() => toggleTag(tag.id)}
                className="ml-1 text-current hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}