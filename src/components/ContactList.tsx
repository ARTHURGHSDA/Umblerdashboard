import React, { useState, useMemo } from 'react'
import { useContacts } from '../hooks/useContacts'
import { useTags } from '../hooks/useTags'
import { ContactCard } from './ContactCard'
import { TagFilter } from './TagFilter'
import { Search, Filter } from 'lucide-react'

export function ContactList() {
  const { contacts, loading } = useContacts()
  const { tags } = useTags()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'active'>('all')

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Search filter
      const matchesSearch = !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone_number.includes(searchTerm)

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tagId => 
          contact.tags?.some(tag => tag.id === tagId)
        )

      return matchesSearch && matchesTags
    })
  }, [contacts, searchTerm, selectedTags])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar contatos por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex-shrink-0">
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          {/* Status Filter */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'waiting' | 'active')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="waiting">Aguardando</option>
              <option value="active">Ativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Contatos ({filteredContacts.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredContacts.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum contato encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou aguarde novos contatos chegarem via webhook.
              </p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}