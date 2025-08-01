import React, { useState } from 'react'
import { MessageCircle, Phone, Clock, Tag, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import type { Contact } from '../types'
import { ChatModal } from './ChatModal'

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  const [showChat, setShowChat] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (isBlocked: boolean, lastActive: string | null) => {
    if (isBlocked) return 'bg-red-100 text-red-800'
    if (lastActive) {
      const lastActiveDate = new Date(lastActive)
      const now = new Date()
      const diffHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60)
      
      if (diffHours < 1) return 'bg-green-100 text-green-800'
      if (diffHours < 24) return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (isBlocked: boolean, lastActive: string | null) => {
    if (isBlocked) return 'Bloqueado'
    if (lastActive) {
      const lastActiveDate = new Date(lastActive)
      const now = new Date()
      const diffHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60)
      
      if (diffHours < 1) return 'Online'
      if (diffHours < 24) return 'Ativo hoje'
    }
    return 'Inativo'
  }

  return (
    <>
      <div className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {contact.profile_picture_url ? (
                <img
                  src={contact.profile_picture_url}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {contact.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.is_blocked, contact.last_active_utc)}`}>
                  {getStatusText(contact.is_blocked, contact.last_active_utc)}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Phone className="h-4 w-4 mr-2" />
                <span>{formatPhone(contact.phone_number)}</span>
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {contact.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: tag.color + '20',
                        color: tag.color
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Last Message Preview */}
              {contact.last_message && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {contact.last_message.content}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{contact.last_message.source === 'Contact' ? 'Cliente' : 'Atendente'}</span>
                    <span>{formatDate(contact.last_message.event_at_utc)}</span>
                  </div>
                </div>
              )}

              {/* Expandable Details */}
              {expanded && (
                <div className="space-y-3 border-t pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Último acesso:</span>
                      <p className="text-gray-900">{formatDate(contact.last_active_utc)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tempo de resposta:</span>
                      <p className="text-gray-900">
                        {contact.response_time ? `${contact.response_time} min` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Tipo:</span>
                      <p className="text-gray-900">{contact.contact_type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Cadastrado em:</span>
                      <p className="text-gray-900">{formatDate(contact.created_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {contact.response_time && contact.response_time > 0 && (
              <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-1" />
                <span>{contact.response_time}min</span>
              </div>
            )}
            
            <button
              onClick={() => setShowChat(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {showChat && (
        <ChatModal
          contact={contact}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  )
}