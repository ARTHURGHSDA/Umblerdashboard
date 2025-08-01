import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact, Tag } from '../types'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      setError(null)
      
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
      
      if (!contactsData) {
        setContacts([])
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()

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