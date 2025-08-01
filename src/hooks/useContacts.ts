import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Contact, Tag } from '../types'

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch contacts with their tags and last message
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_tags!inner(
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

      if (contactsError) throw contactsError
      
      if (!contactsData) {
        setContacts([])
        return
      }

      // Transform the data to match our Contact interface
      const transformedContacts: Contact[] = contactsData?.map(contact => {
        const tags = contact.contact_tags?.map((ct: any) => ct.tag) || []
        const chat = contact.chats?.[0]
        const lastMessage = chat?.messages?.[0]
        
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
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()

    // Subscribe to real-time updates
    const contactsSubscription = supabase
      .channel('contacts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contacts' },
        () => fetchContacts()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' }, 
        () => fetchContacts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(contactsSubscription)
    }
  }, [])

  return { contacts, loading, error, refetch: fetchContacts }
}