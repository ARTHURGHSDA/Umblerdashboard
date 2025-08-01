import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Metrics } from '../types'

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalContacts: 0,
    activeChats: 0,
    waitingChats: 0,
    totalMessages: 0,
    avgResponseTime: 0,
    todayMessages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get total contacts
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

      // Get active chats
      const { count: activeChats } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('is_open', true)

      // Get waiting chats  
      const { count: waitingChats } = await supabase
        .from('chats')  
        .select('*', { count: 'exact', head: true })
        .eq('is_waiting', true)

      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      // Get today's messages
      const today = new Date().toISOString().split('T')[0]
      const { count: todayMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      // Calculate average response time
      const { data: responseData } = await supabase
        .from('chats')
        .select('first_contact_message_at, first_member_reply_at')
        .not('first_contact_message_at', 'is', null)
        .not('first_member_reply_at', 'is', null)

      let avgResponseTime = 0
      if (responseData && responseData.length > 0) {
        const responseTimes = responseData.map(chat => {
          const contactTime = new Date(chat.first_contact_message_at!).getTime()
          const replyTime = new Date(chat.first_member_reply_at!).getTime()
          return (replyTime - contactTime) / 1000 / 60 // minutes
        })
        avgResponseTime = Math.round(
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        )
      }

      setMetrics({
        totalContacts: totalContacts || 0,
        activeChats: activeChats || 0,
        waitingChats: waitingChats || 0,
        totalMessages: totalMessages || 0,
        avgResponseTime,
        todayMessages: todayMessages || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Refetch metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  return { metrics, loading, error, refetch: fetchMetrics }
}