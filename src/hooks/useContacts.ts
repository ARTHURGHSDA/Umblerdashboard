import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact, Tag } from '../types'

// Dados de exemplo para quando Supabase não estiver configurado
const mockContacts: Contact[] = [
  {
    id: 'contact_example_1',
    organization_id: 'org_example',
    name: 'João Silva',
    phone_number: '+5511999999999',
    profile_picture_url: null,
    is_blocked: false,
    last_active_utc: new Date().toISOString(),
    contact_type: 'DirectMessage',
    group_identifier: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [
      { id: 'tag_1', name: 'Cliente VIP', color: '#10B981', created_at: '', updated_at: '' },
      { id: 'tag_2', name: 'Suporte', color: '#EF4444', created_at: '', updated_at: '' }
    ],
    last_message: {
      id: 'msg_example_1',
      chat_id: 'chat_example_1',
      contact_id: 'contact_example_1',
      organization_member_id: null,
      content: 'Olá, preciso de ajuda com meu pedido',
      message_type: 'Text',
      source: 'Contact',
      message_state: 'Sent',
      is_private: false,
      event_at_utc: new Date().toISOString(),
      file_url: null,
      thumbnail_url: null,
      in_reply_to: null,
      template_id: null,
      billable: null,
      deducted_ai_credits: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    response_time: 5
  },
  {
    id: 'contact_example_2',
    organization_id: 'org_example',
    name: 'Maria Santos',
    phone_number: '+5511888888888',
    profile_picture_url: null,
    is_blocked: false,
    last_active_utc: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
    contact_type: 'DirectMessage',
    group_identifier: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [
      { id: 'tag_3', name: 'Vendas', color: '#3B82F6', created_at: '', updated_at: '' }
    ],
    last_message: {
      id: 'msg_example_2',
      chat_id: 'chat_example_2',
      contact_id: 'contact_example_2',
      organization_member_id: null,
      content: 'Gostaria de saber mais sobre seus produtos',
      message_type: 'Text',
      source: 'Contact',
      message_state: 'Delivered',
      is_private: false,
      event_at_utc: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      file_url: null,
      thumbnail_url: null,
      in_reply_to: null,
      template_id: null,
      billable: null,
      deducted_ai_credits: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    response_time: 12
  }
]

function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      setError(null)
      
      // Se Supabase não estiver configurado, usar dados de exemplo
      if (!isSupabaseConfigured()) {
        console.log('🔧 Supabase não configurado - usando dados de exemplo')
        setContacts(mockContacts)
        setLoading(false)
        return
      }

      // Fetch contacts with their tags and last message
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_tags(
            tag:tags(*)
          ),
          chats(
            id,
            updated_at,
            is_waiting,
            waiting_since_utc,
            first_contact_message_at,
            first_member_reply_at,
            messages(
              id,
              content,
              message_type,
              source,
              event_at_utc
            )
          )
        `)
        .order('updated_at', { ascending: false })

      if (contactsError) {
        console.error('Erro ao buscar contatos:', contactsError)
        throw contactsError
      }
      
      if (!contactsData || contactsData.length === 0) {
        console.log('📝 Nenhum contato encontrado - usando dados de exemplo')
        setContacts(mockContacts)
        return
      }

      // Transform the data to match our Contact interface
      const transformedContacts: Contact[] = contactsData?.map(contact => {
        const tags = contact.contact_tags?.map((ct: any) => ct.tag).filter(Boolean) || []
        const chat = contact.chats?.[0]
        const lastMessage = chat?.messages?.sort((a: any, b: any) => 
          new Date(b.event_at_utc).getTime() - new Date(a.event_at_utc).getTime()
        )?.[0]
        
        // Calculate response time if we have both timestamps
        let responseTime = 0
        if (chat?.first_contact_message_at && chat?.first_member_reply_at) {
          const contactTime = new Date(chat.first_contact_message_at).getTime()
          const replyTime = new Date(chat.first_member_reply_at).getTime()
          responseTime = Math.round((replyTime - contactTime) / 1000 / 60) // minutes
        }

        return {
          ...contact,
          tags,
          last_message: lastMessage,
          response_time: responseTime
        }
      }) || []

      setContacts(transformedContacts)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contatos'
      setError(errorMessage)
      console.error('Erro no useContacts:', err)
      
      // Em caso de erro, usar dados de exemplo
      console.log('🔄 Usando dados de exemplo devido ao erro')
      setContacts(mockContacts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()

    // Só configurar real-time se Supabase estiver configurado
    if (!isSupabaseConfigured()) {
      return
    }

    // Subscribe to real-time updates
    const contactsSubscription = supabase
      .channel('contacts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        (payload) => {
          console.log('Mudança em contacts:', payload)
          fetchContacts()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' }, 
        (payload) => {
          console.log('Mudança em messages:', payload)
          fetchContacts()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chats' }, 
        (payload) => {
          console.log('Mudança em chats:', payload)
          fetchContacts()
        }
      )
      .subscribe()

    // Polling como fallback (atualiza a cada 30 segundos)
    const pollInterval = setInterval(() => {
      fetchContacts()
    }, 30000)

    return () => {
      supabase.removeChannel(contactsSubscription)
      clearInterval(pollInterval)
    }
  }, [fetchContacts])

  return { contacts, loading, error, refetch: fetchContacts }
}