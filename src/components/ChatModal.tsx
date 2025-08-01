import React, { useState, useEffect } from 'react'
import { X, Send, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Contact, Message } from '../types'

interface ChatModalProps {
  contact: Contact
  onClose: () => void
}

export function ChatModal({ contact, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [contact.id])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      
      // First get the chat for this contact
      const { data: chatData } = await supabase
        .from('chats')
        .select('id')
        .eq('contact_id', contact.id)
        .single()

      if (chatData) {
        // Then get messages for this chat
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatData.id)
          .order('event_at_utc', { ascending: true })

        if (error) throw error
        setMessages(messagesData || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {contact.profile_picture_url ? (
              <img
                src={contact.profile_picture_url}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{contact.name}</h2>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                <span>{formatPhone(contact.phone_number)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>Nenhuma mensagem encontrada para este contato.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.source === 'Contact' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.source === 'Contact'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs ${
                        message.source === 'Contact' ? 'text-gray-500' : 'text-blue-100'
                      }`}
                    >
                      {message.source === 'Contact' ? 'Cliente' : 'Atendente'}
                    </span>
                    <span
                      className={`text-xs ${
                        message.source === 'Contact' ? 'text-gray-500' : 'text-blue-100'
                      }`}
                    >
                      {formatDate(message.event_at_utc)}
                    </span>
                  </div>
                  {message.message_state && (
                    <div className="mt-1">
                      <span
                        className={`text-xs ${
                          message.source === 'Contact' ? 'text-gray-400' : 'text-blue-200'
                        }`}
                      >
                        {message.message_state === 'Read' ? '✓✓' : '✓'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total de mensagens:</span> {messages.length}
            </div>
            <div>
              <span className="font-medium">Tempo de resposta:</span> {contact.response_time ? `${contact.response_time} min` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}